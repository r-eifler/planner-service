import { ActionSet } from "./action_set";

export enum GoalType {
    goalFact= 'G',
    LTL = 'LTL',
    AS = 'AS'
  }

export interface PlanProperty {
    _id?: string;
    name: string;
    project: string;
    type: string;
    formula: string;
    actionSets: ActionSet[];
    naturalLanguageDescription: string;
    isUsed: boolean;
    globalHardGoal: boolean;
    utility: number;
    ranking: number;
}