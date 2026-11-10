export type PlanRowKind = "phase" | "group" | "task";

export type PlanRelationType = "none" | "after" | "parallel" | "fixed";

export type PlanCheckRequirement = "photo" | "signature" | "none";

export interface PlanDependency {
  type: PlanRelationType;
  targetId: string | null;
  fixedDate: string | null;
}

export interface PlanCheck {
  id: string;
  text: string;
  requirement: PlanCheckRequirement;
}

export interface ProjectPlanRow {
  id: string;
  code: string;
  name: string;

  kind: PlanRowKind;
  level: 0 | 1 | 2;

  durationDays: number;
  dependency: PlanDependency;

  assignee: string;
  quantity: string;
  description: string;

  checks: PlanCheck[];
}

export interface ProjectPlan {
  projectId: string;
  rows: ProjectPlanRow[];
  updatedAt: string;
}

export interface SaveProjectPlanRequest {
  rows: ProjectPlanRow[];
}
