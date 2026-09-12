"use client";

import type { ReactNode } from "react";
import {
  ArrowLeftRight, Bot, Captions, Film, Music, Plus as PlusIcon,
  SlidersHorizontal, Sparkles, Type, Video,
} from "lucide-react";
import { cn } from "@/lib/cn";

export const TOOLS = [
  { id: "media", label: "Media", icon: Video },
  { id: "audio", label: "Audio", icon: Music },
  { id: "text", label: "Text", icon: Type },
  { id: "captions", label: "Captions", icon: Captions },
  { id: "effects", label: "Effects", icon: Sparkles },
  { id: "filters", label: "Filters", icon: SlidersHorizontal },
  { id: "transitions", label: "Transitions", icon: ArrowLeftRight },
  { id: "ai", label: "AI tools", icon: Bot },
] as const;

export type ToolId = (typeof TOOLS)[number]["id"];

export function PanelShell({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <h3 className="display text-[14px] font-semibold text-white">{title}</h3>
        {action}
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">{children}</div>
    </div>
  );
}

export function AssetRow({
  name, meta, icon, tone, onAdd,
}: { name: string; meta: string; icon: ReactNode; tone: string; onAdd?: () => void }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5 transition-colors hover:border-white/[0.14]">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tone)}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold text-white">{name}</p>
        <p className="text-[11px] text-slate-500">{meta}</p>
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="rounded-lg border border-white/10 bg-white/[0.05] p-1.5 text-slate-400 transition-all hover:bg-lime-400 hover:text-lime-950"
          aria-label={`Add ${name} to timeline`}
        >
          <PlusIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}