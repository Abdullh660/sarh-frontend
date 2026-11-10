import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { projectAssignmentApi } from "../api/project-assignment.api";

import type {
  InviteTeamMemberRequest,
  SaveProjectAssignmentsRequest,
} from "../project-assignment.types";

const assignmentKey = (projectId: string) =>
  ["projects", "assignments", projectId] as const;

export function useProjectAssignments(projectId: string | null) {
  return useQuery({
    queryKey: ["projects", "assignments", projectId],

    enabled: Boolean(projectId),

    queryFn: () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      return projectAssignmentApi.get(projectId);
    },
  });
}

export function useSaveProjectAssignments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: SaveProjectAssignmentsRequest;
    }) => projectAssignmentApi.save(projectId, payload),

    onSuccess: (data) => {
      queryClient.setQueryData(assignmentKey(data.projectId), data);
    },
  });
}

export function useInviteProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: InviteTeamMemberRequest;
    }) => projectAssignmentApi.invite(projectId, payload),

    onSuccess: (data) => {
      queryClient.setQueryData(assignmentKey(data.projectId), data);
    },
  });
}
