"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Activity, Zap } from "lucide-react";
import type { NavItem } from "./nav";
import { cn } from "@/lib/cn";

export function Sidebar({
  items,
  footerLabel = "System health",
  footerMeta = "99.98% uptime",
  activeId,
  topLabel,
}: {
  items: NavItem[];
  footerLabel?: string;
  footerMeta?: string;
  activeId?: string | null;
  topLabel?: string;
}) {
  const pathname = usePathname();
  const active = (item: NavItem) => {
    if (activeId) return item.id === activeId;
    return item.end
      ? pathname === item.href || pathname.startsWith(item.href + "/")
      : pathname.startsWith(item.href);
  };

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-white/[0.07] bg-[#070813]/[0.55] px-3 py-5 backdrop-blur-xl lg:flex">
      {topLabel && (
        <div className="mb-3 flex items-center gap-2.5 px-1.5">
          <span className="label-overline text-lime-soft">{topLabel}</span>
          <span className="h-px flex-1 bg-white/[0.06]" />
        </div>
      )}
      <nav className="flex flex-col gap-1" aria-label="Sidebar">
        {items.map((item) => {
          const isActive = active(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-violet-500/[0.16] to-transparent text-white"
                  : "text-slate-400 hover:bg-white/[0.045] hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-lime-soft shadow-[0_0_12px_rgba(168,255,120,0.8)]" />
              )}
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
                  isActive
                    ? "border-white/10 bg-white/[0.08] text-lime-300"
                    : "border-transparent text-slate-500 group-hover:text-slate-200"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2.1} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/editor"
          className="mb-4 flex items-center gap-3 rounded-xl border border-lime-400/25 bg-lime-400/[0.06] px-3 py-2.5 text-[13px] font-semibold text-lime-300 transition-all hover:bg-lime-400/[0.12]"
        >
          <Zap className="h-4 w-4" />
          Open editor
          <span className="ml-auto rounded-md bg-lime-400/[0.15] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            v2.4
          </span>
        </Link>
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/10 text-violet-300">
            <Activity className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-white">{footerLabel}</p>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              {footerMeta}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}