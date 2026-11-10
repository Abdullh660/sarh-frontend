import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router";

import { AppLayout } from "../../components/layout/AppLayout";

import {
    pendingPages,
} from "../../core/navigation/navigation.config";

import {
    ProjectsPage,
    CreateProjectPage,
} from "../../features/projects";

interface PendingPageProps {
    title: string;
}

function PendingPage({ title }: PendingPageProps) {
    return (
        <section className="sarh-pending-page">
            <h2>{title}</h2>
            <p>
                هذه الواجهة قيد التحويل إلى React.
                سيتم تجهيزها في المراحل القادمة.
            </p>
        </section>
    );
}

function NotFoundPage() {
    return (
        <section className="sarh-pending-page">
            <h2>الصفحة غير موجودة</h2>
            <p>تأكد من عنوان الصفحة.</p>
        </section>
    );
}

const additionalPendingRoutes = [
    { path: "projects/archive", title: "أرشيف المشاريع" },
    { path: "approvals", title: "الاعتمادات" },
    { path: "blockers", title: "العوائق" },
    { path: "planning", title: "الخطة الزمنية" },
    { path: "handover", title: "التسليم" },
    { path: "custody", title: "العُهد" },
    { path: "materials", title: "المواد" },
    { path: "plans/approve", title: "اعتماد الخطة" },
];

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route
                        index
                        element={<PendingPage title="الرئيسية" />}
                    />

                    <Route
                        path="projects"
                        element={<ProjectsPage />}
                    />

                    <Route
                        path="projects/new"
                        element={<CreateProjectPage />}
                    />

                    <Route
                        path="projects/:projectId/setup"
                        element={
                            <PendingPage title="التفصيل والعلاقات" />
                        }
                    />

                    <Route
                        path="projects/:projectId"
                        element={
                            <PendingPage title="تفاصيل المشروع" />
                        }
                    />

                    {additionalPendingRoutes.map((route) => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <PendingPage title={route.title} />
                            }
                        />
                    ))}

                    {pendingPages
                        .filter((page) => page.path !== "/")
                        .map((page) => (
                            <Route
                                key={page.id}
                                path={page.path.slice(1)}
                                element={
                                    <PendingPage title={page.label} />
                                }
                            />
                        ))}

                    <Route
                        path="*"
                        element={<NotFoundPage />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}