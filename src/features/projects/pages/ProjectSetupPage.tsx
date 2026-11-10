import { useState } from "react";

import {
    useNavigate,
    useParams,
} from "react-router";

import { Card } from "../../../components/ui";

import { ProjectPlanTable } from "../components/ProjectPlanTable";
import { ProjectPlanDetails } from "../components/ProjectPlanDetails";

import { useProjectDraft } from "../hooks/useProjectCreation";

import {
    useProjectPlan,
    useSaveProjectPlan,
} from "../hooks/useProjectPlan";

import { projectPlanSchema } from "../project-plan.schema";

import type {
    ProjectPlan,
    ProjectPlanRow,
    PlanCheckRequirement,
} from "../project-plan.types";

import type { ProjectDraft } from "../projects.types";

import "./ProjectSetupPage.css";

function copyRows(
    rows: ProjectPlanRow[]
): ProjectPlanRow[] {
    return rows.map((row) => ({
        ...row,
        dependency: { ...row.dependency },
        checks: row.checks.map((check) => ({ ...check })),
    }));
}

function createPlanRow(
    code: string,
    name: string,
    kind: ProjectPlanRow["kind"],
    level: ProjectPlanRow["level"]
): ProjectPlanRow {
    return {
        id: crypto.randomUUID(),
        code,
        name,
        kind,
        level,
        durationDays: kind === "task" ? 1 : 15,
        dependency: {
            type: "none",
            targetId: null,
            fixedDate: null,
        },
        assignee: "",
        quantity: "",
        description: "",
        checks: [],
    };
}

interface ProjectSetupEditorProps {
    project: ProjectDraft;
    initialPlan: ProjectPlan;
}

