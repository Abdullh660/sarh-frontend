import { http, HttpResponse } from "msw/http";

import type {
  Project,
  ProjectHealth,
  ProjectSort,
  ProjectStatus,
} from "../projects.types";

import { mockProjects, mockProjectsOverview } from "./projects.fixtures";

const healthPriority: Record<ProjectHealth, number> = {
  late: 0,
  watch: 1,
  on_track: 2,
};

function sortProjects(projects: Project[], sort: ProjectSort): Project[] {
  return [...projects].sort((a, b) => {
    if (sort === "name") {
      return a.name.localeCompare(b.name, "ar");
    }

    if (sort === "nearest") {
      const aDate = a.dueDate ? Date.parse(a.dueDate) : Number.MAX_SAFE_INTEGER;

      const bDate = b.dueDate ? Date.parse(b.dueDate) : Number.MAX_SAFE_INTEGER;

      return aDate - bDate;
    }

    const aPriority = a.health ? healthPriority[a.health] : 3;

    const bPriority = b.health ? healthPriority[b.health] : 3;

    return aPriority - bPriority;
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

export const projectsHandlers = [
  http.get("/api/projects/overview", () => {
    return HttpResponse.json({
      data: mockProjectsOverview,
    });
  }),

  http.get("/api/projects", ({ request }) => {
    const url = new URL(request.url);

    const status = parseStatus(url.searchParams.get("status"));

    const sort = parseSort(url.searchParams.get("sort"));

    const filtered = mockProjects.filter(
      (project) => project.status === status,
    );

    const sorted = sortProjects(filtered, sort);

    return HttpResponse.json({
      data: {
        items: sorted,
        total: mockProjectsOverview.counts[status],
      },
    });
  }),
];
