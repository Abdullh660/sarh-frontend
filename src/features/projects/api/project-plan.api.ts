import { apiClient } from "../../../integrations/api/client";

import type { ApiResponse } from "../../../types/api";

import type {
  ProjectPlan,
  SaveProjectPlanRequest,
} from "../project-plan.types";

import type { ProjectSource } from "../projects.types";

export const projectPlanApi = {
  async getPlan(
    projectId: string,
    source: ProjectSource,
  ): Promise<ProjectPlan> {
    const response = await apiClient.get<ApiResponse<ProjectPlan>>(
      `/projects/${encodeURIComponent(projectId)}/plan`,
      {
        params: { source },
      },
    );

    return response.data.data;
  },

  async savePlan(
    projectId: string,
    payload: SaveProjectPlanRequest,
  ): Promise<ProjectPlan> {
    const response = await apiClient.put<ApiResponse<ProjectPlan>>(
      `/projects/${encodeURIComponent(projectId)}/plan`,
      payload,
    );

    return response.data.data;
  },
};
