import {spawn} from 'child_process';
import * as fs from 'fs';
import request from 'request';
import { Action } from './interfaces';

export enum RunStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  FAILED = "FAILED",
  SOLVED = "SOLVED",
  UNSOLVABLE = "UNSOLVABLE"
}

const planner = "/home/rebecca/TUPLES/use_cases/beluga/apptainer/fast-downward.sif"
const plans_folder = "plans"

export class PlanRun{

    public status: RunStatus;

    constructor(public id: string, public domain_path: string, public problem_path: string) {
        this.id = id;

        this.status = RunStatus.PENDING

    }

  }

export async function schedule_run(plan_run: PlanRun, callback: string) {

    await run(plan_run);

    let data = {
        id: plan_run.id,
        status: plan_run.status,
        plan: []
    }

    if(plan_run.status == RunStatus.SOLVED){
        data.plan = get_plan(plan_run)
    }

    let payload = JSON.stringify(data);
    console.log("PAYLOAD:")
    console.log(payload)
    console.log(callback)

    const callbackRequest = new Request(callback, 
      {
          method: "POST",
          headers: {"Content-Type": "application/json"},
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

  }


function run(plan_run: PlanRun): Promise<PlanRun> {

    // create result folder
    let plan_folder_path = plans_folder + '/plan' + plan_run.id

    return new Promise(function (resolve, reject) {
      const args = [
        '--plan-file', plan_folder_path, 
        plan_run.domain_path, 
        plan_run.problem_path, 
        '--search', 'astar(hmax())'
      ]
     
      plan_run.status = RunStatus.RUNNING
      const process = spawn(planner, args);
      process.on('close', function (code) { 
        switch(code) {
          case 0:
            plan_run.status = RunStatus.SOLVED
            break;
          case 12:
            plan_run.status = RunStatus.UNSOLVABLE
            break;
          default:
            plan_run.status = RunStatus.FAILED
            break;
        }
        console.log("ReturnCode: " + code);
        resolve(plan_run);
      });
      process.on('error', function (err) {
        plan_run.status = RunStatus.FAILED
        // console.log("Error: " + err)
        reject(err);
      });
    });
  }

  
function get_plan(plan_run: PlanRun): Action[] {
  if(plan_run.status != RunStatus.SOLVED){
    return null
  }

  let plan_folder_path = plans_folder + '/plan' + plan_run.id
  let raw_plan = fs.readFileSync(plan_folder_path,'utf8');

  let raw_plan_actions = raw_plan.split('\n');
  raw_plan_actions = raw_plan_actions.filter(a => ! a.startsWith(';') && a.length > 0)

  console.log(raw_plan_actions)

  let actions: Action[] = []
  for(let raw_action of raw_plan_actions){
    const parts = raw_action.replace(')','').replace(')','').split(' ');
    const [name,...args] = parts;
    actions.push({name, arguments: args})
  }
  return actions
}

