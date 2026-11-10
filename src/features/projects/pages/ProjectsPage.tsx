import { useProjects } from "../hooks/useProjects";

export function ProjectsPage() {
    const { data: projects, isPending, isError } = useProjects();

    if (isPending) {
        return <main>جاري تحميل المشاريع...</main>;
    }

    if (isError) {
        return <main>حدث خطأ أثناء تحميل المشاريع.</main>;
    }

    return (
        <main className="page-container">
            <h1>المشاريع</h1>

            <p>قائمة المشاريع المسجلة في النظام</p>

            {projects.length === 0 ? (
                <p>لا توجد مشاريع.</p>
            ) : (
                <ul className="project-list">
                    {projects.map((project) => (
                        <li key={project.id}>
                            <strong>{project.name}</strong>

                            <span>
                                {project.status === "active"
                                    ? "قيد التنفيذ"
                                    : "مكتمل"}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}