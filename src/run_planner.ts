import {spawn} from 'child_process';
import * as fs from 'fs';
import request from 'request';

export enum RunStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  FAILED = "FAILED",
  FINISHED = "FINISHED"
}

const planner = "/home/rebecca/TUPLES/use_cases/beluga/apptainer/fast-downward.sif"
const plans_folder = "plans"

export class PlanRun{

    public id: string;
    public domain: Express.Multer.File;
    public problem: Express.Multer.File;
    public status: RunStatus;

    constructor(id: string, domain: Express.Multer.File, problem: Express.Multer.File) {
        this.id = id;

        this.domain = domain
        this.problem = problem

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

    if(plan_run.status == RunStatus.FINISHED){
        data.plan = get_plan(plan_run)
    }

    request.post(
        {
        url: callback,
        json: data,
        headers: {
            'Content-Type': 'application/json'
        }
        },
      function(error, response, body){
        // console.log(error);
        // console.log(response);
        // console.log(body);
        console.log("callback sent: " + plan_run.id)
      });

  }


function run(plan_run: PlanRun) {

    // create result folder
    let plan_folder_path = plans_folder + '/plan' + plan_run.id

    return new Promise(function (resolve, reject) {
      const args = ['--plan-file', plan_folder_path, plan_run.domain.path, plan_run.problem.path, '--search', 'astar(hmax())']
      plan_run.status = RunStatus.RUNNING
      const process = spawn(planner, args);
      process.on('close', function (code) { 
        if(code == 0){
          plan_run.status = RunStatus.FINISHED
          // console.log("Close: " + code)
        }
        resolve(code);
      });
      process.on('error', function (err) {
        plan_run.status = RunStatus.FAILED
        // console.log("Error: " + err)
        reject(err);
      });
    });
  }

  
function get_plan(plan_run: PlanRun){
  if(plan_run.status != RunStatus.FINISHED){
    return null
  }

  let plan_folder_path = plans_folder + '/plan' + plan_run.id
  let raw_plan = fs.readFileSync(plan_folder_path,'utf8');

  let plan_actions = raw_plan.split('\n');
  return plan_actions.filter(a => ! a.startsWith(';') && a.length > 0)

}

