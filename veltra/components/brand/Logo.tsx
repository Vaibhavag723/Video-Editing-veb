"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Veltra brand mark — a cut/play glyph: lime play triangle, cyan notch
 * slicing a violet gradient tile. Original identity, no external assets.
 */
export function LogoMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`vmark-${id}`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="32" height="32" rx="10" fill="#0b0d1c" />
      <rect x="2" y="2" width="32" height="32" rx="10" fill={`url(#vmark-${id})`} />
      <rect x="2.75" y="2.75" width="30.5" height="30.5" rx="9.25" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
      <path d="M14 11.4v13.2l11.4-6.6L14 11.4Z" fill="#a3e635" />
      <path d="M25.6 7.6 10.8 28.4" stroke="#67e8f9" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  size = 26,
  showText = true,
  tagline,
  className,
  textClassName,
}: {
  size?: number;
  showText?: boolean;
  tagline?: string;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex select-none items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "display text-[18px] font-bold tracking-tight text-white",
              textClassName
            )}
          >
            veltra<span className="text-lime-400">.</span>
          </span>
          {tagline && (
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}