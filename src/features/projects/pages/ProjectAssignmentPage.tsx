import { useMemo, useState } from "react";

import {
    useNavigate,
    useParams,
} from "react-router";

import { Card } from "../../../components/ui";

import {
    ProjectAssignmentTable,
} from "../components/ProjectAssignmentTable";

import type {
    AssignmentGroup,
} from "../components/ProjectAssignmentTable";

import {
    ProjectAssignmentTeam,
} from "../components/ProjectAssignmentTeam";

import {
    BulkAssignDialog,
    InviteMemberDialog,
} from "../components/ProjectAssignmentDialogs";

import {
    useProjectDraft,
} from "../hooks/useProjectCreation";

import {
    useProjectPlan,
} from "../hooks/useProjectPlan";

import {
    useInviteProjectMember,
    useProjectAssignments,
    useSaveProjectAssignments,
} from "../hooks/useProjectAssignment";

import {
    saveProjectAssignmentsSchema,
} from "../project-assignment.schema";

import type {
    InviteTeamMemberRequest,
    ProjectAssignmentData,
    TaskAssignment,
} from "../project-assignment.types";

import type {
    ProjectPlan,
    ProjectPlanRow,
} from "../project-plan.types";

import type {
    ProjectDraft,
} from "../projects.types";

import "./ProjectAssignmentPage.css";

function groupTasks(
    rows: ProjectPlanRow[]
): AssignmentGroup[] {
    const groups: AssignmentGroup[] = [];

    let current: AssignmentGroup | null = null;

    for (const row of rows) {
        if (row.kind === "phase") {
            current = {
                phaseId: row.id,
                phaseName: row.name,
                tasks: [],
            };

            groups.push(current);
        } else if (row.kind === "task") {
            if (!current) {
                current = {
                    phaseId: "ungrouped",
                    phaseName: "أعمال غير مصنفة",
                    tasks: [],
                };

                groups.push(current);
            }

            current.tasks.push(row);
        }
    }

    return groups.filter(
        (group) => group.tasks.length > 0
    );
}

interface EditorProps {
    project: ProjectDraft;
    plan: ProjectPlan;
    workspace: ProjectAssignmentData;
}

