import { Action } from "./action_set";
import { PlanProperty } from "./plan_property";


export enum PlanRunStatus {
    pending,
    running,
    failed,
    plan_found,
    not_solvable,
    canceled,
}

export interface PlannerRequest  {
    id: string,
    callback: string,
    model: any;
    goals: PlanProperty[],
    softGoals: string[], // ids
    hardGoals: string[], // ids
}

export interface PlannerResponse  {
    id: string,
    status: PlanRunStatus,
    actions: Action[],
    runtime?: number // in sec
}

