import { http, HttpResponse } from "msw/http";

import { projectPlanSchema } from "../project-plan.schema";

import type {
  ProjectPlan,
  SaveProjectPlanRequest,
} from "../project-plan.types";

import type { ProjectSource } from "../projects.types";

import { buildInitialProjectPlan } from "./project-plan.fixtures";

const savedPlans = new Map<string, ProjectPlan>();

export const projectPlanHandlers = [
  http.get("/api/projects/:projectId/plan", ({ params, request }) => {
    const projectId = String(params.projectId);

    const url = new URL(request.url);

    const source: ProjectSource =
      url.searchParams.get("source") === "blank" ? "blank" : "template";

    let plan = savedPlans.get(projectId);

    if (!plan) {
      plan = buildInitialProjectPlan(projectId, source);

      savedPlans.set(projectId, plan);
    }

    return HttpResponse.json({
      data: plan,
    });
  }),

  http.put("/api/projects/:projectId/plan", async ({ params, request }) => {
    const projectId = String(params.projectId);

    const body = (await request.json()) as SaveProjectPlanRequest;

    const parsed = projectPlanSchema.safeParse(body);

    if (!parsed.success) {
      return HttpResponse.json(
        {
          message: "بيانات الخطة غير صالحة",
          issues: parsed.error.issues,
        },
        { status: 422 },
      );
    }

    const plan: ProjectPlan = {
      projectId,
      rows: parsed.data.rows,
      updatedAt: new Date().toISOString(),
    };

    savedPlans.set(projectId, plan);

    return HttpResponse.json({
      data: plan,
    });
  }),
];
