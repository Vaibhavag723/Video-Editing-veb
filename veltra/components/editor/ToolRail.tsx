"use client";

import { TOOLS, type ToolId } from "./tool-data";
import { cn } from "@/lib/cn";

export function ToolRail({ tool, setTool }: { tool: ToolId; setTool: (t: ToolId) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-white/[0.07] bg-[#070813]/60 px-2 py-1.5 backdrop-blur-xl md:w-[70px] md:flex-col md:overflow-visible md:border-b-0 md:border-r md:px-1.5 md:py-3">
      {TOOLS.map((t) => {
        const Icon = t.icon;
        const active = t.id === tool;
        return (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            aria-label={t.label}
            title={t.label}
            className={cn(
              "group relative flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all md:w-full md:px-0",
              active ? "bg-white/[0.08] text-lime-300" : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"
            )}
          >
            {active && <span className="absolute left-0 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-lime-400 md:block" />}
            <Icon className="h-5 w-5" strokeWidth={2} />
            <span className="whitespace-nowrap text-[10px] font-semibold md:text-[9.5px]">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}