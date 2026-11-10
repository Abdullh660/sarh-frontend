import { z } from "zod";

export const projectDraftSchema = z.object({
  source: z.enum(["template", "blank"]),
  templateId: z.string().nullable(),

  name: z.string().trim(),
  location: z.string().trim(),
  owner: z.string().trim(),
  consultant: z.string().trim(),

  startDate: z.string(),
  dueDate: z.string(),

  managerId: z.string(),
  siteSchedule: z.string().trim(),
});

export const projectSubmitSchema = projectDraftSchema.superRefine(
  (data, ctx) => {
    const requiredFields = [
      ["name", "اسم المشروع مطلوب"],
      ["location", "موقع المشروع مطلوب"],
      ["owner", "المالك مطلوب"],
      ["startDate", "تاريخ البداية مطلوب"],
      ["dueDate", "تاريخ التسليم مطلوب"],
      ["managerId", "مدير المشاريع مطلوب"],
    ] as const;

    for (const [field, message] of requiredFields) {
      if (!data[field].trim()) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message,
        });
      }
    }

    if (data.source === "template" && !data.templateId) {
      ctx.addIssue({
        code: "custom",
        path: ["templateId"],
        message: "اختر قالب المشروع",
      });
    }

    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

    for (const field of ["startDate", "dueDate"] as const) {
      const value = data[field];

      if (
        value &&
        (!dateFormat.test(value) || Number.isNaN(Date.parse(value)))
      ) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "التاريخ غير صالح",
        });
      }
    }

    if (
      dateFormat.test(data.startDate) &&
      dateFormat.test(data.dueDate) &&
      data.dueDate < data.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "تاريخ التسليم يجب ألا يسبق تاريخ البداية",
      });
    }
  },
);
