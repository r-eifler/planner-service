import { Action } from "./action_set";
import { PlanProperty } from "./plan_property";


export enum PlanRunStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    SOLVED = "SOLVED",
    UNSOLVABLE = "UNSOLVABLE",
    NO_PLAN_FOUND = "NO_PLAN_FOUND",
    CANCELED = "CANCELED",
    FAILED = "FAILED",
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

