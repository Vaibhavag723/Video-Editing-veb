"use client";

import Link from "next/link";
import { Check, ChevronLeft, Eye, Redo2, Save, Share2, Undo2, Video } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function EditorTopbar({ onExport }: { onExport: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-white/[0.07] bg-[#05060d]/80 px-3 backdrop-blur-2xl md:px-4">
      <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:text-white" aria-label="Back to dashboard">
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <LogoMark size={26} />
      <span className="display ml-1 hidden text-[15px] font-bold text-white lg:block">
        veltra<span className="text-lime-400">.</span>
      </span>

      <div className="ml-2 hidden h-6 w-px bg-white/10 sm:block" />

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Video className="h-3.5 w-3.5 shrink-0 text-violet-300" />
          <input
            defaultValue="Product Launch — 60s Hero"
            className="w-full max-w-[160px] truncate bg-transparent text-[13px] font-semibold text-white focus:outline-none sm:max-w-[240px] md:text-sm"
            aria-label="Project name"
          />
          <span className="hidden shrink-0 items-center gap-1 rounded-full bg-lime-400/[0.12] px-2 py-0.5 text-[10.5px] font-bold text-lime-300 md:inline-flex">
            <Check className="h-3 w-3" /> Autosaved
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:text-white md:flex" aria-label="Undo">
          <Undo2 className="h-4 w-4" />
        </button>
        <button className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:text-white md:flex" aria-label="Redo">
          <Redo2 className="h-4 w-4" />
        </button>
        <button className="hidden h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[12.5px] font-semibold text-slate-300 transition-colors hover:text-white sm:flex">
          <Share2 className="h-4 w-4" /> Share
        </button>
        <Button variant="secondary" size="sm" icon={Save} className="hidden sm:inline-flex">
          Save
        </Button>
        <Button variant="secondary" size="sm" icon={Eye} className="hidden sm:inline-flex">
          Preview
        </Button>
        <Button size="sm" onClick={onExport} className={cn("inline-flex")}>
          <span className="hidden sm:inline">Export</span>
          <span className="sm:hidden">Export</span>
        </Button>
        <Avatar name="Maya Chen" size="sm" className="ml-1 hidden md:flex" />
      </div>
    </header>
  );
}