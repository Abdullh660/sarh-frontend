import type {
  AssignmentExecutor,
  ProjectAssignmentData,
  ProjectTeamMember,
  TaskAssignment,
} from "../project-assignment.types";

const members: ProjectTeamMember[] = [
  {
    id: "eng-mubarak",
    name: "م. مبارك",
    role: "site_engineer",
    status: "active",
  },
  {
    id: "eng-ameen",
    name: "م. محمد أمين",
    role: "site_engineer",
    status: "active",
  },
  {
    id: "eng-salem",
    name: "م. سالم",
    role: "specialist_engineer",
    status: "active",
  },
  {
    id: "eng-khaled",
    name: "م. خالد",
    role: "project_manager",
    status: "active",
  },
];

const executors: AssignmentExecutor[] = [
  {
    id: "crew-electric",
    name: "فنيو الكهرباء",
    kind: "crew",
  },
  {
    id: "crew-plumbing",
    name: "فنيو السباكة",
    kind: "crew",
  },
  {
    id: "crew-block",
    name: "فنيو البلوك",
    kind: "crew",
  },
  {
    id: "crew-plaster",
    name: "فنيو اللياسة",
    kind: "crew",
  },
  {
    id: "crew-gypsum",
    name: "فنيو الجبس",
    kind: "crew",
  },
  {
    id: "crew-flooring",
    name: "فنيو البلاط",
    kind: "crew",
  },
  {
    id: "contractor-ac",
    name: "مقاول التكييف",
    kind: "contractor",
  },
  {
    id: "contractor-aluminum",
    name: "مقاول الألمنيوم",
    kind: "contractor",
  },
];

const seededAssignments: TaskAssignment[] = [
  {
    taskId: "electric-ground",
    engineerId: "eng-mubarak",
    executorId: "crew-electric",
  },
  {
    taskId: "plumbing-ground",
    engineerId: "eng-mubarak",
    executorId: "crew-plumbing",
  },
  {
    taskId: "ac-ducts",
    engineerId: "eng-mubarak",
    executorId: "contractor-ac",
  },
  {
    taskId: "block-ground",
    engineerId: "eng-mubarak",
    executorId: "crew-block",
  },
  {
    taskId: "block-first",
    engineerId: "eng-mubarak",
    executorId: "crew-block",
  },
  {
    taskId: "plaster-ground",
    engineerId: "eng-mubarak",
    executorId: "crew-plaster",
  },
  {
    taskId: "plaster-first",
    engineerId: "eng-mubarak",
    executorId: "crew-plaster",
  },
  {
    taskId: "plaster-outside",
    engineerId: "eng-mubarak",
    executorId: "crew-plaster",
  },
  {
    taskId: "gypsum",
    engineerId: "eng-mubarak",
    executorId: "crew-gypsum",
  },
  {
    taskId: "flooring",
    engineerId: "eng-mubarak",
    executorId: "crew-flooring",
  },
  {
    taskId: "painting",
    engineerId: null,
    executorId: null,
  },
  {
    taskId: "metal-frame",
    engineerId: "eng-mubarak",
    executorId: "contractor-aluminum",
  },
  {
    taskId: "cladding",
    engineerId: "eng-mubarak",
    executorId: "contractor-aluminum",
  },
];

export function makeMockProjectAssignments(
  projectId: string,
): ProjectAssignmentData {
  return {
    projectId,

    members: members.map((member) => ({ ...member })),

    executors: executors.map((executor) => ({
      ...executor,
    })),

    assignments: seededAssignments.map((assignment) => ({
      ...assignment,
    })),

    updatedAt: new Date().toISOString(),
  };
}
