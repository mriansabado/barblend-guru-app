import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "coral" | "teal" | "soft";

interface BarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  coral:
    "bg-gradient-to-r from-bar-coral to-bar-pink text-white shadow-lg shadow-bar-coral/30 hover:brightness-110 hover:shadow-bar-coral/45",
  teal: "bg-gradient-to-r from-bar-teal to-emerald-400 text-bar-plum font-bold shadow-lg shadow-bar-teal/25 hover:brightness-110",
  soft: "bg-white/15 text-white border border-white/25 hover:bg-white/25",
};

export const BarButton = forwardRef<HTMLButtonElement, BarButtonProps>(
  function BarButton(
    { className, variant = "coral", loading, children, disabled, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-bold transition-all duration-300",
          "hover:scale-[1.02] active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bar-mango focus-visible:ring-offset-2 focus-visible:ring-offset-bar-plum",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
          variants[variant],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {children}
      </button>
    );
  }
);
