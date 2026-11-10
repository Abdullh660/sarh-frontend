import { NavLink } from "react-router";

import {
    mobileItems,
} from "../../core/navigation/navigation.config";

export function MobileNavigation() {
    return (
        <nav
            className="sarh-mobile-nav"
            aria-label="شريط التنقل للجوال"
        >
            {mobileItems.map((item) => (
                <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.path === "/"}
                    title={item.label}
                    aria-label={item.label}
                    className={({ isActive }) =>
                        [
                            "sarh-mobile-nav__link",
                            isActive
                                ? "sarh-mobile-nav__link--active"
                                : "",
                        ]
                            .filter(Boolean)
                            .join(" ")
                    }
                >
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d={item.iconPath} />
                    </svg>
                </NavLink>
            ))}
        </nav>
    );
}