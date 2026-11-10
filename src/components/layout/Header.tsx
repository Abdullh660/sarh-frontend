import { Link, NavLink } from "react-router";

import type {
    HeaderAction,
    HeaderBreadcrumb,
} from "../../core/navigation/navigation.config";

import "./Header.css";

interface HeaderProps {
    title: string;
    actions?: HeaderAction[];
    breadcrumbs?: HeaderBreadcrumb[];
}

const dateFormatter = new Intl.DateTimeFormat("ar-YE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
});

function HeaderActionIcon({
    icon,
}: {
    icon: HeaderAction["icon"];
}) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {icon === "plus" && (
                <path d="M12 5v14M5 12h14" />
            )}

            {icon === "warehouse" && (
                <path d="M12 3.5 20 8v8l-8 4.5L4 16V8zM4 8l8 4.5L20 8M12 12.5v8" />
            )}

            {icon === "save" && (
                <>
                    <path d="M4 4h14l2 2v14H4z" />
                    <path d="M7 4v6h9V4M8 20v-7h8v7" />
                </>
            )}
        </svg>
    );
}

export function Header({
    title,
    actions = [],
    breadcrumbs = [],
}: HeaderProps) {
    const today = dateFormatter.format(new Date());

    return (
        <header className="sarh-header">
            <div className="sarh-header__heading">
                {breadcrumbs.length > 0 && (
                    <nav
                        className="sarh-header__breadcrumbs"
                        aria-label="مسار التنقل"
                    >
                        {breadcrumbs.map((breadcrumb) => (
                            <span
                                className="sarh-header__breadcrumb-item"
                                key={breadcrumb.path}
                            >
                                <Link to={breadcrumb.path}>
                                    {breadcrumb.label}
                                </Link>

                                <span aria-hidden="true">‹</span>
                            </span>
                        ))}
                    </nav>
                )}

                <h1 className="sarh-header__title">
                    {title}
                </h1>

                <span className="sarh-header__date">
                    {today}
                </span>
            </div>

            <div className="sarh-header__actions">
                {actions.length > 0 && (
                    <div className="sarh-header__page-actions">
                        {actions.map((action) => {
                            const className = [
                                "sarh-header__action",
                                `sarh-header__action--${action.variant}`,
                            ].join(" ");

                            const content = (
                                <>
                                    <HeaderActionIcon icon={action.icon} />
                                    <span>{action.label}</span>
                                </>
                            );

                            if (action.type === "submit") {
                                return (
                                    <button
                                        key={action.id}
                                        type="submit"
                                        form={action.formId}
                                        className={className}
                                    >
                                        {content}
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={action.id}
                                    to={action.path}
                                    className={className}
                                >
                                    {content}
                                </Link>
                            );
                        })}
                    </div>
                )}

                <NavLink
                    to="/notifications"
                    className="sarh-header__notification"
                    aria-label="التنبيهات"
                    title="التنبيهات"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4" />
                    </svg>
                </NavLink>
            </div>
        </header>
    );
}