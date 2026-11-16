import * as React from "react";
import { cn } from "@/lib/format";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[#334155]">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "min-h-[40px] w-full rounded-lg bg-white px-3.5 py-2 text-sm text-[#0F172A] uui-shadow-xs",
            "ring-1 ring-inset transition-shadow focus-visible:outline-none focus-visible:ring-2",
            "disabled:cursor-not-allowed disabled:bg-[#F8FAFC]",
            error
              ? "ring-[#FDA29B] focus-visible:ring-[#D92D20]"
              : "ring-[#CBD5E1] focus-visible:ring-[#2563EB]",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="text-xs font-medium text-[#D92D20]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
