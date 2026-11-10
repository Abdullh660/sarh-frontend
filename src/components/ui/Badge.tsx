import type { ComponentPropsWithRef } from "react";
import "./Badge.css";

type BadgeVariant =
    | "neutral"
    | "success"
    | "warning"
    | "danger";

interface BadgeProps extends ComponentPropsWithRef<"span"> {
    variant?: BadgeVariant;
}

export function Badge({
    variant = "neutral",
    className = "",
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            className={[
                "sarh-badge",
                `sarh-badge--${variant}`,
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            {...props}
        >
            {children}
        </span>
    );
}