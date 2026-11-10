export type ProjectStatus = "active" | "draft" | "closed";

export type ProjectHealth = "late" | "watch" | "on_track";

export type ProjectSort = "priority" | "nearest" | "name";

export interface Project {
  id: string;
  name: string;
  description: string;
  engineer: string;
  owner: string;
  actualProgress: number;
  plannedProgress: number;
  dueDate: string | null;
  dueLabel: string;
  deliveryNote: string;
  status: ProjectStatus;
  health: ProjectHealth | null;
}

export interface ProjectListQuery {
  status: ProjectStatus;
  sort: ProjectSort;
}

export interface ProjectListResult {
  items: Project[];
  total: number;
}

export interface ProjectOverviewMetric {
  id: string;
  title: string;
  value: string;
  valueSecondary?: string;
  description: string;
  path: string;
  tone?: "primary" | "default";
  dot?: "dark" | "orange";
  descriptionTone?: "danger";
}

export interface ProjectApprovalHighlight {
  title: string;
  description: string;
  path: string;
}

export interface ProjectHandoverHighlight {
  title: string;
  description: string;
  path: string;
}

export interface ClosedProjectHighlight {
  id: string;
  name: string;
  description: string;
  closedAtLabel: string;
}

export interface ProjectsOverview {
  description: string;
  counts: Record<ProjectStatus, number>;
  metrics: ProjectOverviewMetric[];
  approval: ProjectApprovalHighlight;
  handover: ProjectHandoverHighlight;
  recentClosed: ClosedProjectHighlight[];
}

// Create project

export type ProjectSource = "template" | "blank";
export type ProjectTemplateScope = "provider" | "company";
export type ProjectSaveAction = "draft" | "continue";

export interface ProjectTemplate {
  id: string;
  scope: ProjectTemplateScope;
  name: string;
  meta: string;
  description: string;
}

export interface ProjectManagerOption {
  id: string;
  name: string;
}

export interface ProjectCreateOptions {
  templates: ProjectTemplate[];
  managers: ProjectManagerOption[];
}

export interface ProjectFormValues {
  source: ProjectSource;
  templateId: string | null;
  name: string;
  location: string;
  owner: string;
  consultant: string;
  startDate: string;
  dueDate: string;
  managerId: string;
  siteSchedule: string;
}

export interface ProjectSaveRequest {
  values: ProjectFormValues;
  action: ProjectSaveAction;
}

export interface ProjectDraft {
  id: string;
  values: ProjectFormValues;
  stage: "basics" | "setup";
  updatedAt: string;
}
