import type {
    ProjectPlanRow,
} from "../project-plan.types";

interface ProjectPlanTableProps {
    rows: ProjectPlanRow[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAddPhase: () => void;
    onAddTask: () => void;
}

function relationLabel(
    row: ProjectPlanRow,
    rows: ProjectPlanRow[]
): string {
    const relation = row.dependency;

    if (relation.type === "none") {
        return "—";
    }

    if (relation.type === "fixed") {
        return relation.fixedDate ?? "تاريخ غير محدد";
    }

    const target = rows.find(
        (item) => item.id === relation.targetId
    );

    const label = target?.name ?? "عمل غير محدد";

    return relation.type === "after"
        ? `بعد: ${label}`
        : `بالتوازي مع: ${label}`;
}

export function ProjectPlanTable({
    rows,
    selectedId,
    onSelect,
    onAddPhase,
    onAddTask,
}: ProjectPlanTableProps) {
    const phases = rows.filter(
        (row) => row.kind === "phase"
    );

    return (
        <div className="project-setup__table-column">
            <section className="project-setup__sequence">
                <p>
                    تسلسل المراحل من اليمين لليسار · السهم
                    يعني بدء المرحلة بعد سابقتها مبدئيًا
                </p>

                {phases.length === 0 ? (
                    <span className="project-setup__muted">
                        لا توجد مراحل بعد. ابدأ بإضافة مرحلة.
                    </span>
                ) : (
                    <div className="project-setup__sequence-list">
                        {phases.map((phase, index) => (
                            <div
                                className="project-setup__sequence-entry"
                                key={phase.id}
                            >
                                <button
                                    type="button"
                                    className="project-setup__sequence-phase"
                                    onClick={() => onSelect(phase.id)}
                                >
                                    <strong>{phase.name}</strong>
                                    <small>
                                        {phase.durationDays} يومًا
                                    </small>
                                </button>

                                {index < phases.length - 1 && (
                                    <span aria-hidden="true">←</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="project-setup__table-panel">
                <div className="project-setup__table-heading">
                    <h2>تفصيل المشروع</h2>

                    <div className="project-setup__table-actions">
                        <button type="button" onClick={onAddPhase}>
                            + أضف مرحلة
                        </button>

                        <button type="button" onClick={onAddTask}>
                            + أضف عمل
                        </button>
                    </div>
                </div>

                <div className="project-setup__table-scroll">
                    <table className="project-setup__table">
                        <thead>
                            <tr>
                                <th scope="col">البند</th>
                                <th scope="col">المدة</th>
                                <th scope="col">يبدأ</th>
                                <th scope="col">المنفذ</th>
                                <th scope="col">الكمية</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={[
                                        row.kind === "phase"
                                            ? "project-setup__row--phase"
                                            : "",
                                        selectedId === row.id
                                            ? "project-setup__row--selected"
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                >
                                    <td>
                                        <button
                                            type="button"
                                            className="project-setup__row-button"
                                            style={{
                                                paddingInlineStart: `${row.level * 18
                                                    }px`,
                                            }}
                                            aria-pressed={selectedId === row.id}
                                            onClick={() => onSelect(row.id)}
                                        >
                                            <strong>{row.code}</strong>
                                            <span>{row.name}</span>
                                        </button>
                                    </td>

                                    <td>
                                        {row.durationDays > 0
                                            ? `${row.durationDays} يومًا`
                                            : "—"}
                                    </td>

                                    <td>
                                        {relationLabel(row, rows)}
                                    </td>

                                    <td>
                                        {row.assignee || "—"}
                                    </td>

                                    <td>
                                        {row.quantity || "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {rows.length === 0 && (
                        <p className="project-setup__empty">
                            هذه خطة فارغة. أضف مرحلة ثم أضف
                            الأعمال التابعة لها.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}