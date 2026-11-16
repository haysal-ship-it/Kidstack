import * as React from "react";
import { cn } from "@/lib/format";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] uui-shadow-skeuomorphic focus-visible:ring-[#2563EB]",
      secondary:
        "bg-[#EFF6FF] text-[#1D4ED8] ring-1 ring-inset ring-[#BFDBFE] hover:bg-[#DBEAFE] focus-visible:ring-[#2563EB]",
      outline:
        "bg-white text-[#334155] ring-1 ring-inset ring-[#CBD5E1] uui-shadow-xs hover:bg-[#F8FAFC] hover:text-[#0F172A] focus-visible:ring-[#2563EB]",
      ghost:
        "bg-transparent text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:ring-[#2563EB]",
      danger:
        "bg-[#D92D20] text-white hover:bg-[#B42318] uui-shadow-skeuomorphic focus-visible:ring-[#D92D20]",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "min-h-[36px] px-3 py-1.5 text-sm font-semibold",
      md: "min-h-[40px] px-3.5 py-2 text-sm font-semibold",
      lg: "min-h-[44px] px-4 py-2.5 text-sm font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg transition-colors duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
