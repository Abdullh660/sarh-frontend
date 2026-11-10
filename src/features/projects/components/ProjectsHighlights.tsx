import { Link } from "react-router";

import { Card } from "../../../components/ui";

import type {
    ProjectsOverview,
} from "../projects.types";

interface ProjectsHighlightsProps {
    overview: ProjectsOverview;
}

export function ProjectsHighlights({
    overview,
}: ProjectsHighlightsProps) {
    return (
        <div className="projects-highlights">
            <Card className="projects-page__panel projects-highlights__panel">
                <div className="projects-highlights__heading">
                    <h2>مسودة بانتظار الاعتماد</h2>

                    <span className="projects-highlights__muted">
                        اعتماد الخطة
                    </span>
                </div>

                <div className="projects-highlights__approval">
                    <span
                        className="projects-highlights__approval-icon"
                        aria-hidden="true"
                    >
                        <svg
                            width="19"
                            height="19"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <rect
                                x="4"
                                y="3.5"
                                width="10"
                                height="17"
                                rx="1"
                            />
                            <path d="M14 9h5v11.5h-5" />
                        </svg>
                    </span>

                    <div className="projects-highlights__info">
                        <strong>{overview.approval.title}</strong>
                        <span>{overview.approval.description}</span>
                    </div>

                    <Link
                        className="projects-highlights__button projects-highlights__button--dark"
                        to={overview.approval.path}
                    >
                        مراجعة واعتماد
                    </Link>
                </div>
            </Card>

            <Card className="projects-page__panel projects-highlights__panel">
                <div className="projects-highlights__heading">
                    <h2>في مرحلة التسليم</h2>

                    <span className="projects-highlights__status">
                        <span className="projects-highlights__status-dot" />
                        فترة الملاحظات
                    </span>
                </div>

                <div className="projects-highlights__handover">
                    <div className="projects-highlights__info">
                        <strong>{overview.handover.title}</strong>
                        <span>{overview.handover.description}</span>
                    </div>

                    <Link
                        to={overview.handover.path}
                        className="projects-highlights__button projects-highlights__button--dark"
                    >
                        افتح التسليم
                    </Link>
                </div>
            </Card>

            <Card className="projects-page__panel projects-highlights__panel">
                <div className="projects-highlights__heading">
                    <h2>آخر المشاريع المغلقة</h2>

                    <Link
                        to="/projects/archive"
                        className="projects-highlights__button projects-highlights__button--outline"
                    >
                        الأرشيف
                    </Link>
                </div>

                <div className="projects-highlights__closed-list">
                    {overview.recentClosed.map((project) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="projects-highlights__closed-item"
                        >
                            <span className="projects-highlights__info">
                                <strong>{project.name}</strong>
                                <span>{project.description}</span>
                            </span>

                            <span className="projects-highlights__muted">
                                {project.closedAtLabel}
                            </span>
                        </Link>
                    ))}
                </div>
            </Card>
        </div>
    );
}