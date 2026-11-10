import { z } from "zod";

export const saveProjectAssignmentsSchema = z
  .object({
    assignments: z.array(
      z.object({
        taskId: z.string().min(1),
        engineerId: z.string().nullable(),
        executorId: z.string().nullable(),
      }),
    ),
  })
  .superRefine(({ assignments }, ctx) => {
    const ids = new Set<string>();

    assignments.forEach((assignment, index) => {
      if (ids.has(assignment.taskId)) {
        ctx.addIssue({
          code: "custom",
          path: ["assignments", index, "taskId"],
          message: "لا يمكن إسناد العمل نفسه مرتين",
        });
      }

      ids.add(assignment.taskId);
    });
  });

export const inviteTeamMemberSchema = z.object({
  name: z.string().trim().min(2, "أدخل اسم العضو"),

  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,18}$/, "أدخل رقم جوال صحيحًا"),

  role: z.enum([
    "site_engineer",
    "specialist_engineer",
    "project_manager",
    "accountant",
    "secretary",
    "purchasing",
    "warehouse",
    "specialist_contractor",
  ]),
});
