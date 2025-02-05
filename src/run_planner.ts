import {spawn} from 'child_process';
import * as fs from 'fs';
import { PlanningModel } from './pddl';
import { Job } from '@hokify/agenda';
import { PlanRunStatus } from './domain/service_communication';
import { Action } from './domain/action_set';


const plans_folder = "plans"

export interface PlanRun {
  id: string,
  model: PlanningModel,
  status: PlanRunStatus,
  experiment_path: string,
  planner: string,
  args: string[]
}


export function create_temp_goal_plan_run(id: string, model: PlanningModel): PlanRun {
  return {
    id,
    model,
    status: PlanRunStatus.pending,
    experiment_path: process.env.TEMP_RUN_FOLDERS + '/' + id,
    planner: process.env.PLANNER_SERVICE_PLANNER,
    args: [
      '--plan-file', 'plan', 
      'domain.pddl', 
      'problem.pddl', 
      '--translate-options',
      '--explanation-settings', 'temp_goals.json',
      '--search-options',
      '--search', 'astar(hmax())'
    ]
  }
}



export async function schedule_run(plan_run: PlanRun, callback: string, job: Job<any>) {

    const sendBack = await run(plan_run, job);
    if(! sendBack){
      console.log('Do not send response');
      return
    }

    let data = {
        id: plan_run.id,
        status: plan_run.status,
        actions: []
    }

    if(plan_run.status == PlanRunStatus.plan_found){
        data.actions = get_plan(plan_run)
    }

    let payload = JSON.stringify(data);
    console.log("PAYLOAD:")
    console.log(payload)
    console.log(callback)

    const callbackRequest = new Request(callback, 
      {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + process.env.PLANNER_KEY
          },
          body: payload,
      }
    )

    fetch(callbackRequest).then
            (resp => {
              console.log("callback sent: " + plan_run.id)
              console.log("got response:", resp.status)
            },
            error => console.log(error)
        )

      // clean up
      fs.rmSync(plan_run.experiment_path, { recursive: true, force: true });

  }


function run(plan_run: PlanRun, job: Job<any>): Promise<boolean> {


    return new Promise(function (resolve, reject) {

      // check if run has not already been done/ experiment folder still exists
      if(!fs.existsSync(plan_run.experiment_path)){
        console.log('Experiment folder does not exists anymore');
        return resolve(false)
      }

      plan_run.status = PlanRunStatus.running
      let args = plan_run.args

      // console.log(plan_run.planner + ' ' + args.join(' '))

      const options = {
        cwd: plan_run.experiment_path,
        env: process.env,
      };

      let planProcess = null;
      try{
        planProcess = spawn(plan_run.planner, args, options);
      }
      catch(err){
        plan_run.status = PlanRunStatus.failed
        resolve(true);
      }

      job.attrs.data.push(planProcess.pid);
      job.save();

      if(process.env.DEBUG == 'true'){
        planProcess.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });
        
        planProcess.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
        });
      }

      planProcess.on('close', function (code) { 
        switch(code) {
          case 0:
            plan_run.status = PlanRunStatus.plan_found;
            break;
          case 12:
            plan_run.status = PlanRunStatus.not_solvable;
            break;
          default:
            plan_run.status = PlanRunStatus.failed;
            break;
        }
        console.log("ReturnCode: " + code);
        return resolve(true);
      });
      planProcess.on('error', function (err) {
        plan_run.status = PlanRunStatus.failed;
        return reject(true);
      });
    });
  }

  
function get_plan(plan_run: PlanRun): Action[] {
  if(plan_run.status != PlanRunStatus.plan_found){
    return null
  }

  let action_names = plan_run.model.actions.map(a => a.name)

  let plan_folder_path = plan_run.experiment_path + '/plan'
  let raw_plan = fs.readFileSync(plan_folder_path,'utf8');

  let raw_plan_actions = raw_plan.split('\n');
  raw_plan_actions = raw_plan_actions.filter(a => ! a.startsWith(';') && a.length > 0)

  console.log(raw_plan_actions)

  let actions: Action[] = []
  for(let raw_action of raw_plan_actions){
    const parts = raw_action.replace(')','').replace('(','').split(' ');
    
    if(! action_names.includes(parts[0])){
      continue;
    }

    const [name,...args] = parts;
    actions.push({name, params: args})
  }
  return actions
}

