import { useState } from "react";

import {
    useNavigate,
    useSearchParams,
} from "react-router";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Card } from "../../../components/ui";

import {
    projectDraftSchema,
    projectSubmitSchema,
} from "../projects.schema";

import {
    useDeleteProjectDraft,
    useProjectCreateOptions,
    useProjectDraft,
    useProjectDrafts,
    useSaveProject,
} from "../hooks/useProjectCreation";

import type {
    ProjectCreateOptions,
    ProjectDraft,
    ProjectFormValues,
    ProjectSaveAction,
    ProjectTemplateScope,
} from "../projects.types";

import "./CreateProjectPage.css";

type EntryMode = "template" | "drafts" | "blank";

const steps = [
    ["القالب والبيانات", "المدير · الآن"],
    ["التفصيل والعلاقات", "مدير المشاريع"],
    ["الإسناد", "مدير المشاريع"],
    ["اعتماد الخطة", "المدير"],
];

const nextSteps = [
    [
        "يولّد النظام الخطة",
        "تُجهّز المراحل والأعمال وتواريخها المبدئية",
    ],
    [
        "مدير المشاريع يفصّل",
        "يعدّل المدد والكميات والعلاقات بين الأعمال",
    ],
    [
        "فريق المشروع والإسناد",
        "يحدد المسؤولين والمنفذين لكل عمل",
    ],
    [
        "تعتمد الخطة",
        "تُثبت الخطة الأصلية وتُوزع الأعمال",
    ],
];

function makeDefaultValues(
    options: ProjectCreateOptions
): ProjectFormValues {
    return {
        source: "template",
        templateId: options.templates[0]?.id ?? null,
        name: "",
        location: "",
        owner: "",
        consultant: "",
        startDate: "",
        dueDate: "",
        managerId: options.managers[0]?.id ?? "",
        siteSchedule:
            "6:30 ص – 4:00 م · السبت إلى الخميس",
    };
}

interface CreateProjectFormProps {
    options: ProjectCreateOptions;
    drafts: ProjectDraft[];
    draftId: string | null;
    initialValues: ProjectFormValues;
    saved: boolean;
}

