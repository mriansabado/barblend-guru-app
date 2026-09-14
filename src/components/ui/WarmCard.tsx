import { cn } from "@/lib/cn";
import { HTMLAttributes, forwardRef } from "react";

export const WarmCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function WarmCard({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={cn("warm-glass", className)} {...props}>
        {children}
      </div>
    );
  }
);
