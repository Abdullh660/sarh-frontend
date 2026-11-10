import { NavLink } from "react-router";

interface HeaderProps {
    title: string;
}

const dateFormatter = new Intl.DateTimeFormat("ar-YE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
});

export function Header({ title }: HeaderProps) {
    const today = dateFormatter.format(new Date());

    return (
        <header className="sarh-header">
            <div className="sarh-header__heading">
                <h1 className="sarh-header__title">
                    {title}
                </h1>

                <span className="sarh-header__date">
                    {today}
                </span>
            </div>

            <div className="sarh-header__actions">
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