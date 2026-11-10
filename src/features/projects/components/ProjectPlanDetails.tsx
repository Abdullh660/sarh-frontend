import { useState } from "react";

import type {
    ProjectPlanRow,
    PlanCheckRequirement,
    PlanRelationType,
} from "../project-plan.types";

interface ProjectPlanDetailsProps {
    selected: ProjectPlanRow | null;
    rows: ProjectPlanRow[];
    onChange: (patch: Partial<ProjectPlanRow>) => void;
    onAddCheck: (
        text: string,
        requirement: PlanCheckRequirement
    ) => void;
    onRemoveCheck: (id: string) => void;
}

const requirementLabels: Record<
    PlanCheckRequirement,
    string
> = {
    photo: "صورة",
    signature: "توقيع مدير المشاريع",
    none: "لا شيء",
};

export function ProjectPlanDetails({
    selected,
    rows,
    onChange,
    onAddCheck,
    onRemoveCheck,
}: ProjectPlanDetailsProps) {
    const [checkText, setCheckText] = useState("");
    const [requirement, setRequirement] =
        useState<PlanCheckRequirement>("photo");

    if (!selected) {
        return (
            <aside className="project-setup__details">
                <h2>تفاصيل العمل</h2>
                <p>
                    اختر مرحلة أو عملًا من الجدول لعرض تفاصيله.
                </p>
            </aside>
        );
    }

    function changeRelation(type: PlanRelationType) {
        onChange({
            dependency: {
                type,
                targetId: null,
                fixedDate: null,
            },
        });
    }

    function addCheck() {
        if (!checkText.trim()) {
            return;
        }

        onAddCheck(checkText.trim(), requirement);
        setCheckText("");
    }

    const relationOptions = rows.filter(
        (row) => row.id !== selected.id
    );

    return (
        <aside className="project-setup__details">
            <div className="project-setup__details-heading">
                <span>تفاصيل البند</span>

                <h2>
                    {selected.code} · {selected.name}
                </h2>
            </div>

            <div className="project-setup__field">
                <label htmlFor="plan-row-name">
                    اسم المرحلة أو العمل
                </label>

                <input
                    id="plan-row-name"
                    value={selected.name}
                    onChange={(event) =>
                        onChange({
                            name: event.target.value,
                        })
                    }
                />
            </div>

            <div className="project-setup__field">
                <label htmlFor="plan-duration">
                    المدة بالأيام
                </label>

                <input
                    id="plan-duration"
                    type="number"
                    min={selected.kind === "task" ? 1 : 0}
                    value={selected.durationDays}
                    onChange={(event) =>
                        onChange({
                            durationDays: Number(
                                event.target.value
                            ),
                        })
                    }
                />
            </div>

            <div className="project-setup__divider" />

            <h3>متى يبدأ؟</h3>

            <div className="project-setup__relations">
                {[
                    { value: "after", label: "بعد انتهاء عمل" },
                    {
                        value: "parallel",
                        label: "بالتوازي مع عمل",
                    },
                    {
                        value: "fixed",
                        label: "بتاريخ ثابت",
                    },
                    {
                        value: "none",
                        label: "بدون علاقة محددة",
                    },
                ].map((option) => (
                    <label key={option.value}>
                        <input
                            type="radio"
                            name={`relation-${selected.id}`}
                            checked={
                                selected.dependency.type ===
                                option.value
                            }
                            onChange={() =>
                                changeRelation(
                                    option.value as PlanRelationType
                                )
                            }
                        />

                        {option.label}
                    </label>
                ))}
            </div>

            {(selected.dependency.type === "after" ||
                selected.dependency.type === "parallel") && (
                    <div className="project-setup__field">
                        <label htmlFor="plan-dependency">
                            العمل المرتبط
                        </label>

                        <select
                            id="plan-dependency"
                            value={selected.dependency.targetId ?? ""}
                            onChange={(event) =>
                                onChange({
                                    dependency: {
                                        ...selected.dependency,
                                        targetId:
                                            event.target.value || null,
                                    },
                                })
                            }
                        >
                            <option value="">اختر عملًا</option>

                            {relationOptions.map((row) => (
                                <option key={row.id} value={row.id}>
                                    {row.code} · {row.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

            {selected.dependency.type === "fixed" && (
                <div className="project-setup__field">
                    <label htmlFor="plan-fixed-date">
                        تاريخ البداية
                    </label>

                    <input
                        id="plan-fixed-date"
                        type="date"
                        value={
                            selected.dependency.fixedDate ?? ""
                        }
                        onChange={(event) =>
                            onChange({
                                dependency: {
                                    ...selected.dependency,
                                    fixedDate:
                                        event.target.value || null,
                                },
                            })
                        }
                    />
                </div>
            )}

            <div className="project-setup__divider" />

            <div className="project-setup__field">
                <label htmlFor="plan-assignee">
                    المهندس المسؤول / المنفّذ
                </label>

                <input
                    id="plan-assignee"
                    value={selected.assignee}
                    placeholder="اسم المهندس أو فريق التنفيذ"
                    onChange={(event) =>
                        onChange({
                            assignee: event.target.value,
                        })
                    }
                />
            </div>

            <div className="project-setup__field">
                <label htmlFor="plan-quantity">
                    الكمية
                </label>

                <input
                    id="plan-quantity"
                    value={selected.quantity}
                    placeholder="مثال: 500 م²"
                    onChange={(event) =>
                        onChange({
                            quantity: event.target.value,
                        })
                    }
                />
            </div>

            <div className="project-setup__field">
                <label htmlFor="plan-description">
                    التوصيف
                </label>

                <textarea
                    id="plan-description"
                    rows={4}
                    value={selected.description}
                    onChange={(event) =>
                        onChange({
                            description: event.target.value,
                        })
                    }
                />
            </div>

            {selected.kind === "task" && (
                <section className="project-setup__checks">
                    <h3>بنود التحقق عند القفل</h3>

                    {selected.checks.length === 0 ? (
                        <p>لا توجد بنود تحقق بعد.</p>
                    ) : (
                        <ul>
                            {selected.checks.map((check) => (
                                <li key={check.id}>
                                    <div>
                                        <strong>{check.text}</strong>
                                        <small>
                                            {requirementLabels[
                                                check.requirement
                                            ]}
                                        </small>
                                    </div>

                                    <button
                                        type="button"
                                        aria-label={`حذف بند ${check.text}`}
                                        onClick={() =>
                                            onRemoveCheck(check.id)
                                        }
                                    >
                                        حذف
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <label
                        className="project-setup__field"
                        htmlFor="plan-new-check"
                    >
                        بند تحقق جديد
                        <input
                            id="plan-new-check"
                            value={checkText}
                            placeholder="مثال: التأكد من استقامة الجدران"
                            onChange={(event) =>
                                setCheckText(event.target.value)
                            }
                        />
                    </label>

                    <div className="project-setup__check-actions">
                        <select
                            aria-label="متطلبات بند التحقق"
                            value={requirement}
                            onChange={(event) =>
                                setRequirement(
                                    event.target.value as PlanCheckRequirement
                                )
                            }
                        >
                            <option value="photo">صورة</option>
                            <option value="signature">
                                توقيع مدير المشاريع
                            </option>
                            <option value="none">لا شيء</option>
                        </select>

                        <button
                            type="button"
                            disabled={!checkText.trim()}
                            onClick={addCheck}
                        >
                            + أضف بند تحقق
                        </button>
                    </div>
                </section>
            )}
        </aside>
    );
}