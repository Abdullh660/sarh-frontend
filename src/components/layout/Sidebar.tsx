import { NavLink } from "react-router";

import {
    navigation,
    sidebarItems,
} from "../../core/navigation/navigation.config";

import type { NavigationItem } from "../../core/navigation/navigation.config";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

interface SidebarLinkProps {
    item: NavigationItem;
    collapsed: boolean;
}

function SidebarLink({ item, collapsed }: SidebarLinkProps) {
    return (
        <NavLink
            to={item.path}
            end={item.path === "/"}
            title={item.label}
            aria-label={item.label}
            className={({ isActive }) =>
                [
                    "sarh-sidebar__link",
                    isActive ? "sarh-sidebar__link--active" : "",
                ]
                    .filter(Boolean)
                    .join(" ")
            }
        >
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
                className="sarh-sidebar__icon"
            >
                <path d={item.iconPath} />

                {item.iconCircle && (
                    <circle cx="12" cy="12" r="3" />
                )}
            </svg>

            {!collapsed && (
                <span className="sarh-sidebar__label">
                    {item.label}
                </span>
            )}
        </NavLink>
    );
}

export function Sidebar({
    collapsed,
    onToggle,
}: SidebarProps) {
    return (
        <aside
            className={[
                "sarh-sidebar",
                collapsed ? "sarh-sidebar--collapsed" : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="sarh-sidebar__brand">
                {!collapsed && (
                    <img
                        src="/assets/sarh-logo.png"
                        alt="صرح"
                        className="sarh-sidebar__logo"
                    />
                )}

                <button
                    type="button"
                    className="sarh-sidebar__toggle"
                    onClick={onToggle}
                    aria-label={
                        collapsed ? "فتح القائمة" : "طي القائمة"
                    }
                    title={
                        collapsed ? "فتح القائمة" : "طي القائمة"
                    }
                    aria-expanded={!collapsed}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="m9 6 6 6-6 6" />
                    </svg>
                </button>
            </div>

            <nav
                aria-label="القائمة الرئيسية"
                className="sarh-sidebar__navigation"
            >
                {sidebarItems.map((item) => (
                    <SidebarLink
                        key={item.id}
                        item={item}
                        collapsed={collapsed}
                    />
                ))}
            </nav>

            <div className="sarh-sidebar__bottom">
                <SidebarLink
                    item={navigation.settings}
                    collapsed={collapsed}
                />

                <div className="sarh-sidebar__profile">
                    <span
                        className="sarh-sidebar__avatar"
                        title="م. محمد بن قريان"
                    >
                        م
                    </span>

                    {!collapsed && (
                        <div className="sarh-sidebar__profile-info">
                            <span className="sarh-sidebar__profile-name">
                                م. محمد بن قريان
                            </span>

                            <span className="sarh-sidebar__profile-role">
                                المدير العام · مدير المشاريع
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}