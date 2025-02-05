
import fs from 'fs'
import { PlanningModel, toPDDL_domain, toPDDL_problem } from '../domain/pddl';
import { PlanProperty } from '../domain/plan_property';
import { json } from 'stream/consumers';

export interface GoalDefinition {
    plan_properties: PlanProperty[],
    hard_goals: string[],
    soft_goals: string[]
}

export function setupExperimentEnvironment(model: PlanningModel, goalDefinition: GoalDefinition, expFolder: string){

    fs.mkdirSync(expFolder);

    const domain_path = expFolder + '/domain.pddl'
    const problem_path = expFolder + '/problem.pddl'
    const goals_path = expFolder + '/temp_goals.json'


    fs.writeFileSync(domain_path, toPDDL_domain(model));
    fs.writeFileSync(problem_path, toPDDL_problem(model));
    fs.writeFileSync(goals_path, JSON.stringify(goalDefinition))

}


export function cleanUpExperimentEnvironment(expFolder: string){
    fs.rmSync(expFolder, { recursive: true, force: true });
}