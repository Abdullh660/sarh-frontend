import type { ComponentPropsWithRef } from "react";
import "./Card.css";

type CardProps = ComponentPropsWithRef<"div">;

export function Card({
    className = "",
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={["sarh-card", className]
                .filter(Boolean)
                .join(" ")}
            {...props}
        >
            {children}
        </div>
    );
}