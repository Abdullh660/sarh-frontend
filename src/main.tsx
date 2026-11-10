import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import { startMockApi } from "./app/config/startMockApi";

import "./index.css";

async function bootstrap() {
  await startMockApi();

  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("Root element not found");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void bootstrap().catch((error) => {
  console.error("Application initialization failed:", error);
});