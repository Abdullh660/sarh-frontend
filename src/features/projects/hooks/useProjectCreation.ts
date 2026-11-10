import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { projectsApi } from "../api/projects.api";

import type { ProjectSaveRequest } from "../projects.types";

export function useProjectCreateOptions() {
  return useQuery({
    queryKey: ["projects", "create-options"],
    queryFn: projectsApi.getCreateOptions,
  });
}

export function useProjectDrafts() {
  return useQuery({
    queryKey: ["projects", "drafts"],
    queryFn: projectsApi.getDrafts,
  });
}

export function useProjectDraft(id: string | null) {
  return useQuery({
    queryKey: ["projects", "draft", id],
    enabled: Boolean(id),

    queryFn: () => {
      if (!id) {
        throw new Error("Draft ID is required");
      }

      return projectsApi.getDraft(id);
    },
  });
}

interface SaveProjectVariables {
  draftId: string | null;
  payload: ProjectSaveRequest;
}

export function useSaveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, payload }: SaveProjectVariables) =>
      draftId
        ? projectsApi.updateDraft(draftId, payload)
        : projectsApi.createProject(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}

export function useDeleteProjectDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.deleteDraft,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}
