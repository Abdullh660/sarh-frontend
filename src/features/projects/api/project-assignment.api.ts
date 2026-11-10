import { apiClient } from "../../../integrations/api/client";

import type { ApiResponse } from "../../../types/api";

import type {
  InviteTeamMemberRequest,
  ProjectAssignmentData,
  SaveProjectAssignmentsRequest,
} from "../project-assignment.types";

const urlFor = (projectId: string) =>
  `/projects/${encodeURIComponent(projectId)}/assignments`;

export const projectAssignmentApi = {
  async get(projectId: string): Promise<ProjectAssignmentData> {
    const response = await apiClient.get<ApiResponse<ProjectAssignmentData>>(
      urlFor(projectId),
    );

    return response.data.data;
  },

  async save(
    projectId: string,
    payload: SaveProjectAssignmentsRequest,
  ): Promise<ProjectAssignmentData> {
    const response = await apiClient.put<ApiResponse<ProjectAssignmentData>>(
      urlFor(projectId),
      payload,
    );

    return response.data.data;
  },

  async invite(
    projectId: string,
    payload: InviteTeamMemberRequest,
  ): Promise<ProjectAssignmentData> {
    const response = await apiClient.post<ApiResponse<ProjectAssignmentData>>(
      `/projects/${encodeURIComponent(projectId)}/team/invitations`,
      payload,
    );

    return response.data.data;
  },
};
