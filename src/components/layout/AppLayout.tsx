import { useState } from "react";

import {
    Outlet,
    useLocation,
} from "react-router";

import {
    getNavigationTitle,
    getHeaderActions,
} from "../../core/navigation/navigation.config";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNavigation } from "./MobileNavigation";

import "./AppLayout.css";

const STORAGE_KEY = "sarh-sidebar-collapsed";

function readSidebarState(): boolean {
    try {
        return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

export function AppLayout() {
    const location = useLocation();

    const [collapsed, setCollapsed] =
        useState<boolean>(readSidebarState);

    const pageTitle = getNavigationTitle(
        location.pathname
    );

    const pageActions = getHeaderActions(
        location.pathname
    );

    function toggleSidebar() {
        const nextValue = !collapsed;

        setCollapsed(nextValue);

        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                nextValue ? "1" : "0"
            );
        } catch {
            // Sidebar still works without storage.
        }
    }

    return (
        <div className="sarh-app-layout" dir="rtl">
            <a
                href="#sarh-main-content"
                className="sarh-skip-link"
            >
                الانتقال إلى المحتوى
            </a>

            <Sidebar
                collapsed={collapsed}
                onToggle={toggleSidebar}
            />

            <div className="sarh-app-layout__workspace">
                <Header
                    title={pageTitle}
                    actions={pageActions}
                />

                <main
                    id="sarh-main-content"
                    className="sarh-app-layout__content"
                >
                    <Outlet />
                </main>
            </div>

            <MobileNavigation />
        </div>
    );
}