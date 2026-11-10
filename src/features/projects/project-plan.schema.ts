import { z } from "zod";

const dependencySchema = z.object({
  type: z.enum(["none", "after", "parallel", "fixed"]),
  targetId: z.string().nullable(),
  fixedDate: z.string().nullable(),
});

const checkSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1),
  requirement: z.enum(["photo", "signature", "none"]),
});

const planRowSchema = z.object({
  id: z.string().min(1),
  code: z.string().trim().min(1),
  name: z.string().trim().min(1, "اسم المرحلة أو العمل مطلوب"),
  kind: z.enum(["phase", "group", "task"]),
  level: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  durationDays: z.number().int().min(0),
  dependency: dependencySchema,
  assignee: z.string(),
  quantity: z.string(),
  description: z.string(),
  checks: z.array(checkSchema),
});

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export const projectPlanSchema = z
  .object({
    rows: z.array(planRowSchema).max(500),
  })
  .superRefine(({ rows }, ctx) => {
    const ids = new Set<string>();

    for (const [index, row] of rows.entries()) {
      if (ids.has(row.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["rows", index, "id"],
          message: "يوجد معرف عمل مكرر",
        });
      }

      ids.add(row.id);

      if (row.kind === "task" && row.durationDays < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["rows", index, "durationDays"],
          message: `مدة العمل "${row.name}" يجب أن تكون يومًا على الأقل`,
        });
      }
    }

    const byId = new Map(rows.map((row) => [row.id, row]));

    for (const [index, row] of rows.entries()) {
      const relation = row.dependency;

      if (relation.type === "after" || relation.type === "parallel") {
        if (
          !relation.targetId ||
          !byId.has(relation.targetId) ||
          relation.targetId === row.id
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["rows", index, "dependency"],
            message: `اختر عملًا آخر صالحًا لعلاقة "${row.name}"`,
          });
        }
      }

      if (
        relation.type === "fixed" &&
        (!relation.fixedDate || !isValidDate(relation.fixedDate))
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["rows", index, "dependency", "fixedDate"],
          message: `حدد تاريخ بداية صالحًا للعمل "${row.name}"`,
        });
      }
    }

    // Detect cycles in "after" dependencies.
    const visiting = new Set<string>();
    const visited = new Set<string>();

    function hasCycle(id: string): boolean {
      if (visiting.has(id)) return true;
      if (visited.has(id)) return false;

      visiting.add(id);

      const row = byId.get(id);

      if (
        row?.dependency.type === "after" &&
        row.dependency.targetId &&
        byId.has(row.dependency.targetId) &&
        hasCycle(row.dependency.targetId)
      ) {
        return true;
      }

      visiting.delete(id);
      visited.add(id);

      return false;
    }

    for (const row of rows) {
      if (hasCycle(row.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["rows"],
          message: "يوجد اعتماد دائري بين الأعمال",
        });

        break;
      }
    }
  });