function ProjectSetupEditor({
    project,
    initialPlan,
}: ProjectSetupEditorProps) {
    const navigate = useNavigate();

    const projectId = project.id;
    const source = project.values.source;

    const [rows, setRows] = useState<ProjectPlanRow[]>(
        () => copyRows(initialPlan.rows)
    );

    const [selectedId, setSelectedId] = useState<
        string | null
    >(
        initialPlan.rows.find(
            (row) => row.id === "plaster-ground"
        )?.id ??
        initialPlan.rows.find(
            (row) => row.kind === "task"
        )?.id ??
        initialPlan.rows[0]?.id ??
        null
    );

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [dirty, setDirty] = useState(false);

    const saveMutation = useSaveProjectPlan();

    const selected =
        rows.find((row) => row.id === selectedId) ??
        null;

    const phasesCount = rows.filter(
        (row) => row.kind === "phase"
    ).length;

    const tasksCount = rows.filter(
        (row) => row.kind === "task"
    ).length;

    function changed() {
        setDirty(true);
        setMessage("");
        setError("");
    }

    function updateSelected(
        patch: Partial<ProjectPlanRow>
    ) {
        if (!selectedId) return;

        setRows((current) =>
            current.map((row) =>
                row.id === selectedId
                    ? { ...row, ...patch }
                    : row
            )
        );

        changed();
    }

    function addPhase() {
        const existingNumbers = rows
            .filter((row) => row.kind === "phase")
            .map((row) => Number(row.code))
            .filter(Number.isFinite);

        const nextNumber =
            Math.max(0, ...existingNumbers) + 1;

        const newRow = createPlanRow(
            String(nextNumber),
            "مرحلة جديدة",
            "phase",
            0
        );

        setRows((current) => [...current, newRow]);
        setSelectedId(newRow.id);
        changed();
    }

    function addTask() {
        const selectedIndex = rows.findIndex(
            (row) => row.id === selectedId
        );

        const startIndex =
            selectedIndex >= 0
                ? selectedIndex
                : rows.length - 1;

        let phaseIndex = -1;

        for (let i = startIndex; i >= 0; i--) {
            if (rows[i].kind === "phase") {
                phaseIndex = i;
                break;
            }
        }

        if (phaseIndex < 0) {
            setError(
                "يجب إضافة مرحلة قبل إضافة عمل."
            );
            return;
        }

        const phase = rows[phaseIndex];

        const nextPhaseIndex = rows.findIndex(
            (row, index) =>
                index > phaseIndex &&
                row.kind === "phase"
        );

        const insertIndex =
            nextPhaseIndex >= 0
                ? nextPhaseIndex
                : rows.length;

        const children = rows
            .slice(phaseIndex + 1, insertIndex)
            .filter((row) => row.level === 1);

        const lastChildNumber = Math.max(
            0,
            ...children.map((row) => {
                const number = Number(
                    row.code.split(".").at(-1)
                );

                return Number.isFinite(number)
                    ? number
                    : 0;
            })
        );

        const newRow = createPlanRow(
            `${phase.code}.${lastChildNumber + 1}`,
            "عمل جديد",
            "task",
            1
        );

        setRows((current) => [
            ...current.slice(0, insertIndex),
            newRow,
            ...current.slice(insertIndex),
        ]);

        setSelectedId(newRow.id);
        changed();
    }

    function addCheck(
        text: string,
        requirement: PlanCheckRequirement
    ) {
        if (!selected || selected.kind !== "task") {
            return;
        }

        updateSelected({
            checks: [
                ...selected.checks,
                {
                    id: crypto.randomUUID(),
                    text,
                    requirement,
                },
            ],
        });
    }

    function removeCheck(checkId: string) {
        if (!selected) return;

        updateSelected({
            checks: selected.checks.filter(
                (check) => check.id !== checkId
            ),
        });
    }

    async function savePlan(
        goToAssignment: boolean
    ) {
        if (saveMutation.isPending) return;

        setError("");
        setMessage("");

        const result = projectPlanSchema.safeParse({
            rows,
        });

        if (!result.success) {
            setError(
                result.error.issues[0]?.message ??
                "بيانات الخطة غير صالحة."
            );
            return;
        }

        if (
            goToAssignment &&
            !rows.some((row) => row.kind === "task")
        ) {
            setError(
                "أضف عملًا واحدًا على الأقل قبل الإسناد."
            );
            return;
        }

        try {
            await saveMutation.mutateAsync({
                projectId,
                source,
                payload: {
                    rows: result.data.rows,
                },
            });

            setDirty(false);

            if (goToAssignment) {
                navigate(
                    `/projects/${encodeURIComponent(projectId)}/assign`
                );
            } else {
                setMessage("تم حفظ تعديلات الخطة بنجاح.");
            }
        } catch {
            setError(
                "تعذر حفظ الخطة. تحقق من Mock API وحاول مجددًا."
            );
        }
    }

    return (
        <div className="project-setup">
            {/* These forms are submitted by shared Header buttons. */}
            <form
                id="sarh-plan-save-form"
                hidden
                onSubmit={(event) => {
                    event.preventDefault();
                    void savePlan(false);
                }}
            />

            <form
                id="sarh-plan-next-form"
                hidden
                onSubmit={(event) => {
                    event.preventDefault();
                    void savePlan(true);
                }}
            />

            <div className="project-setup__intro">
                <div>
                    <h2>{project.values.name || "مشروع بدون اسم"}</h2>
                    <p>
                        تفصيل الأعمال ومددها وعلاقاتها قبل الإسناد
                    </p>
                </div>

                <span className="project-setup__save-state">
                    {saveMutation.isPending
                        ? "جاري الحفظ..."
                        : dirty
                            ? "تغييرات غير محفوظة"
                            : "لا توجد تغييرات جديدة"}
                </span>
            </div>

            {message && (
                <div
                    className="project-setup__success"
                    role="status"
                >
                    {message}
                </div>
            )}

            {error && (
                <div
                    className="project-setup__error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <ol
                className="project-setup__steps"
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
                            index === 1
                                ? "project-setup__step project-setup__step--active"
                                : "project-setup__step"
                        }
                    >
                        <span>
                            {index === 0 ? "✓" : index + 1}
                        </span>

                        <strong>{step}</strong>
                    </li>
                ))}
            </ol>

            <div className="project-setup__stats">
                <span>
                    <strong>{phasesCount}</strong> مراحل
                </span>

                <span>
                    <strong>{tasksCount}</strong> أعمال
                </span>

                <span>
                    <strong>
                        {rows.reduce(
                            (total, row) =>
                                total + row.checks.length,
                            0
                        )}
                    </strong>{" "}
                    بنود تحقق
                </span>
            </div>

            <div className="project-setup__workspace">
                <ProjectPlanTable
                    rows={rows}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onAddPhase={addPhase}
                    onAddTask={addTask}
                />

                <ProjectPlanDetails
                    key={selected?.id ?? "empty"}
                    selected={selected}
                    rows={rows}
                    onChange={updateSelected}
                    onAddCheck={addCheck}
                    onRemoveCheck={removeCheck}
                />
            </div>
        </div>
    );
}

export function ProjectSetupPage() {
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

    if (!projectId) {
        return (
            <Card>معرف المشروع غير موجود.</Card>
        );
    }

    if (draftQuery.isError) {
        return (
            <Card>
                تعذر العثور على مسودة المشروع.
                ارجع إلى صفحة إنشاء المشروع.
            </Card>
        );
    }

    if (draftQuery.isPending) {
        return (
            <Card>جاري تحميل بيانات المشروع...</Card>
        );
    }

    if (planQuery.isError) {
        return (
            <Card>
                تعذر تحميل الخطة. تحقق من Mock API.
            </Card>
        );
    }

    if (planQuery.isPending) {
        return (
            <Card>جاري تحميل مراحل وأعمال المشروع...</Card>
        );
    }

    return (
        <ProjectSetupEditor
            key={projectId}
            project={draftQuery.data}
            initialPlan={planQuery.data}
        />
    );
}