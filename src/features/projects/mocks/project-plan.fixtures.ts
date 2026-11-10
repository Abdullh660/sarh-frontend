import type {
  ProjectPlan,
  ProjectPlanRow,
  PlanRowKind,
} from "../project-plan.types";

import type { ProjectSource } from "../projects.types";

function row(
  id: string,
  code: string,
  name: string,
  kind: PlanRowKind,
  level: 0 | 1 | 2,
  durationDays: number,
  extra: Partial<ProjectPlanRow> = {},
): ProjectPlanRow {
  return {
    id,
    code,
    name,
    kind,
    level,
    durationDays,
    dependency: {
      type: "none",
      targetId: null,
      fixedDate: null,
    },
    assignee: "",
    quantity: "",
    description: "",
    checks: [],
    ...extra,
  };
}

function after(targetId: string) {
  return {
    type: "after" as const,
    targetId,
    fixedDate: null,
  };
}

function parallel(targetId: string) {
  return {
    type: "parallel" as const,
    targetId,
    fixedDate: null,
  };
}

const templateRows: ProjectPlanRow[] = [
  row("phase-1", "1", "التمهيدية", "phase", 0, 15),

  row("phase-2", "2", "الأساسات", "phase", 0, 36, {
    dependency: after("phase-1"),
  }),

  row("phase-3", "3", "الهيكل الخرساني", "phase", 0, 50, {
    dependency: after("phase-2"),
  }),

  row("phase-4", "4", "أعمال البلوك", "phase", 0, 50),

  row("block-ground", "4.1", "بلوك الدور الأرضي", "task", 1, 13, {
    dependency: after("phase-3"),
    assignee: "فنيو البلوك",
    quantity: "850 م²",
  }),

  row("block-first", "4.2", "بلوك الدور الأول", "task", 1, 20, {
    dependency: after("phase-3"),
    assignee: "فنيو البلوك",
    quantity: "900 م²",
  }),

  row("phase-5", "5", "التمديدات", "phase", 0, 61),

  row("install-ground", "5.1", "الدور الأرضي", "group", 1, 18),

  row("electric-ground", "5.1.1", "كهرباء", "task", 2, 18, {
    dependency: after("block-ground"),
    assignee: "فنيو الكهرباء",
    quantity: "100%",
  }),

  row("plumbing-ground", "5.1.2", "سباكة وصرف", "task", 2, 16, {
    dependency: parallel("electric-ground"),
    assignee: "فنيو السباكة",
    quantity: "100%",
  }),

  row("install-first", "5.2", "الدور الأول", "group", 1, 19),

  row("ac-ducts", "5.3", "دكت التكييف", "task", 1, 24, {
    dependency: after("phase-3"),
    assignee: "فنيو التكييف",
    quantity: "46 مخرج",
  }),

  row("phase-6", "6", "التشطيبات", "phase", 0, 115),

  row("plaster-group", "6.1", "اللياسة", "group", 1, 64),

  row("plaster-ground", "6.1.1", "داخلية · الدور الأرضي", "task", 2, 24, {
    dependency: after("electric-ground"),
    assignee: "فنيو اللياسة",
    quantity: "500 م²",
    description:
      "لياسة داخلية للجدران والأسقف في الدور الأرضي، طبقتين (طرطشة + بطانة) بسماكة 2 سم، مع زوايا معدنية في الأركان البارزة.",
    checks: [
      { id: "check-1", text: "استقامة الجدران", requirement: "photo" },
      { id: "check-2", text: "الزوايا", requirement: "photo" },
      { id: "check-3", text: "سماكة الطبقة", requirement: "signature" },
    ],
  }),

  row("plaster-first", "6.1.2", "داخلية · الدور الأول", "task", 2, 24, {
    dependency: after("block-first"),
    assignee: "فنيو اللياسة",
    quantity: "520 م²",
  }),

  row("plaster-outside", "6.1.3", "خارجية", "task", 2, 29, {
    dependency: parallel("plaster-ground"),
    assignee: "فنيو اللياسة",
    quantity: "610 م²",
  }),

  row("gypsum", "6.2", "الجبس والأسقف المستعارة", "task", 1, 24, {
    dependency: after("ac-ducts"),
    assignee: "فنيو الجبس",
    quantity: "700 م²",
  }),

  row("flooring", "6.3", "الأرضيات · بورسلان", "task", 1, 24, {
    dependency: after("plaster-ground"),
    assignee: "فنيو البلاط",
    quantity: "980 م²",
  }),

  row("painting", "6.4", "الدهانات", "task", 1, 25, {
    dependency: after("flooring"),
    assignee: "بلا مسؤول",
    quantity: "2,300 م²",
  }),

  row("phase-7", "7", "الواجهات", "phase", 0, 70),

  row("metal-frame", "7.1", "الهيكل المعدني", "task", 1, 20, {
    dependency: after("phase-3"),
    assignee: "مقاول الألمنيوم",
  }),

  row("cladding", "7.2", "كلادينج الواجهة", "task", 1, 49, {
    dependency: after("metal-frame"),
    assignee: "مقاول الألمنيوم",
    quantity: "380 م²",
  }),

  row("phase-8", "8", "التسليم", "phase", 0, 7),
];

export function buildInitialProjectPlan(
  projectId: string,
  source: ProjectSource,
): ProjectPlan {
  return {
    projectId,
    rows: source === "blank" ? [] : structuredClone(templateRows),
    updatedAt: new Date().toISOString(),
  };
}