function ProjectAssignmentEditor({
    project,
    plan,
    workspace,
}: EditorProps) {
    const navigate = useNavigate();

    const groups = useMemo(
        () => groupTasks(plan.rows),
        [plan.rows]
    );

    const tasks = useMemo(
        () =>
            groups.flatMap(
                (group) => group.tasks
            ),
        [groups]
    );

    const taskIds = useMemo(
        () =>
            new Set(
                tasks.map((task) => task.id)
            ),
        [tasks]
    );

    const [assignments, setAssignments] =
        useState<TaskAssignment[]>(() =>
            workspace.assignments
                .filter((item) =>
                    taskIds.has(item.taskId)
                )
                .map((item) => ({ ...item }))
        );

    const [filter, setFilter] = useState<
        "all" | "unassigned"
    >("all");

    const [dialog, setDialog] = useState<
        "phase" | "invite" | null
    >(null);

    const [inviteError, setInviteError] =
        useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [dirty, setDirty] = useState(false);

    const saveMutation =
        useSaveProjectAssignments();

    const inviteMutation =
        useInviteProjectMember();

    const assignedById = useMemo(
        () =>
            new Map(
                assignments.map((item) => [
                    item.taskId,
                    item,
                ])
            ),
        [assignments]
    );

    const unassignedCount = tasks.filter(
        (task) =>
            !assignedById.get(task.id)?.engineerId
    ).length;

    function changed() {
        setDirty(true);
        setError("");
        setMessage("");
    }

    function updateAssignment(
        taskId: string,
        patch: Partial<
            Pick<
                TaskAssignment,
                "engineerId" | "executorId"
            >
        >
    ) {
        setAssignments((current) => {
            const existing = current.find(
                (item) =>
                    item.taskId === taskId
            );

            if (!existing) {
                return [
                    ...current,
                    {
                        taskId,
                        engineerId: null,
                        executorId: null,
                        ...patch,
                    },
                ];
            }

            return current.map((item) =>
                item.taskId === taskId
                    ? { ...item, ...patch }
                    : item
            );
        });

        changed();
    }

    function assignPhase(
        phaseId: string,
        engineerId: string
    ) {
        const group = groups.find(
            (item) =>
                item.phaseId === phaseId
        );

        if (!group) {
            return;
        }

        const ids = new Set(
            group.tasks.map(
                (task) => task.id
            )
        );

        setAssignments((current) => {
            const existing = new Map(
                current.map((item) => [
                    item.taskId,
                    item,
                ])
            );

            return tasks.map((task) => {
                const item =
                    existing.get(task.id) ?? {
                        taskId: task.id,
                        engineerId: null,
                        executorId: null,
                    };

                return ids.has(task.id)
                    ? { ...item, engineerId }
                    : item;
            });
        });

        changed();
        setDialog(null);
    }

    async function save(
        goToApproval: boolean
    ) {
        if (saveMutation.isPending) {
            return;
        }

        setError("");
        setMessage("");

        if (
            goToApproval &&
            tasks.length === 0
        ) {
            setError(
                "لا توجد أعمال للإسناد. أضف أعمالًا في خطوة التفصيل والعلاقات أولًا."
            );

            return;
        }

        if (
            goToApproval &&
            unassignedCount > 0
        ) {
            setFilter("unassigned");

            setError(
                `ما زال هناك ${unassignedCount} عملًا بلا مهندس مسؤول.`
            );

            return;
        }

        const payload = {
            assignments: tasks.map(
                (task) =>
                    assignedById.get(task.id) ?? {
                        taskId: task.id,
                        engineerId: null,
                        executorId: null,
                    }
            ),
        };

        const parsed =
            saveProjectAssignmentsSchema.safeParse(
                payload
            );

        if (!parsed.success) {
            setError(
                parsed.error.issues[0]?.message ??
                "الإسنادات غير صالحة."
            );

            return;
        }

        try {
            await saveMutation.mutateAsync({
                projectId: project.id,
                payload: parsed.data,
            });

            setDirty(false);

            if (goToApproval) {
                navigate(
                    `/projects/${encodeURIComponent(
                        project.id
                    )}/approve`
                );
            } else {
                setMessage(
                    "تم حفظ إسنادات الأعمال داخل Mock API بنجاح."
                );
            }
        } catch {
            setError(
                "تعذر حفظ الإسنادات. تحقق من Mock API وحاول مجددًا."
            );
        }
    }

    async function invite(
        payload: InviteTeamMemberRequest
    ) {
        setInviteError("");

        try {
            await inviteMutation.mutateAsync({
                projectId: project.id,
                payload,
            });

            setDialog(null);

            setMessage(
                "سُجلت دعوة معلّقة تجريبية. لم تُرسل رسالة واتساب."
            );
        } catch {
            setInviteError(
                "تعذر تسجيل الدعوة. قد يكون رقم الجوال مستخدمًا مسبقًا."
            );
        }
    }

    return (
        <div className="project-assign">
            <form
                id="sarh-assignment-save-form"
                hidden
                onSubmit={(event) => {
                    event.preventDefault();
                    void save(false);
                }}
            />

            <form
                id="sarh-assignment-next-form"
                hidden
                onSubmit={(event) => {
                    event.preventDefault();
                    void save(true);
                }}
            />

            <div className="project-assign__intro">
                <div>
                    <h2>
                        {project.values.name ||
                            "مشروع بدون اسم"}
                    </h2>

                    <p>
                        وزّع الأعمال على المهندسين المسؤولين
                        وحدّد المنفّذين.
                    </p>
                </div>

                <span>
                    {saveMutation.isPending
                        ? "جاري الحفظ..."
                        : dirty
                            ? "تغييرات غير محفوظة"
                            : "لا توجد تغييرات جديدة"}
                </span>
            </div>

            {message && (
                <p
                    className="project-assign__success"
                    role="status"
                >
                    {message}
                </p>
            )}

            {error && (
                <p
                    className="project-assign__error"
                    role="alert"
                >
                    {error}
                </p>
            )}

            <ol
                className="project-assign__steps"
                aria-label="خطوات إنشاء المشروع"
            >
                {[
                    "القالب والبيانات",
                    "التفصيل والعلاقات",
                    "الإسناد",
                    "اعتماد الخطة",
                ].map((step, index) => (
                    <li
                        key={step}
                        className={
                            index === 2
                                ? "project-assign__step project-assign__step--active"
                                : "project-assign__step"
                        }
                    >
                        <span>
                            {index < 2
                                ? "✓"
                                : index + 1}
                        </span>

                        <strong>
                            {step}
                        </strong>
                    </li>
                ))}
            </ol>

            <div className="project-assign__summary">
                <span>
                    <b>{tasks.length}</b> أعمال في الخطة
                </span>

                <span>
                    <b>
                        {tasks.length - unassignedCount}
                    </b>{" "}
                    مسندة
                </span>

                <span
                    className={
                        unassignedCount
                            ? "project-assign__summary-alert"
                            : ""
                    }
                >
                    <b>{unassignedCount}</b> بلا مسؤول
                </span>
            </div>

            <div className="project-assign__layout">
                <ProjectAssignmentTable
                    groups={groups}
                    assignments={assignments}
                    members={workspace.members}
                    executors={workspace.executors}
                    filter={filter}
                    onFilterChange={setFilter}
                    onChange={updateAssignment}
                    onAssignPhase={() =>
                        setDialog("phase")
                    }
                />

                <ProjectAssignmentTeam
                    members={workspace.members}
                    executors={workspace.executors}
                    assignments={assignments}
                    onInvite={() => {
                        setInviteError("");
                        setDialog("invite");
                    }}
                />
            </div>

            {dialog === "phase" && (
                <BulkAssignDialog
                    groups={groups}
                    members={workspace.members}
                    onClose={() => setDialog(null)}
                    onApply={assignPhase}
                />
            )}

            {dialog === "invite" && (
                <InviteMemberDialog
                    pending={inviteMutation.isPending}
                    error={inviteError}
                    onClose={() => setDialog(null)}
                    onInvite={invite}
                />
            )}
        </div>
    );
}

