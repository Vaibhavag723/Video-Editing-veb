"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export function SearchField({
  placeholder = "Search…",
  className,
  dense = false,
  value,
  onChange,
}: {
  placeholder?: string;
  className?: string;
  dense?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className={cn("group relative", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-violet-300"
        strokeWidth={2.2}
      />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/[0.045] text-sm text-white placeholder:text-slate-600 transition-all focus:border-violet-400/50 focus:bg-white/[0.07] focus:outline-none focus:ring-4 focus:ring-violet-500/10",
          dense ? "h-9 pl-9 pr-3.5" : "h-10 pl-9 pr-3.5"
        )}
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 md:block">
        ⌘K
      </kbd>
    </div>
  );
}