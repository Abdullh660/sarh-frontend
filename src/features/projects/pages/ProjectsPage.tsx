import { useState } from "react";

import { Button, Card, Badge } from "../../../components/ui";
import { useProjects } from "../hooks/useProjects";

import "./ProjectsPage.css";

type ProjectFilter = "all" | "active";

export function ProjectsPage() {
    const [filter, setFilter] = useState<ProjectFilter>("all");

    const {
        data: projects = [],
        isPending,
        isError,
    } = useProjects();

    if (isPending) {
        return <main className="page-container">جاري تحميل المشاريع...</main>;
    }

    if (isError) {
        return <main className="page-container">حدث خطأ أثناء تحميل المشاريع.</main>;
    }

    const filteredProjects = projects.filter((project) => {
        if (filter === "all") return true;

        return project.status === "active";
    });

    return (
        <main className="page-container projects-page">
            <header className="projects-page__header">
                <div>
                    <h1>المشاريع</h1>
                    <p>قائمة المشاريع المسجلة في النظام</p>
                </div>

                <Badge variant="neutral">
                    {projects.length} مشاريع
                </Badge>
            </header>

            <Card>
                <div className="projects-page__filters">
                    <Button
                        variant={filter === "all" ? "primary" : "outline"}
                        size="sm"
                        aria-pressed={filter === "all"}
                        onClick={() => setFilter("all")}
                    >
                        كل المشاريع
                    </Button>

                    <Button
                        variant={filter === "active" ? "primary" : "outline"}
                        size="sm"
                        aria-pressed={filter === "active"}
                        onClick={() => setFilter("active")}
                    >
                        الجارية
                    </Button>
                </div>

                {filteredProjects.length === 0 ? (
                    <p>لا توجد مشاريع مطابقة.</p>
                ) : (
                    <ul className="projects-page__list">
                        {filteredProjects.map((project) => (
                            <li
                                className="projects-page__item"
                                key={project.id}
                            >
                                <div>
                                    <strong>{project.name}</strong>
                                    <p>{project.id}</p>
                                </div>

                                <Badge
                                    variant={
                                        project.status === "completed"
                                            ? "success"
                                            : "warning"
                                    }
                                >
                                    {project.status === "completed"
                                        ? "مكتمل"
                                        : "قيد التنفيذ"}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </main>
    );
}