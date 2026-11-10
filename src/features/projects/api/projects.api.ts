import { apiClient } from "../../../integrations/api/client";
import type { ApiResponse } from "../../../types/api";
import type { Project } from "../projects.types";

export const projectsApi = {
  async getAll(): Promise<Project[]> {
    const response = await apiClient.get<ApiResponse<Project[]>>("/projects");

    return response.data.data;
  },
};
