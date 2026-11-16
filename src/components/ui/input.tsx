import * as React from "react";
import { cn } from "@/lib/format";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#334155]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "min-h-[40px] w-full rounded-lg bg-white px-3.5 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] uui-shadow-xs",
            "ring-1 ring-inset transition-shadow focus-visible:outline-none focus-visible:ring-2",
            "disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#64748B]",
            error
              ? "ring-[#FDA29B] focus-visible:ring-[#D92D20]"
              : "ring-[#CBD5E1] focus-visible:ring-[#2563EB]",
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-[#D92D20]" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-[#475569]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
