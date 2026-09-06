"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "accent";
type Size = "sm" | "md" | "lg" | "icon" | "iconSm";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-lime-400 to-lime-500 text-lime-950 shadow-[0_10px_34px_-10px_rgba(163,230,53,0.6)] hover:brightness-110 hover:-translate-y-px active:translate-y-0",
  accent:
    "bg-gradient-to-b from-cyan-400 to-cyan-500 text-cyan-950 shadow-[0_10px_34px_-12px_rgba(34,211,238,0.6)] hover:brightness-110",
  secondary:
    "bg-white/[0.06] text-slate-100 border border-white/10 hover:bg-white/[0.11] hover:border-white/20",
  ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.06]",
  outline:
    "bg-transparent text-white border border-white/[0.15] hover:border-white/[0.35] hover:bg-white/[0.05]",
  danger:
    "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_10px_30px_-12px_rgba(244,63,94,0.55)] hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
  iconSm: "h-8 w-8 rounded-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ElementType;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon: Icon, className, children, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className={size === "sm" || size === "iconSm" ? "h-4 w-4" : "h-[18px] w-[18px]"} strokeWidth={2.2} />}
      {children}
    </button>
  );
});