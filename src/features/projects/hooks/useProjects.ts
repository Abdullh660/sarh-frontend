import { useQuery } from "@tanstack/react-query";

import { projectsApi } from "../api/projects.api";

import type { ProjectListQuery } from "../projects.types";

export function useProjects(query: ProjectListQuery) {
  return useQuery({
    queryKey: ["projects", "list", query.status, query.sort],
    queryFn: () => projectsApi.getAll(query),
  });
}