function CreateProjectForm({
    options,
    drafts,
    draftId,
    initialValues,
    saved,
}: CreateProjectFormProps) {
    const navigate = useNavigate();

    const [entryMode, setEntryMode] = useState<EntryMode>(
        initialValues.source === "blank"
            ? "blank"
            : "template"
    );

    const [scope, setScope] =
        useState<ProjectTemplateScope>(() => {
            const selected = options.templates.find(
                (item) =>
                    item.id === initialValues.templateId
            );

            return selected?.scope ?? "provider";
        });

    const [actionError, setActionError] = useState("");

    const saveMutation = useSaveProject();
    const deleteMutation = useDeleteProjectDraft();

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectDraftSchema),
        defaultValues: initialValues,
    });

    const {
        register,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
    } = form;

    const selectedTemplateId = watch("templateId");

    const templates = options.templates.filter(
        (template) => template.scope === scope
    );

    function chooseEntryMode(mode: EntryMode) {
        setEntryMode(mode);

        if (mode === "blank") {
            setValue("source", "blank", {
                shouldDirty: true,
            });

            setValue("templateId", null, {
                shouldDirty: true,
            });
        }

        if (mode === "template") {
            setValue("source", "template", {
                shouldDirty: true,
            });

            const first = options.templates.find(
                (template) => template.scope === scope
            );

            setValue(
                "templateId",
                first?.id ?? null,
                { shouldDirty: true }
            );
        }
    }

    function chooseScope(
        nextScope: ProjectTemplateScope
    ) {
        setScope(nextScope);

        const first = options.templates.find(
            (template) => template.scope === nextScope
        );

        setValue(
            "templateId",
            first?.id ?? null,
            { shouldDirty: true }
        );
    }

    async function save(
        action: ProjectSaveAction,
        values: ProjectFormValues
    ) {
        setActionError("");

        if (action === "continue") {
            const result =
                projectSubmitSchema.safeParse(values);

            if (!result.success) {
                clearErrors();

                for (const issue of result.error.issues) {
                    const field = issue.path[0];

                    if (typeof field === "string") {
                        setError(
                            field as keyof ProjectFormValues,
                            {
                                type: "manual",
                                message: issue.message,
                            }
                        );
                    }
                }

                setActionError(
                    "أكمل الحقول المطلوبة قبل المتابعة."
                );

                return;
            }
        }

        try {
            const result =
                await saveMutation.mutateAsync({
                    draftId,
                    payload: {
                        values,
                        action,
                    },
                });

            if (action === "continue") {
                navigate(
                    `/projects/${result.id}/setup`
                );
            } else {
                navigate(
                    `/projects/new?draft=${encodeURIComponent(
                        result.id
                    )}&saved=1`,
                    { replace: true }
                );
            }
        } catch {
            setActionError(
                "تعذر حفظ المشروع. حاول مرة أخرى."
            );
        }
    }

    async function onDraftSubmit(
        values: ProjectFormValues
    ) {
        if (saveMutation.isPending) {
            return;
        }

        await save("draft", values);
    }

    async function deleteDraft(id: string) {
        const confirmed = window.confirm(
            "هل تريد حذف هذه المسودة؟"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(id);

            if (draftId === id) {
                navigate("/projects/new");
            }
        } catch {
            setActionError("تعذر حذف المسودة.");
        }
    }

    function continueDraft(draft: ProjectDraft) {
        if (draft.stage === "setup") {
            navigate(
                `/projects/${draft.id}/setup`
            );
        } else {
            navigate(
                `/projects/new?draft=${encodeURIComponent(
                    draft.id
                )}`
            );
        }
    }

    return (
        <form
            id="sarh-create-project-form"
            className="project-create"
            onSubmit={form.handleSubmit(onDraftSubmit)}
            aria-busy={saveMutation.isPending}
            noValidate
        >
            {saved && draftId && (
                <div
                    className="project-create__message"
                    role="status"
                >
                    تم حفظ المسودة بنجاح داخل Mock API.
                </div>
            )}

            {actionError && (
                <div
                    className="project-create__error"
                    role="alert"
                >
                    {actionError}
                </div>
            )}

            <ol
                className="project-create__steps"
                aria-label="خطوات إنشاء المشروع"
            >
                {steps.map(
                    ([title, subtitle], index) => (
                        <li
                            key={title}
                            className={
                                index === 0
                                    ? "project-create__step project-create__step--active"
                                    : "project-create__step"
                            }
                        >
                            <span className="project-create__step-number">
                                {index + 1}
                            </span>

                            <span>
                                <strong>{title}</strong>
                                <small>{subtitle}</small>
                            </span>
                        </li>
                    )
                )}
            </ol>

            <div className="project-create__columns">
                <div className="project-create__main">
                    <Card className="project-create__panel">
                        <div className="project-create__section-heading">
                            <div>
                                <h2>من وين تبدأ؟</h2>

                                <p>
                                    اختر طريقة البداية. يمكنك حفظ
                                    البيانات كمسودة والعودة إليها لاحقًا.
                                </p>
                            </div>

                            <span className="project-create__saved-state">
                                {draftId
                                    ? "مسودة موجودة"
                                    : "لم يتم الحفظ بعد"}
                            </span>
                        </div>

                        <div className="project-create__sources">
                            {[
                                {
                                    id: "template",
                                    title: "من قالب",
                                    description:
                                        "قوالب جاهزة أو قوالب شركتك المحفوظة",
                                },
                                {
                                    id: "drafts",
                                    title: `كمّل مسودة (${drafts.length})`,
                                    description:
                                        "ارجع إلى مشروع حفظته سابقًا",
                                },
                                {
                                    id: "blank",
                                    title: "خطة فاضية",
                                    description:
                                        "أنشئ المشروع من الصفر",
                                },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    aria-pressed={
                                        entryMode === item.id
                                    }
                                    className={[
                                        "project-create__source",
                                        entryMode === item.id
                                            ? "project-create__source--selected"
                                            : "",
                                    ].join(" ")}
                                    onClick={() =>
                                        chooseEntryMode(
                                            item.id as EntryMode
                                        )
                                    }
                                >
                                    <strong>{item.title}</strong>
                                    <span>{item.description}</span>
                                </button>
                            ))}
                        </div>

                        {entryMode === "template" && (
                            <div className="project-create__templates">
                                <div className="project-create__tabs">
                                    <button
                                        type="button"
                                        aria-pressed={
                                            scope === "provider"
                                        }
                                        onClick={() =>
                                            chooseScope("provider")
                                        }
                                    >
                                        قوالب كودو تيك
                                    </button>

                                    <button
                                        type="button"
                                        aria-pressed={
                                            scope === "company"
                                        }
                                        onClick={() =>
                                            chooseScope("company")
                                        }
                                    >
                                        قوالب شركتي
                                    </button>
                                </div>

                                <div className="project-create__template-grid">
                                    {templates.map((template) => (
                                        <button
                                            key={template.id}
                                            type="button"
                                            className="project-create__template"
                                            aria-pressed={
                                                selectedTemplateId ===
                                                template.id
                                            }
                                            onClick={() =>
                                                setValue(
                                                    "templateId",
                                                    template.id,
                                                    { shouldDirty: true }
                                                )
                                            }
                                        >
                                            <small>
                                                {template.description}
                                            </small>

                                            <strong>
                                                {template.name}
                                            </strong>

                                            <span>
                                                {template.meta}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {errors.templateId && (
                                    <p className="project-create__field-error">
                                        {errors.templateId.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {entryMode === "drafts" && (
                            <div className="project-create__drafts">
                                {drafts.length === 0 ? (
                                    <p>لا توجد مسودات محفوظة.</p>
                                ) : (
                                    drafts.map((draft) => (
                                        <div
                                            className="project-create__draft"
                                            key={draft.id}
                                        >
                                            <div>
                                                <strong>
                                                    {draft.values.name ||
                                                        "مشروع بدون اسم"}
                                                </strong>

                                                <p>
                                                    {draft.stage === "setup"
                                                        ? "التفصيل والعلاقات"
                                                        : "القالب والبيانات"}
                                                </p>
                                            </div>

                                            <div className="project-create__draft-actions">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="dark"
                                                    onClick={() =>
                                                        continueDraft(draft)
                                                    }
                                                >
                                                    كمّل
                                                </Button>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={
                                                        deleteMutation.isPending
                                                    }
                                                    onClick={() =>
                                                        void deleteDraft(
                                                            draft.id
                                                        )
                                                    }
                                                >
                                                    حذف
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {entryMode === "blank" && (
                            <p className="project-create__blank-note">
                                ستبدأ بخطة فارغة، وتضيف المراحل
                                والأعمال بنفسك في الخطوة التالية.
                            </p>
                        )}
                    </Card>

                    <Card className="project-create__panel">
                        <h2>بيانات المشروع</h2>

                        <div className="project-create__fields">
                            <label>
                                اسم المشروع

                                <input
                                    placeholder="فرع أمجاد المكلا · الديس"
                                    aria-invalid={
                                        Boolean(errors.name)
                                    }
                                    {...register("name")}
                                />

                                {errors.name && (
                                    <small className="project-create__field-error">
                                        {errors.name.message}
                                    </small>
                                )}
                            </label>

                            <label>
                                الموقع على الخريطة

                                <input
                                    placeholder="الديس، المكلا"
                                    aria-invalid={
                                        Boolean(errors.location)
                                    }
                                    {...register("location")}
                                />

                                {errors.location && (
                                    <small className="project-create__field-error">
                                        {errors.location.message}
                                    </small>
                                )}
                            </label>

                            <label>
                                المالك

                                <input
                                    placeholder="أمجاد · 777 000 000"
                                    aria-invalid={
                                        Boolean(errors.owner)
                                    }
                                    {...register("owner")}
                                />

                                <small>
                                    رابط متابعة المالك سيُجهّز لاحقًا.
                                </small>

                                {errors.owner && (
                                    <small className="project-create__field-error">
                                        {errors.owner.message}
                                    </small>
                                )}
                            </label>

                            <label>
                                الاستشاري

                                <input
                                    placeholder="مكتب الإشراف الهندسي"
                                    {...register("consultant")}
                                />

                                <small>
                                    رابط طلبات الاستلام سيُجهّز لاحقًا.
                                </small>
                            </label>

                            <label>
                                تاريخ البداية

                                <input
                                    type="date"
                                    aria-invalid={
                                        Boolean(errors.startDate)
                                    }
                                    {...register("startDate")}
                                />

                                {errors.startDate && (
                                    <small className="project-create__field-error">
                                        {errors.startDate.message}
                                    </small>
                                )}
                            </label>

                            <label>
                                التسليم المطلوب

                                <input
                                    type="date"
                                    aria-invalid={
                                        Boolean(errors.dueDate)
                                    }
                                    {...register("dueDate")}
                                />

                                {errors.dueDate && (
                                    <small className="project-create__field-error">
                                        {errors.dueDate.message}
                                    </small>
                                )}
                            </label>

                            <label>
                                مدير المشاريع

                                <select
                                    aria-invalid={
                                        Boolean(errors.managerId)
                                    }
                                    {...register("managerId")}
                                >
                                    {options.managers.map(
                                        (manager) => (
                                            <option
                                                key={manager.id}
                                                value={manager.id}
                                            >
                                                {manager.name}
                                            </option>
                                        )
                                    )}
                                </select>

                                <small>
                                    يفصّل المشروع ويسند الأعمال.
                                </small>

                                {errors.managerId && (
                                    <small className="project-create__field-error">
                                        {errors.managerId.message}
                                    </small>
                                )}
                            </label>

                            <label>
                                دوام الموقع

                                <input
                                    {...register("siteSchedule")}
                                />

                                <small>
                                    يُستخدم لاحقًا في احتساب تذكيرات
                                    نهاية اليوم.
                                </small>
                            </label>
                        </div>
                    </Card>
                </div>

                <aside className="project-create__next">
                    <h2>بعد هذه الخطوة</h2>

                    {nextSteps.map(
                        ([title, description], index) => (
                            <div
                                className="project-create__next-item"
                                key={title}
                            >
                                <span>{index + 1}</span>

                                <div>
                                    <strong>{title}</strong>
                                    <p>{description}</p>
                                </div>
                            </div>
                        )
                    )}

                    <Button
                        type="button"
                        disabled={
                            saveMutation.isPending
                        }
                        onClick={() =>
                            void form.handleSubmit(
                                (values) =>
                                    save("continue", values)
                            )()
                        }
                    >
                        إنشاء والانتقال للتفصيل
                    </Button>
                </aside>
            </div>
        </form>
    );
}

export function CreateProjectPage() {
    const [searchParams] = useSearchParams();

    const draftId = searchParams.get("draft");
    const saved =
        searchParams.get("saved") === "1";

    const optionsQuery =
        useProjectCreateOptions();

    const draftsQuery =
        useProjectDrafts();

    const draftQuery =
        useProjectDraft(draftId);

    if (
        optionsQuery.isPending ||
        draftsQuery.isPending ||
        (draftId && draftQuery.isPending)
    ) {
        return (
            <Card>
                جاري تجهيز نموذج المشروع...
            </Card>
        );
    }

    if (
        optionsQuery.isError ||
        draftsQuery.isError ||
        (draftId && draftQuery.isError)
    ) {
        return (
            <Card>
                تعذر تحميل بيانات إنشاء المشروع.
                تحقق من Mock API.
            </Card>
        );
    }

    const options = optionsQuery.data;
    const drafts = draftsQuery.data;

    const initialValues =
        draftId && draftQuery.data
            ? draftQuery.data.values
            : makeDefaultValues(options);

    return (
        <CreateProjectForm
            key={draftId ?? "new"}
            options={options}
            drafts={drafts}
            draftId={draftId}
            initialValues={initialValues}
            saved={saved}
        />
    );
}