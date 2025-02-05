import { PlannerRequest, PlanRunStatus } from "./service_communication";

export interface PlanRun {
  request: PlannerRequest,
  status: PlanRunStatus,
  experiment_path: string,
  planner: string,
  args: string[]
}
