import { useQuery } from "@tanstack/react-query";

import { projectsApi } from "../api/projects.api";

export function useProjectsOverview() {
  return useQuery({
    queryKey: ["projects", "overview"],
    queryFn: projectsApi.getOverview,
  });
}
