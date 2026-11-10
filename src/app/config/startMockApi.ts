export async function startMockApi(): Promise<void> {
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_API !== "true") {
    return;
  }

  const [
    { setupWorker },
    { projectsHandlers },
    { projectPlanHandlers },
    { projectAssignmentHandlers },
  ] = await Promise.all([
    import("msw/browser"),

    import("../../features/projects/mocks/projects.handlers"),

    import("../../features/projects/mocks/project-plan.handlers"),

    import("../../features/projects/mocks/project-assignment.handlers"),
  ]);

  const worker = setupWorker(
    ...projectsHandlers,
    ...projectPlanHandlers,
    ...projectAssignmentHandlers,
  );

  await worker.start({
    onUnhandledFrame: "warn",
  });
}
