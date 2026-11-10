import type {
    ProjectTeamMember,
    AssignmentExecutor,
    TaskAssignment,
} from "../project-assignment.types";

import {
    teamRoleLabels,
} from "../project-assignment.types";

interface ProjectAssignmentTeamProps {
    members: ProjectTeamMember[];
    executors: AssignmentExecutor[];
    assignments: TaskAssignment[];
    onInvite: () => void;
}

export function ProjectAssignmentTeam({
    members,
    executors,
    assignments,
    onInvite,
}: ProjectAssignmentTeamProps) {
    return (
        <aside className="project-assign__panel project-assign__team">
            <h2>الفريق المتاح</h2>

            {members.map((member) => {
                const count = assignments.filter(
                    (assignment) =>
                        assignment.engineerId === member.id
                ).length;

                return (
                    <div
                        className="project-assign__member"
                        key={member.id}
                    >
                        <span className="project-assign__avatar">
                            {member.name.charAt(0)}
                        </span>

                        <span className="project-assign__member-details">
                            <strong>{member.name}</strong>
                            <small>
                                {teamRoleLabels[member.role]}
                            </small>
                        </span>

                        <span className="project-assign__member-load">
                            {member.status === "invited"
                                ? "دعوة معلّقة"
                                : `${count} أعمال`}
                        </span>
                    </div>
                );
            })}

            {executors
                .filter(
                    (executor) =>
                        executor.kind === "contractor"
                )
                .map((executor) => {
                    const count = assignments.filter(
                        (assignment) =>
                            assignment.executorId === executor.id
                    ).length;

                    return (
                        <div
                            className="project-assign__member"
                            key={executor.id}
                        >
                            <span className="project-assign__avatar">
                                {executor.name.charAt(0)}
                            </span>

                            <span className="project-assign__member-details">
                                <strong>
                                    {executor.name}
                                </strong>
                                <small>
                                    مقاول متخصص · رابط
                                </small>
                            </span>

                            <span className="project-assign__member-load">
                                {count} أعمال
                            </span>
                        </div>
                    );
                })}

            <p className="project-assign__help">
                لا يحتاج الفنيون إلى حسابات. يُسند العمل
                لمهندس مسؤول يتابع تنفيذهم. الدعوات
                التجريبية لا ترسل رسائل واتساب فعلية.
            </p>

            <button
                type="button"
                className="project-assign__outline project-assign__invite"
                onClick={onInvite}
            >
                + دعوة عضو برقم الجوال
            </button>
        </aside>
    );
}