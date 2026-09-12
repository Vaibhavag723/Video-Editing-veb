"use client";

import type { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

const toneIconBg: Record<string, string> = {
  violet: "from-violet-500/25 to-fuchsia-500/10 text-violet-300",
  lime: "from-lime-400/25 to-emerald-500/10 text-lime-300",
  cyan: "from-cyan-400/25 to-blue-500/10 text-cyan-300",
  amber: "from-amber-400/25 to-orange-500/10 text-amber-300",
  rose: "from-rose-500/25 to-red-500/10 text-rose-300",
  fuchsia: "from-fuchsia-500/25 to-pink-500/10 text-fuchsia-300",
};

export function StatCard({
  label,
  value,
  delta,
  sub,
  icon,
  tone = "violet",
  children,
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  sub?: string;
  icon: ReactNode;
  tone?: "violet" | "lime" | "cyan" | "amber" | "rose" | "fuchsia";
  children?: ReactNode;
  className?: string;
}) {
  const positive = delta?.startsWith("+");
  return (
    <div
      className={cn(
        "panel group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.16]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-radial opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{
          background: `radial-gradient(circle, ${
            tone === "lime" ? "rgba(163,230,53,0.28)" : tone === "cyan" ? "rgba(34,211,238,0.28)" : "rgba(139,92,246,0.30)"
          }, transparent 70%)`,
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-overline">{label}</p>
          <p className="nums display mt-2 text-[28px] font-bold leading-none tracking-tight text-white">
            {value}
          </p>
          {delta && (
            <p className="mt-2 flex items-center gap-1 text-xs font-semibold">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
                  positive ? "bg-lime-400/10 text-lime-300" : "bg-rose-500/10 text-rose-300"
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" strokeWidth={2.6} />
                ) : (
                  <ArrowDownRight className="h-3 w-3" strokeWidth={2.6} />
                )}
                {delta}
              </span>
              <span className="text-slate-600">· {sub}</span>
            </p>
          )}
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br",
            toneIconBg[tone]
          )}
        >
          {icon}
        </span>
      </div>
      {children}
    </div>
  );
}