import { http, HttpResponse } from "msw/http";

import { projectDraftSchema, projectSubmitSchema } from "../projects.schema";

import type {
  Project,
  ProjectDraft,
  ProjectFormValues,
  ProjectHealth,
  ProjectSaveAction,
  ProjectSaveRequest,
  ProjectSort,
  ProjectStatus,
} from "../projects.types";

import { mockProjects, mockProjectsOverview } from "./projects.fixtures";

import {
  initialProjectDrafts,
  mockCreateOptions,
} from "./projects.create-fixtures";

let drafts: ProjectDraft[] = initialProjectDrafts.map((draft) => ({
  ...draft,
  values: { ...draft.values },
}));

const projects: Project[] = [...mockProjects];

function toListProject(draft: ProjectDraft): Project {
  const values = draft.values;

  const manager = mockCreateOptions.managers.find(
    (item) => item.id === values.managerId,
  );

  return {
    id: draft.id,
    name: values.name || "مشروع بدون اسم",
    description: values.source === "blank" ? "خطة فاضية" : "مشروع من قالب",
    engineer: manager?.name ?? "غير محدد",
    owner: values.owner || "غير محدد",
    actualProgress: 0,
    plannedProgress: 0,
    dueDate: values.dueDate || null,
    dueLabel: values.dueDate || "لم يُحدد",
    deliveryNote:
      draft.stage === "setup" ? "بانتظار التفصيل والعلاقات" : "مسودة",
    status: "draft",
    health: null,
  };
}

for (const draft of drafts) {
  if (!projects.some((project) => project.id === draft.id)) {
    projects.push(toListProject(draft));
  }
}

function upsertProject(draft: ProjectDraft) {
  const project = toListProject(draft);

  const index = projects.findIndex((item) => item.id === draft.id);

  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.unshift(project);
  }
}

function saveDraft(
  id: string,
  values: ProjectFormValues,
  action: ProjectSaveAction,
): ProjectDraft {
  const draft: ProjectDraft = {
    id,
    values,
    stage: action === "continue" ? "setup" : "basics",
    updatedAt: new Date().toISOString(),
  };

  const index = drafts.findIndex((item) => item.id === id);

  if (index >= 0) {
    drafts[index] = draft;
  } else {
    drafts.unshift(draft);
  }

  upsertProject(draft);

  return draft;
}

function getCounts(): Record<ProjectStatus, number> {
  const active = projects.filter(
    (project) => project.status === "active",
  ).length;

  const draft = projects.filter((project) => project.status === "draft").length;

  const closed = projects.filter(
    (project) => project.status === "closed",
  ).length;

  return {
    active,
    draft,
    closed: Math.max(closed, mockProjectsOverview.counts.closed),
  };
}

const healthPriority: Record<ProjectHealth, number> = {
  late: 0,
  watch: 1,
  on_track: 2,
};

function sortProjects(items: Project[], sort: ProjectSort): Project[] {
  return [...items].sort((a, b) => {
    if (sort === "name") {
      return a.name.localeCompare(b.name, "ar");
    }

    if (sort === "nearest") {
      const first = a.dueDate ? Date.parse(a.dueDate) : Number.MAX_SAFE_INTEGER;

      const second = b.dueDate
        ? Date.parse(b.dueDate)
        : Number.MAX_SAFE_INTEGER;

      return first - second;
    }

    const first = a.health ? healthPriority[a.health] : 3;

    const second = b.health ? healthPriority[b.health] : 3;

    return first - second;
  });
}

function parseStatus(value: string | null): ProjectStatus {
  if (value === "draft" || value === "closed") {
    return value;
  }

  return "active";
}

function parseSort(value: string | null): ProjectSort {
  if (value === "nearest" || value === "name") {
    return value;
  }

  return "priority";
}

function validateSaveRequest(body: ProjectSaveRequest) {
  const schema =
    body.action === "continue" ? projectSubmitSchema : projectDraftSchema;

  return schema.safeParse(body.values);
}

export const projectsHandlers = [
  http.get("/api/projects/overview", () => {
    const counts = getCounts();

    return HttpResponse.json({
      data: {
        ...mockProjectsOverview,
        counts,
        metrics: mockProjectsOverview.metrics.map((metric) =>
          metric.id === "active"
            ? {
                ...metric,
                value: String(counts.active),
              }
            : metric,
        ),
      },
    });
  }),

  http.get("/api/projects/create-options", () => {
    return HttpResponse.json({
      data: mockCreateOptions,
    });
  }),

  http.get("/api/projects/drafts", () => {
    return HttpResponse.json({
      data: [...drafts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    });
  }),

  http.get("/api/projects/drafts/:draftId", ({ params }) => {
    const id = String(params.draftId);

    const draft = drafts.find((item) => item.id === id);

    if (!draft) {
      return HttpResponse.json(
        { message: "المسودة غير موجودة" },
        { status: 404 },
      );
    }

    return HttpResponse.json({ data: draft });
  }),

  http.get("/api/projects", ({ request }) => {
    const url = new URL(request.url);

    const status = parseStatus(url.searchParams.get("status"));

    const sort = parseSort(url.searchParams.get("sort"));

    const filtered = projects.filter((project) => project.status === status);

    return HttpResponse.json({
      data: {
        items: sortProjects(filtered, sort),
        total: getCounts()[status],
      },
    });
  }),

  http.post("/api/projects", async ({ request }) => {
    const body = (await request.json()) as ProjectSaveRequest;

    if (!body || (body.action !== "draft" && body.action !== "continue")) {
      return HttpResponse.json({ message: "طلب غير صالح" }, { status: 400 });
    }

    const parsed = validateSaveRequest(body);

    if (!parsed.success) {
      return HttpResponse.json(
        {
          message: "بيانات المشروع غير صالحة",
          issues: parsed.error.issues,
        },
        { status: 422 },
      );
    }

    const id = `project-${Date.now()}`;

    const draft = saveDraft(id, parsed.data, body.action);

    return HttpResponse.json({ data: draft }, { status: 201 });
  }),

  http.patch("/api/projects/drafts/:draftId", async ({ params, request }) => {
    const id = String(params.draftId);

    if (!drafts.some((draft) => draft.id === id)) {
      return HttpResponse.json(
        { message: "المسودة غير موجودة" },
        { status: 404 },
      );
    }

    const body = (await request.json()) as ProjectSaveRequest;

    if (!body || (body.action !== "draft" && body.action !== "continue")) {
      return HttpResponse.json({ message: "طلب غير صالح" }, { status: 400 });
    }

    const parsed = validateSaveRequest(body);

    if (!parsed.success) {
      return HttpResponse.json(
        {
          message: "بيانات المشروع غير صالحة",
          issues: parsed.error.issues,
        },
        { status: 422 },
      );
    }

    const draft = saveDraft(id, parsed.data, body.action);

    return HttpResponse.json({ data: draft });
  }),

  http.delete("/api/projects/drafts/:draftId", ({ params }) => {
    const id = String(params.draftId);

    if (!drafts.some((draft) => draft.id === id)) {
      return HttpResponse.json(
        { message: "المسودة غير موجودة" },
        { status: 404 },
      );
    }

    drafts = drafts.filter((draft) => draft.id !== id);

    const index = projects.findIndex(
      (project) => project.id === id && project.status === "draft",
    );

    if (index >= 0) {
      projects.splice(index, 1);
    }

    return new HttpResponse(null, {
      status: 204,
    });
  }),
];
