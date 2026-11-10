import { http, HttpResponse } from "msw/http";

import { canManageTask } from "../project-assignment.types";

import {
  inviteTeamMemberSchema,
  saveProjectAssignmentsSchema,
} from "../project-assignment.schema";

import type { ProjectAssignmentData } from "../project-assignment.types";

import { makeMockProjectAssignments } from "./project-assignment.fixtures";

const store = new Map<string, ProjectAssignmentData>();

function getWorkspace(projectId: string): ProjectAssignmentData {
  const existing = store.get(projectId);

  if (existing) {
    return existing;
  }

  const created = makeMockProjectAssignments(projectId);
  store.set(projectId, created);

  return created;
}

export const projectAssignmentHandlers = [
  http.get("/api/projects/:projectId/assignments", ({ params }) => {
    const workspace = getWorkspace(String(params.projectId));

    return HttpResponse.json({
      data: structuredClone(workspace),
    });
  }),

  http.put(
    "/api/projects/:projectId/assignments",
    async ({ params, request }) => {
      const workspace = getWorkspace(String(params.projectId));

      const parsed = saveProjectAssignmentsSchema.safeParse(
        await request.json(),
      );

      if (!parsed.success) {
        return HttpResponse.json(
          {
            message: "الإسنادات غير صالحة",
            issues: parsed.error.issues,
          },
          { status: 422 },
        );
      }

      const engineerIds = new Set(
        workspace.members.filter(canManageTask).map((member) => member.id),
      );

      const executorIds = new Set(workspace.executors.map((item) => item.id));

      if (
        parsed.data.assignments.some(
          (item) =>
            (item.engineerId !== null && !engineerIds.has(item.engineerId)) ||
            (item.executorId !== null && !executorIds.has(item.executorId)),
        )
      ) {
        return HttpResponse.json(
          {
            message: "أحد المسؤولين أو المنفّذين غير متاح للإسناد",
          },
          { status: 422 },
        );
      }

      const next: ProjectAssignmentData = {
        ...workspace,
        assignments: parsed.data.assignments,
        updatedAt: new Date().toISOString(),
      };

      store.set(next.projectId, next);

      return HttpResponse.json({
        data: structuredClone(next),
      });
    },
  ),

  http.post(
    "/api/projects/:projectId/team/invitations",
    async ({ params, request }) => {
      const workspace = getWorkspace(String(params.projectId));

      const parsed = inviteTeamMemberSchema.safeParse(await request.json());

      if (!parsed.success) {
        return HttpResponse.json(
          {
            message: "بيانات الدعوة غير صالحة",
            issues: parsed.error.issues,
          },
          { status: 422 },
        );
      }

      const normalizedPhone = parsed.data.phone.replace(/[\s-]/g, "");

      if (
        workspace.members.some(
          (member) => member.phone?.replace(/[\s-]/g, "") === normalizedPhone,
        )
      ) {
        return HttpResponse.json(
          {
            message: "رقم الجوال مسجّل مسبقًا",
          },
          { status: 409 },
        );
      }

      const next: ProjectAssignmentData = {
        ...workspace,
        members: [
          ...workspace.members,
          {
            id: crypto.randomUUID(),
            name: parsed.data.name,
            phone: normalizedPhone,
            role: parsed.data.role,
            status: "invited",
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      store.set(next.projectId, next);

      return HttpResponse.json(
        { data: structuredClone(next) },
        { status: 201 },
      );
    },
  ),
];
