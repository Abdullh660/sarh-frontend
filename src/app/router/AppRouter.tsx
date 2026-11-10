import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router";

import { ProjectsPage } from "../../features/projects";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/projects" replace />}
                />

                <Route
                    path="/projects"
                    element={<ProjectsPage />}
                />

                <Route
                    path="*"
                    element={<div>الصفحة غير موجودة</div>}
                />
            </Routes>
        </BrowserRouter>
    );
}