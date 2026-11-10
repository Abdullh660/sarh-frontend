import { Link } from "react-router";

import type {
    Project,
    ProjectHealth,
    ProjectListResult,
    ProjectSort,
    ProjectStatus,
} from "../projects.types";

interface ProjectsTableProps {
    result: ProjectListResult;
    counts: Record<ProjectStatus, number>;

    status: ProjectStatus;
    sort: ProjectSort;

    onStatusChange: (status: ProjectStatus) => void;
    onSortChange: (sort: ProjectSort) => void;
}

const statusTabs: {
    value: ProjectStatus;
    label: string;
}[] = [
        { value: "active", label: "جارية" },
        { value: "draft", label: "مسودات" },
        { value: "closed", label: "مغلقة" },
    ];

const sectionTitles: Record<ProjectStatus, string> = {
    active: "المشاريع الجارية",
    draft: "مسودات المشاريع",
    closed: "المشاريع المغلقة",
};

const healthLabels: Record<ProjectHealth, string> = {
    late: "متأخر",
    watch: "يحتاج متابعة",
    on_track: "على المسار",
};

function clampProgress(value: number): number {
    return Math.min(100, Math.max(0, value));
}

function ProjectProgress({ project }: { project: Project }) {
    const actual = clampProgress(project.actualProgress);
    const planned = clampProgress(project.plannedProgress);

    return (
        <div className="projects-table__progress">
            <div className="projects-table__progress-label">
                <strong>{actual}%</strong>
                <span>· المخطط {planned}%</span>
            </div>

            <div
                className="projects-table__progress-track"
                role="img"
                aria-label={`المنجز ${actual}%، والمخطط ${planned}%`}
            >
                <span
                    className="projects-table__progress-fill"
                    style={{ width: `${actual}%` }}
                />

                <span
                    className="projects-table__progress-target"
                    style={{
                        insetInlineStart: `${planned}%`,
                    }}
                />
            </div>
        </div>
    );
}

function ProjectHealthLabel({
    project,
}: {
    project: Project;
}) {
    if (project.status === "draft") {
        return (
            <span className="projects-table__health">
                <span className="projects-table__health-dot projects-table__health-dot--draft" />
                مسودة
            </span>
        );
    }

    if (project.status === "closed") {
        return (
            <span className="projects-table__health">
                <span className="projects-table__health-dot projects-table__health-dot--closed" />
                مغلق
            </span>
        );
    }

    if (!project.health) {
        return <span>—</span>;
    }

    return (
        <span className="projects-table__health">
            <span
                className={`projects-table__health-dot projects-table__health-dot--${project.health}`}
            />
            {healthLabels[project.health]}
        </span>
    );
}

function ProjectRow({ project }: { project: Project }) {
    return (
        <tr>
            <td>
                <Link
                    className="projects-table__project"
                    to={`/projects/${project.id}`}
                >
                    <span className="projects-table__project-icon">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <rect
                                x="4"
                                y="3.5"
                                width="10"
                                height="17"
                                rx="1"
                            />
                            <path d="M14 9h5v11.5h-5M7 7.5h1.5M7 11h1.5M7 14.5h1.5" />
                        </svg>
                    </span>

                    <span className="projects-table__project-info">
                        <strong>{project.name}</strong>
                        <span>{project.description}</span>
                    </span>
                </Link>
            </td>

            <td>{project.engineer}</td>

            <td className="projects-table__muted">
                {project.owner}
            </td>

            <td>
                <ProjectProgress project={project} />
            </td>

            <td>
                <div className="projects-table__delivery">
                    <strong>{project.dueLabel}</strong>
                    <span>{project.deliveryNote}</span>
                </div>
            </td>

            <td>
                <ProjectHealthLabel project={project} />
            </td>
        </tr>
    );
}

export function ProjectsTable({
    result,
    counts,
    status,
    sort,
    onStatusChange,
    onSortChange,
}: ProjectsTableProps) {
    return (
        <section className="projects-table-section">
            <div className="projects-table__toolbar">
                <h2>{sectionTitles[status]}</h2>

                <label className="projects-table__sort">
                    <span>ترتيب:</span>

                    <select
                        value={sort}
                        onChange={(event) =>
                            onSortChange(
                                event.target.value as ProjectSort
                            )
                        }
                    >
                        <option value="priority">
                            الأحوج للتدخّل أولًا
                        </option>

                        <option value="nearest">
                            الأقرب تسليمًا
                        </option>

                        <option value="name">
                            الاسم
                        </option>
                    </select>
                </label>

                <div
                    className="projects-table__tabs"
                    role="group"
                    aria-label="تصفية المشاريع حسب الحالة"
                >
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            aria-pressed={status === tab.value}
                            className={[
                                "projects-table__tab",
                                status === tab.value
                                    ? "projects-table__tab--active"
                                    : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            onClick={() => onStatusChange(tab.value)}
                        >
                            {tab.label} {counts[tab.value]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="projects-table__scroll">
                <table className="projects-table">
                    <thead>
                        <tr>
                            <th scope="col">المشروع</th>
                            <th scope="col">مهندس الموقع</th>
                            <th scope="col">المالك</th>
                            <th scope="col">الإنجاز مقابل المخطط</th>
                            <th scope="col">التسليم</th>
                            <th scope="col">الصحة</th>
                        </tr>
                    </thead>

                    <tbody>
                        {result.items.map((project) => (
                            <ProjectRow
                                key={project.id}
                                project={project}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {result.items.length === 0 && (
                <div className="projects-table__empty">
                    لا توجد مشاريع في هذا التصنيف.
                </div>
            )}

            {result.items.length < result.total && (
                <p className="projects-table__notice">
                    يتم حاليًا عرض {result.items.length} من أصل{" "}
                    {result.total} مشاريع في البيانات التجريبية.
                    ستكتمل القائمة عند ربط API الفعلي.
                </p>
            )}
        </section>
    );
}