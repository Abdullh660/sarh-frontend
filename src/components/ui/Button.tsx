import type { ComponentPropsWithRef } from "react";
import "./Button.css";

type ButtonVariant = "primary" | "dark" | "outline";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ComponentPropsWithRef<"button"> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

export function Button({
    variant = "primary",
    size = "md",
    className = "",
    type = "button",
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={[
                "sarh-button",
                `sarh-button--${variant}`,
                `sarh-button--${size}`,
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            {...props}
        >
            {children}
        </button>
    );
}