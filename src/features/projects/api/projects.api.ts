import { apiClient } from "../../../integrations/api/client";

import type { ApiResponse } from "../../../types/api";

import type {
  ProjectCreateOptions,
  ProjectDraft,
  ProjectListQuery,
  ProjectListResult,
  ProjectSaveRequest,
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

  async getCreateOptions(): Promise<ProjectCreateOptions> {
    const response = await apiClient.get<ApiResponse<ProjectCreateOptions>>(
      "/projects/create-options",
    );

    return response.data.data;
  },

  async getDrafts(): Promise<ProjectDraft[]> {
    const response =
      await apiClient.get<ApiResponse<ProjectDraft[]>>("/projects/drafts");

    return response.data.data;
  },

  async getDraft(id: string): Promise<ProjectDraft> {
    const response = await apiClient.get<ApiResponse<ProjectDraft>>(
      `/projects/drafts/${encodeURIComponent(id)}`,
    );

    return response.data.data;
  },

  async createProject(payload: ProjectSaveRequest): Promise<ProjectDraft> {
    const response = await apiClient.post<ApiResponse<ProjectDraft>>(
      "/projects",
      payload,
    );

    return response.data.data;
  },

  async updateDraft(
    id: string,
    payload: ProjectSaveRequest,
  ): Promise<ProjectDraft> {
    const response = await apiClient.patch<ApiResponse<ProjectDraft>>(
      `/projects/drafts/${encodeURIComponent(id)}`,
      payload,
    );

    return response.data.data;
  },

  async deleteDraft(id: string): Promise<void> {
    await apiClient.delete(`/projects/drafts/${encodeURIComponent(id)}`);
  },
};
