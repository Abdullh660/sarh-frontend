import type {
    ProjectPlanRow,
} from "../project-plan.types";

import type {
    AssignmentExecutor,
    ProjectTeamMember,
    TaskAssignment,
} from "../project-assignment.types";

import {
    canManageTask,
} from "../project-assignment.types";

export interface AssignmentGroup {
    phaseId: string;
    phaseName: string;
    tasks: ProjectPlanRow[];
}

interface ProjectAssignmentTableProps {
    groups: AssignmentGroup[];
    assignments: TaskAssignment[];
    members: ProjectTeamMember[];
    executors: AssignmentExecutor[];
    filter: "all" | "unassigned";
    onFilterChange: (
        filter: "all" | "unassigned"
    ) => void;
    onChange: (
        taskId: string,
        patch: Partial<
            Pick<TaskAssignment, "engineerId" | "executorId">
        >
    ) => void;
    onAssignPhase: () => void;
}

export function ProjectAssignmentTable({
    groups,
    assignments,
    members,
    executors,
    filter,
    onFilterChange,
    onChange,
    onAssignPhase,
}: ProjectAssignmentTableProps) {
    const byTaskId = new Map(
        assignments.map((item) => [item.taskId, item])
    );

    const engineers = members.filter(canManageTask);

    const total = groups.reduce(
        (count, group) => count + group.tasks.length,
        0
    );

    const unassigned = groups.reduce(
        (count, group) =>
            count +
            group.tasks.filter(
                (task) => !byTaskId.get(task.id)?.engineerId
            ).length,
        0
    );

    const visible = groups
        .map((group) => ({
            ...group,
            tasks: group.tasks.filter(
                (task) =>
                    filter === "all" ||
                    !byTaskId.get(task.id)?.engineerId
            ),
        }))
        .filter((group) => group.tasks.length > 0);

    return (
        <section className="project-assign__panel">
            <div className="project-assign__table-heading">
                <h2>إسناد الأعمال</h2>

                <div className="project-assign__toolbar">
                    <button
                        type="button"
                        className="project-assign__outline"
                        onClick={onAssignPhase}
                    >
                        إسناد مرحلة كاملة
                    </button>

                    <div
                        className="project-assign__filters"
                        role="group"
                        aria-label="تصفية الأعمال"
                    >
                        <button
                            type="button"
                            aria-pressed={filter === "all"}
                            onClick={() => onFilterChange("all")}
                        >
                            الكل {total}
                        </button>

                        <button
                            type="button"
                            aria-pressed={filter === "unassigned"}
                            onClick={() =>
                                onFilterChange("unassigned")
                            }
                        >
                            بلا مسؤول {unassigned}
                        </button>
                    </div>
                </div>
            </div>

            <div className="project-assign__table-scroll">
                <table className="project-assign__table">
                    <thead>
                        <tr>
                            <th scope="col">العمل</th>
                            <th scope="col">المهندس المسؤول</th>
                            <th scope="col">المنفّذ</th>
                        </tr>
                    </thead>

                    {visible.map((group) => (
                        <tbody key={group.phaseId}>
                            <tr className="project-assign__group">
                                <th colSpan={3} scope="rowgroup">
                                    {group.phaseName}{" "}
                                    <span>
                                        · {group.tasks.length} أعمال
                                    </span>
                                </th>
                            </tr>

                            {group.tasks.map((task) => {
                                const assignment = byTaskId.get(
                                    task.id
                                );

                                const isUnassigned =
                                    !assignment?.engineerId;

                                return (
                                    <tr
                                        key={task.id}
                                        className={
                                            isUnassigned
                                                ? "project-assign__unassigned"
                                                : ""
                                        }
                                    >
                                        <th scope="row">
                                            <span className="project-assign__task-code">
                                                {task.code}
                                            </span>
                                            {task.name}
                                        </th>

                                        <td>
                                            <select
                                                aria-label={`المهندس المسؤول عن ${task.name}`}
                                                value={
                                                    assignment?.engineerId ?? ""
                                                }
                                                onChange={(event) =>
                                                    onChange(task.id, {
                                                        engineerId:
                                                            event.target.value ||
                                                            null,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    اختر مهندسًا
                                                </option>

                                                {engineers.map((member) => (
                                                    <option
                                                        key={member.id}
                                                        value={member.id}
                                                    >
                                                        {member.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <div className="project-assign__executor-cell">
                                                <select
                                                    aria-label={`المنفّذ للعمل ${task.name}`}
                                                    value={
                                                        assignment?.executorId ??
                                                        ""
                                                    }
                                                    onChange={(event) =>
                                                        onChange(task.id, {
                                                            executorId:
                                                                event.target.value ||
                                                                null,
                                                        })
                                                    }
                                                >
                                                    <option value="">
                                                        اختر المنفّذ
                                                    </option>

                                                    <optgroup label="فنيو الشركة">
                                                        {executors
                                                            .filter(
                                                                (item) =>
                                                                    item.kind === "crew"
                                                            )
                                                            .map((item) => (
                                                                <option
                                                                    key={item.id}
                                                                    value={item.id}
                                                                >
                                                                    {item.name}
                                                                </option>
                                                            ))}
                                                    </optgroup>

                                                    <optgroup label="مقاول متخصص">
                                                        {executors
                                                            .filter(
                                                                (item) =>
                                                                    item.kind ===
                                                                    "contractor"
                                                            )
                                                            .map((item) => (
                                                                <option
                                                                    key={item.id}
                                                                    value={item.id}
                                                                >
                                                                    {item.name}
                                                                </option>
                                                            ))}
                                                    </optgroup>
                                                </select>

                                                {assignment?.executorId && (
                                                    <span className="project-assign__executor-tag">
                                                        {executors.find(
                                                            (item) =>
                                                                item.id ===
                                                                assignment.executorId
                                                        )?.kind === "contractor"
                                                            ? "مقاول · رابط لاحقًا"
                                                            : "فنيو الشركة"}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    ))}
                </table>

                {visible.length === 0 && (
                    <p className="project-assign__empty">
                        {total === 0
                            ? "لا توجد أعمال في الخطة. أضف الأعمال من خطوة التفصيل والعلاقات أولًا."
                            : "لا توجد أعمال تطابق التصفية الحالية."}
                    </p>
                )}
            </div>
        </section>
    );
}