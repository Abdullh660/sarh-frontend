import { useState } from "react";

import {
    Button,
    Card,
    Badge,
} from "../../../components/ui";

import { useProjects } from "../hooks/useProjects";

import "./ProjectsPage.css";

type ProjectFilter = "all" | "active";

export function ProjectsPage() {
    const [filter, setFilter] =
        useState<ProjectFilter>("all");

    const {
        data: projects = [],
        isPending,
        isError,
    } = useProjects();

    if (isPending) {
        return (
            <section className="projects-page">
                <Card>جاري تحميل المشاريع...</Card>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="projects-page" role="alert">
                <Card>حدث خطأ أثناء تحميل المشاريع.</Card>
            </section>
        );
    }

    const filteredProjects = projects.filter((project) => {
        if (filter === "all") {
            return true;
        }

        return project.status === "active";
    });

    return (
        <section className="projects-page">
            <div className="projects-page__header">
                <div>
                    <h2>كل المشاريع</h2>
                    <p>قائمة المشاريع المسجلة في النظام</p>
                </div>

                <Badge variant="neutral">
                    {projects.length} مشاريع
                </Badge>
            </div>

            <Card>
                <div className="projects-page__filters">
                    <Button
                        variant={
                            filter === "all" ? "primary" : "outline"
                        }
                        size="sm"
                        aria-pressed={filter === "all"}
                        onClick={() => setFilter("all")}
                    >
                        كل المشاريع
                    </Button>

                    <Button
                        variant={
                            filter === "active" ? "primary" : "outline"
                        }
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
                                key={project.id}
                                className="projects-page__item"
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
        </section>
    );
}