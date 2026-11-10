import { useState } from "react";
import type { FormEvent } from "react";

import {
    inviteTeamMemberSchema,
} from "../project-assignment.schema";

import type {
    InviteTeamMemberRequest,
    ProjectTeamMember,
    TeamRole,
} from "../project-assignment.types";

import {
    canManageTask,
    teamRoleLabels,
} from "../project-assignment.types";

import type {
    AssignmentGroup,
} from "./ProjectAssignmentTable";

interface BulkAssignDialogProps {
    groups: AssignmentGroup[];
    members: ProjectTeamMember[];
    onClose: () => void;
    onApply: (
        phaseId: string,
        engineerId: string
    ) => void;
}

export function BulkAssignDialog({
    groups,
    members,
    onClose,
    onApply,
}: BulkAssignDialogProps) {
    const [phaseId, setPhaseId] = useState(
        groups[0]?.phaseId ?? ""
    );

    const eligible = members.filter(canManageTask);

    const [engineerId, setEngineerId] = useState(
        eligible[0]?.id ?? ""
    );

    return (
        <div
            className="project-assign__overlay"
            role="presentation"
        >
            <div
                className="project-assign__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="assign-phase-title"
            >
                <div className="project-assign__dialog-head">
                    <div>
                        <h2 id="assign-phase-title">
                            إسناد مرحلة كاملة
                        </h2>

                        <p>
                            سيصبح هذا المهندس مسؤولًا عن جميع
                            أعمال المرحلة، مع الاحتفاظ
                            بالمنفّذين الحاليين.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="project-assign__close"
                        onClick={onClose}
                        aria-label="إغلاق"
                    >
                        ×
                    </button>
                </div>

                <label className="project-assign__field">
                    المرحلة

                    <select
                        value={phaseId}
                        onChange={(event) =>
                            setPhaseId(event.target.value)
                        }
                    >
                        {groups.map((group) => (
                            <option
                                key={group.phaseId}
                                value={group.phaseId}
                            >
                                {group.phaseName}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="project-assign__field">
                    المهندس المسؤول

                    <select
                        value={engineerId}
                        onChange={(event) =>
                            setEngineerId(event.target.value)
                        }
                    >
                        {eligible.map((member) => (
                            <option
                                value={member.id}
                                key={member.id}
                            >
                                {member.name}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="project-assign__dialog-actions">
                    <button
                        type="button"
                        className="project-assign__primary"
                        disabled={!phaseId || !engineerId}
                        onClick={() =>
                            onApply(phaseId, engineerId)
                        }
                    >
                        إسناد
                    </button>

                    <button
                        type="button"
                        className="project-assign__outline"
                        onClick={onClose}
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}

interface InviteMemberDialogProps {
    pending: boolean;
    error: string;
    onClose: () => void;
    onInvite: (
        request: InviteTeamMemberRequest
    ) => Promise<void>;
}

export function InviteMemberDialog({
    pending,
    error,
    onClose,
    onInvite,
}: InviteMemberDialogProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const [role, setRole] = useState<TeamRole>(
        "site_engineer"
    );

    const [validationError, setValidationError] =
        useState("");

    async function submit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const result = inviteTeamMemberSchema.safeParse({
            name,
            phone,
            role,
        });

        if (!result.success) {
            setValidationError(
                result.error.issues[0]?.message ??
                "بيانات الدعوة غير صالحة"
            );
            return;
        }

        setValidationError("");
        await onInvite(result.data);
    }

    return (
        <div
            className="project-assign__overlay"
            role="presentation"
        >
            <form
                className="project-assign__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="invite-member-title"
                onSubmit={(event) => void submit(event)}
            >
                <div className="project-assign__dialog-head">
                    <div>
                        <h2 id="invite-member-title">
                            دعوة عضو
                        </h2>

                        <p>
                            سنضيف دعوة معلّقة داخل Mock API؛
                            لن تُرسل رسالة واتساب في هذه المرحلة.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="project-assign__close"
                        onClick={onClose}
                        aria-label="إغلاق"
                    >
                        ×
                    </button>
                </div>

                <label className="project-assign__field">
                    الاسم

                    <input
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        placeholder="الاسم الكامل"
                    />
                </label>

                <label className="project-assign__field">
                    رقم الجوال

                    <input
                        value={phone}
                        onChange={(event) =>
                            setPhone(event.target.value)
                        }
                        type="tel"
                        placeholder="مثال: 777000000"
                    />
                </label>

                <label className="project-assign__field">
                    الدور

                    <select
                        value={role}
                        onChange={(event) =>
                            setRole(
                                event.target.value as TeamRole
                            )
                        }
                    >
                        {(
                            Object.entries(
                                teamRoleLabels
                            ) as [TeamRole, string][]
                        ).map(([value, label]) => (
                            <option
                                value={value}
                                key={value}
                            >
                                {label}
                            </option>
                        ))}
                    </select>
                </label>

                {(validationError || error) && (
                    <p
                        className="project-assign__error"
                        role="alert"
                    >
                        {validationError || error}
                    </p>
                )}

                <div className="project-assign__dialog-actions">
                    <button
                        type="submit"
                        className="project-assign__primary"
                        disabled={pending}
                    >
                        {pending
                            ? "جاري التسجيل..."
                            : "تسجيل الدعوة"}
                    </button>

                    <button
                        type="button"
                        className="project-assign__outline"
                        onClick={onClose}
                    >
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
}