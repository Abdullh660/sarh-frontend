export type TeamRole =
  | "site_engineer"
  | "specialist_engineer"
  | "project_manager"
  | "accountant"
  | "secretary"
  | "purchasing"
  | "warehouse"
  | "specialist_contractor";

export interface ProjectTeamMember {
  id: string;
  name: string;
  role: TeamRole;
  phone?: string;
  status: "active" | "invited";
}

export interface AssignmentExecutor {
  id: string;
  name: string;
  kind: "crew" | "contractor";
}

export interface TaskAssignment {
  taskId: string;
  engineerId: string | null;
  executorId: string | null;
}

export interface ProjectAssignmentData {
  projectId: string;
  members: ProjectTeamMember[];
  executors: AssignmentExecutor[];
  assignments: TaskAssignment[];
  updatedAt: string;
}

export interface SaveProjectAssignmentsRequest {
  assignments: TaskAssignment[];
}

export interface InviteTeamMemberRequest {
  name: string;
  phone: string;
  role: TeamRole;
}

export const teamRoleLabels: Record<TeamRole, string> = {
  site_engineer: "مهندس موقع",
  specialist_engineer: "مهندس مختص",
  project_manager: "مدير المشاريع",
  accountant: "محاسب",
  secretary: "سكرتارية",
  purchasing: "مشتريات",
  warehouse: "مسؤول المخزن",
  specialist_contractor: "مقاول متخصص",
};

export function canManageTask(member: ProjectTeamMember): boolean {
  return (
    member.status === "active" &&
    ["site_engineer", "specialist_engineer", "project_manager"].includes(
      member.role,
    )
  );
}
