import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { projectPlanApi } from "../api/project-plan.api";

import type { SaveProjectPlanRequest } from "../project-plan.types";

import type { ProjectSource } from "../projects.types";

export function useProjectPlan(
  projectId: string | null,
  source: ProjectSource | null,
) {
  return useQuery({
    queryKey: ["projects", "plan", projectId, source],
    enabled: Boolean(projectId && source),

    queryFn: () => {
      if (!projectId || !source) {
        throw new Error("Project ID and source are required");
      }

      return projectPlanApi.getPlan(projectId, source);
    },
  });
}

interface SaveProjectPlanVariables {
  projectId: string;
  source: ProjectSource;
  payload: SaveProjectPlanRequest;
}

export function useSaveProjectPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: SaveProjectPlanVariables) => {
      return projectPlanApi.savePlan(projectId, payload);
    },

    onSuccess: async (data, variables) => {
      queryClient.setQueryData(
        ["projects", "plan", variables.projectId, variables.source],
        data,
      );

      await queryClient.invalidateQueries({
        queryKey: ["projects", "plan", variables.projectId],
      });
    },
  });
}
