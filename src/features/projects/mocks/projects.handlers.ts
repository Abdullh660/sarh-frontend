import { http, HttpResponse } from "msw/http";
import { mockProjects } from "./projects.fixtures";

export const projectsHandlers = [
  http.get("/api/projects", () => {
    return HttpResponse.json({
      data: mockProjects,
    });
  }),
];
