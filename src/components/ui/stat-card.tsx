import * as React from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/format";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: "blue" | "indigo" | "emerald" | "amber" | "rose";
}

const dotStyles: Record<NonNullable<StatCardProps["accent"]>, string> = {
  blue: "bg-[#2563EB]",
  indigo: "bg-[#4F46E5]",
  emerald: "bg-[#059669]",
  amber: "bg-[#D97706]",
  rose: "bg-[#DC2626]",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent = "blue",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn("h-2 w-2 rounded-full shrink-0", dotStyles[accent])}
              aria-hidden="true"
            />
            <p className="text-xs font-medium uppercase tracking-wider text-[#475569] truncate">
              {title}
            </p>
          </div>
          <span className="text-[#64748B] shrink-0" aria-hidden="true">
            {icon}
          </span>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#0F172A] tabular-nums tracking-[-0.025em]">
            {value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-[#64748B]">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
