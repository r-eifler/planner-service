
import fs from 'fs'
import { PlanningModel, toPDDL_domain, toPDDL_problem } from './pddl';

export function setupExperimentEnvironment(model: PlanningModel, goals: string, refId: string){

    const exp_folder = process.env.TEMP_RUN_FOLDERS + '/' + refId;

    fs.mkdirSync(exp_folder);

    const domain_path = exp_folder + '/domain.pddl'
    const problem_path = exp_folder + '/problem.pddl'
    const temp_goals_path = exp_folder + '/temp_goals.json'


    fs.writeFileSync(domain_path, toPDDL_domain(model));
    fs.writeFileSync(problem_path, toPDDL_problem(model));
    fs.writeFileSync(temp_goals_path, goals)

}