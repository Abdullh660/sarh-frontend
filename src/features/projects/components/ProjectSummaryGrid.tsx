import { Link } from "react-router";

import type {
    ProjectOverviewMetric,
} from "../projects.types";

interface ProjectSummaryGridProps {
    metrics: ProjectOverviewMetric[];
}

export function ProjectSummaryGrid({
    metrics,
}: ProjectSummaryGridProps) {
    return (
        <div className="projects-summary">
            {metrics.map((metric) => (
                <Link
                    key={metric.id}
                    to={metric.path}
                    className={[
                        "projects-summary__card",
                        metric.tone === "primary"
                            ? "projects-summary__card--primary"
                            : "",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    <span className="projects-summary__label">
                        {metric.dot && (
                            <span
                                className={`projects-summary__dot projects-summary__dot--${metric.dot}`}
                                aria-hidden="true"
                            />
                        )}

                        {metric.title}
                    </span>

                    <span className="projects-summary__value">
                        {metric.value}

                        {metric.valueSecondary && (
                            <small>{metric.valueSecondary}</small>
                        )}
                    </span>

                    <span
                        className={[
                            "projects-summary__description",
                            metric.descriptionTone === "danger"
                                ? "projects-summary__description--danger"
                                : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        {metric.description}
                    </span>
                </Link>
            ))}
        </div>
    );
}