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
