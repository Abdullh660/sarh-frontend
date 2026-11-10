export async function startMockApi(): Promise<void> {
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_API !== "true") {
    return;
  }

  const [{ setupWorker }, { projectsHandlers }] = await Promise.all([
    import("msw/browser"),
    import("../../features/projects/mocks/projects.handlers"),
  ]);

  const worker = setupWorker(...projectsHandlers);

  await worker.start({
    onUnhandledFrame: "warn",
  });
}
