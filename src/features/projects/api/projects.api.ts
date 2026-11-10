import { apiClient } from "../../../integrations/api/client";

import type { ApiResponse } from "../../../types/api";

import type {
  ProjectListQuery,
  ProjectListResult,
  ProjectsOverview,
} from "../projects.types";

export const projectsApi = {
  async getAll(query: ProjectListQuery): Promise<ProjectListResult> {
    const response = await apiClient.get<ApiResponse<ProjectListResult>>(
      "/projects",
      {
        params: query,
      },
    );

    return response.data.data;
  },

  async getOverview(): Promise<ProjectsOverview> {
    const response =
      await apiClient.get<ApiResponse<ProjectsOverview>>("/projects/overview");

    return response.data.data;
  },
};
