"use client";

import { useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ElementType;
  rightSlot?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  icon: Icon,
  rightSlot,
  className,
  id,
  type = "text",
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? `field-${autoId}`;
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPw ? "text" : "password") : type;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[13px] font-medium text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="group relative">
        {Icon && (
          <Icon
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 transition-colors",
              error ? "text-rose-400" : "text-slate-500 group-focus-within:text-violet-300"
            )}
            strokeWidth={2}
          />
        )}
        <input
          id={inputId}
          type={resolvedType}
          className={cn(
            "h-11 w-full rounded-xl border bg-white/[0.045] text-sm text-white transition-all duration-200 placeholder:text-slate-600",
            "focus:outline-none focus:ring-4",
            Icon ? "pl-[42px]" : "pl-3.5",
            rightSlot || isPassword ? "pr-11" : "pr-3.5",
            error
              ? "border-rose-500/50 focus:border-rose-400 focus:ring-rose-500/[0.15]"
              : "border-white/10 focus:border-violet-400/60 focus:bg-white/[0.07] focus:ring-violet-500/[0.15]",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:text-slate-200"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}