export function ProjectAssignmentPage() {
    const { projectId } = useParams<{
        projectId: string;
    }>();

    const draftQuery = useProjectDraft(
        projectId ?? null
    );

    const source =
        draftQuery.data?.values.source ?? null;

    const planQuery = useProjectPlan(
        projectId ?? null,
        source
    );

    const assignmentQuery =
        useProjectAssignments(
            projectId ?? null
        );

    if (!projectId) {
        return (
            <Card>
                معرف المشروع غير موجود.
            </Card>
        );
    }

    if (draftQuery.isError) {
        return (
            <Card>
                تعذر العثور على المشروع.
                ارجع إلى صفحة المشاريع.
            </Card>
        );
    }

    if (draftQuery.isPending) {
        return (
            <Card>
                جاري تحميل المشروع...
            </Card>
        );
    }

    if (
        planQuery.isError ||
        assignmentQuery.isError
    ) {
        return (
            <Card>
                تعذر تحميل خطة المشروع أو الإسنادات.
                تحقق من Mock API.
            </Card>
        );
    }

    if (
        planQuery.isPending ||
        assignmentQuery.isPending
    ) {
        return (
            <Card>
                جاري تحميل أعمال المشروع والفريق...
            </Card>
        );
    }

    return (
        <ProjectAssignmentEditor
            key={projectId}
            project={draftQuery.data}
            plan={planQuery.data}
            workspace={assignmentQuery.data}
        />
    );
}