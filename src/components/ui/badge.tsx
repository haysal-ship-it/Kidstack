import * as React from "react";
import { cn } from "@/lib/format";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

const variantClasses: Record<BadgeVariant, { pill: string; dot: string }> = {
  default: {
    pill: "bg-[#EFF6FF] text-[#1D4ED8] ring-[#BFDBFE]",
    dot: "bg-[#2563EB]",
  },
  info: {
    pill: "bg-[#EFF6FF] text-[#1D4ED8] ring-[#BFDBFE]",
    dot: "bg-[#2563EB]",
  },
  success: {
    pill: "bg-[#ECFDF3] text-[#067647] ring-[#ABEFC6]",
    dot: "bg-[#17B26A]",
  },
  warning: {
    pill: "bg-[#FFFAEB] text-[#B54708] ring-[#FEDF89]",
    dot: "bg-[#F79009]",
  },
  danger: {
    pill: "bg-[#FEF3F2] text-[#B42318] ring-[#FECDCA]",
    dot: "bg-[#F04438]",
  },
  neutral: {
    pill: "bg-[#F8FAFC] text-[#334155] ring-[#E2E8F0]",
    dot: "bg-[#64748B]",
  },
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const styles = variantClasses[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles.pill,
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", styles.dot)} aria-hidden="true" />
      {children}
    </span>
  );
}
