
import fs from 'fs'
import { PlanningModel, toPDDL_domain, toPDDL_problem } from './pddl';
import { PlanProperty } from './domain/plan_property';
import { json } from 'stream/consumers';

export interface GoalDefinition {
    plan_properties: PlanProperty[],
    hard_goals: string[],
    soft_goals: string[]
}

export function setupExperimentEnvironment(model: PlanningModel, goalDefinition: GoalDefinition, refId: string){

    const exp_folder = process.env.TEMP_RUN_FOLDERS + '/' + refId;

    fs.mkdirSync(exp_folder);

    const domain_path = exp_folder + '/domain.pddl'
    const problem_path = exp_folder + '/problem.pddl'
    const goals_path = exp_folder + '/temp_goals.json'


    fs.writeFileSync(domain_path, toPDDL_domain(model));
    fs.writeFileSync(problem_path, toPDDL_problem(model));
    fs.writeFileSync(goals_path, JSON.stringify(goalDefinition))

}