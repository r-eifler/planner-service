import {spawn} from 'child_process';
import * as fs from 'fs';

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
    private domain: Express.Multer.File;
    private problem: Express.Multer.File;
    public status: RunStatus;

    constructor(id: string, domain: Express.Multer.File, problem: Express.Multer.File) {
        this.id = id;

        this.domain = domain
        this.problem = problem

        this.status = RunStatus.PENDING

    }


    run() {
      let that = this

      // create result folder
      let plan_folder_path = plans_folder + '/plan' + this.id

      return new Promise(function (resolve, reject) {
        const args = ['--plan-file', plan_folder_path, that.domain.path, that.problem.path, '--search', 'astar(hmax())']
        that.status = RunStatus.RUNNING
        const process = spawn(planner, args);
        process.on('close', function (code) { 
          if(code == 0){
            that.status = RunStatus.FINISHED
            console.log("Close: " + code)
          }
          resolve(code);
        });
        process.on('error', function (err) {
          that.status = RunStatus.FAILED
          reject(err);
        });
      });
    }

    get_plan(){
      if(this.status != RunStatus.FINISHED){
        return null
      }

      let plan_folder_path = plans_folder + '/plan' + this.id
      let raw_plan = fs.readFileSync(plan_folder_path,'utf8');

      let plan_actions = raw_plan.split('\n');
      return plan_actions.filter(a => ! a.startsWith(';') && a.length > 0)

    }

}
