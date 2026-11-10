import { useSearchParams } from "react-router";

import { Button, Card } from "../../../components/ui";

import { ProjectSummaryGrid } from "../components/ProjectSummaryGrid";
import { ProjectsTable } from "../components/ProjectsTable";
import { ProjectsHighlights } from "../components/ProjectsHighlights";

import { useProjects } from "../hooks/useProjects";
import { useProjectsOverview } from "../hooks/useProjectsOverview";

import type {
    ProjectSort,
    ProjectStatus,
} from "../projects.types";

import "./ProjectsPage.css";

function getStatus(
    value: string | null
): ProjectStatus {
    if (value === "draft" || value === "closed") {
        return value;
    }

    return "active";
}

function getSort(
    value: string | null
): ProjectSort {
    if (value === "nearest" || value === "name") {
        return value;
    }

    return "priority";
}

export function ProjectsPage() {
    const [searchParams, setSearchParams] =
        useSearchParams();

    const status = getStatus(
        searchParams.get("status")
    );

    const sort = getSort(
        searchParams.get("sort")
    );

    const projectsQuery = useProjects({
        status,
        sort,
    });

    const overviewQuery = useProjectsOverview();

    function changeStatus(nextStatus: ProjectStatus) {
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current);

                next.set("status", nextStatus);

                return next;
            },
            { replace: true }
        );
    }

    function changeSort(nextSort: ProjectSort) {
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current);

                next.set("sort", nextSort);

                return next;
            },
            { replace: true }
        );
    }

    if (
        projectsQuery.isPending ||
        overviewQuery.isPending
    ) {
        return (
            <section className="projects-page">
                <Card className="projects-page__panel">
                    جاري تحميل بيانات المشاريع...
                </Card>
            </section>
        );
    }

    if (
        projectsQuery.isError ||
        overviewQuery.isError
    ) {
        return (
            <section className="projects-page">
                <Card className="projects-page__panel">
                    <div
                        className="projects-page__error"
                        role="alert"
                    >
                        <strong>
                            تعذر تحميل بيانات المشاريع
                        </strong>

                        <p>
                            تأكد من اتصال API أو تشغيل Mock API.
                        </p>

                        <Button
                            onClick={() => {
                                void projectsQuery.refetch();
                                void overviewQuery.refetch();
                            }}
                        >
                            إعادة المحاولة
                        </Button>
                    </div>
                </Card>
            </section>
        );
    }

    const projects = projectsQuery.data;
    const overview = overviewQuery.data;

    return (
        <div className="projects-page">
            <Card className="projects-page__panel">
                <div className="projects-page__intro">
                    <h2>كل المشاريع</h2>
                    <p>{overview.description}</p>
                </div>

                <ProjectSummaryGrid
                    metrics={overview.metrics}
                />
            </Card>

            <Card className="projects-page__panel">
                <ProjectsTable
                    result={projects}
                    counts={overview.counts}
                    status={status}
                    sort={sort}
                    onStatusChange={changeStatus}
                    onSortChange={changeSort}
                />
            </Card>

            <ProjectsHighlights overview={overview} />
        </div>
    );
}