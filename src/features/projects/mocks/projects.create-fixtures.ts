import type {
  ProjectCreateOptions,
  ProjectDraft,
  ProjectFormValues,
} from "../projects.types";

export const mockCreateOptions: ProjectCreateOptions = {
  templates: [
    {
      id: "provider-commercial",
      scope: "provider",
      name: "مبنى تجاري",
      meta: "7 مراحل · 38 عمل · بنود التحقق",
      description: "قالب كودو تيك جاهز",
    },
    {
      id: "provider-villa",
      scope: "provider",
      name: "فيلا سكنية",
      meta: "8 مراحل · 52 عمل · بنود التحقق",
      description: "قالب كودو تيك جاهز",
    },
    {
      id: "provider-apartment",
      scope: "provider",
      name: "عمارة سكنية",
      meta: "9 مراحل · 70 عمل · بنود التحقق",
      description: "قالب كودو تيك جاهز",
    },
    {
      id: "provider-restoration",
      scope: "provider",
      name: "ترميم وتأهيل",
      meta: "5 مراحل · 26 عمل",
      description: "قالب كودو تيك جاهز",
    },
    {
      id: "provider-road",
      scope: "provider",
      name: "طريق وأسفلت",
      meta: "4 مراحل · 18 عمل",
      description: "قالب كودو تيك جاهز",
    },
    {
      id: "company-amjad",
      scope: "company",
      name: "فرع أمجاد · مبنى تجاري",
      meta: "7 مراحل · 41 عمل",
      description: "قالب شركتي",
    },
    {
      id: "company-villa",
      scope: "company",
      name: "فيلا دورين بملحق",
      meta: "8 مراحل · 49 عمل",
      description: "قالب شركتي",
    },
    {
      id: "company-warehouse",
      scope: "company",
      name: "مستودع حديد",
      meta: "5 مراحل · 22 عمل",
      description: "قالب شركتي",
    },
  ],

  managers: [
    {
      id: "manager-bin-qaryan",
      name: "م. محمد بن قريان (أنت)",
    },
    {
      id: "manager-ameen",
      name: "م. محمد أمين",
    },
  ],
};

const baseValues: ProjectFormValues = {
  source: "template",
  templateId: "company-amjad",
  name: "",
  location: "",
  owner: "",
  consultant: "",
  startDate: "",
  dueDate: "",
  managerId: "manager-bin-qaryan",
  siteSchedule: "6:30 ص – 4:00 م · السبت إلى الخميس",
};

export const initialProjectDrafts: ProjectDraft[] = [
  {
    id: "amjad-mukalla-dais",
    stage: "basics",
    updatedAt: "2026-11-09T10:42:00",
    values: {
      ...baseValues,
      name: "فرع أمجاد المكلا · الديس",
      location: "الديس، المكلا",
      owner: "أمجاد",
    },
  },
  {
    id: "draft-amjad-buraika",
    stage: "basics",
    updatedAt: "2026-11-08T16:15:00",
    values: {
      ...baseValues,
      name: "فرع أمجاد البريكة",
    },
  },
  {
    id: "draft-new-warehouse",
    stage: "basics",
    updatedAt: "2026-11-03T09:00:00",
    values: {
      ...baseValues,
      source: "blank",
      templateId: null,
      name: "مستودع المكلا الجديد",
    },
  },
];
