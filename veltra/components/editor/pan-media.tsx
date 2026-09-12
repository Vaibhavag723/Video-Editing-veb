"use client";

import type { ReactNode } from "react";
import { Film, Languages, Music, Upload, Wand2 } from "lucide-react";
import { mediaFiles } from "@/lib/user-data";
import { AssetRow, PanelShell, type ToolId } from "./tool-data";
import { cn } from "@/lib/cn";

export function SpanPro() {
  return <span className="rounded bg-white/[0.06] px-1.5 text-[10px] font-bold text-slate-400">Pro</span>;
}

export function MediaAudioPanel({ tool }: { tool: ToolId }) {
  if (tool === "media") {
    return (
      <PanelShell
        title="Media library"
        action={
          <button className="flex items-center gap-1 rounded-lg bg-lime-400/15 px-2 py-1 text-[11px] font-bold text-lime-300">
            <Upload className="h-3 w-3" /> Upload
          </button>
        }
      >
        <div className="rounded-xl border border-dashed border-white/15 p-4 text-center">
          <Film className="mx-auto h-6 w-6 text-slate-600" />
          <p className="mt-2 text-[12px] font-semibold text-slate-400">Drop files to import</p>
          <p className="text-[10.5px] text-slate-600">MP4, MOV, WEBM · up to 10 GB</p>
          <button className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-white/[0.1]">
            <Upload className="h-3.5 w-3.5" /> Browse files
          </button>
        </div>
        {mediaFiles.map((m) => (
          <AssetRow key={m.id} name={m.name} meta={`${m.type} · ${m.duration} · ${m.size}`} tone="bg-violet-500/[0.15] text-violet-300" icon={<Film className="h-4 w-4" />} />
        ))}
      </PanelShell>
    );
  }
  // audio
  const tracks: { n: string; m: string; c: string }[] = [
    { n: "voiceover-take2.wav", m: "Voiceover · 2:13", c: "bg-amber-400/[0.15] text-amber-300" },
    { n: "summer-drum-loop.mp3", m: "Beat · 0:08 loop", c: "bg-lime-400/[0.15] text-lime-300" },
    { n: "cinematic-scape.mp3", m: "Ambient · 4:02", c: "bg-cyan-400/[0.15] text-cyan-300" },
    { n: "whoosh-transition.wav", m: "SFX · 0:03", c: "bg-fuchsia-500/[0.15] text-fuchsia-300" },
  ];
  return (
    <PanelShell title="Audio" action={<span className="rounded bg-white/[0.06] px-1.5 text-[10px] font-bold text-slate-400">2 tracks</span>}>
      {tracks.map((a) => (
        <AssetRow key={a.n} name={a.n} meta={a.m} tone={a.c} icon={<Music className="h-4 w-4" />} />
      ))}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Music library</p>
        <p className="mt-1 text-[12px] text-slate-400">Search 40k+ royalty-free tracks</p>
        <button className="mt-2 w-full rounded-lg bg-white/[0.06] py-1.5 text-[12px] font-semibold text-white">Open library</button>
      </div>
    </PanelShell>
  );
}

export function TextCaptionsPanel({ tool }: { tool: ToolId }) {
  const content: ReactNode =
    tool === "text" ? (
      <>
        {[
          { n: "Title — Bold Sans", m: "2.4k uses", g: "from-fuchsia-500 to-violet-700" },
          { n: "Subtitle — Studio", m: "1.1k uses", g: "from-violet-500 to-indigo-700" },
          { n: "Lower third — Neon", m: "860 uses", g: "from-lime-400 to-emerald-700" },
          { n: "Quote card — Minimal", m: "640 uses", g: "from-cyan-400 to-blue-700" },
        ].map((t) => (
          <div key={t.n} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5">
            <span className={`flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-black text-white ${t.g}`}>Aa</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-white">{t.n}</p>
              <p className="text-[11px] text-slate-500">{t.m}</p>
            </div>
            <button className="rounded-lg p-1.5 text-slate-500 hover:bg-white/[0.07] hover:text-white" aria-label="Add text">+</button>
          </div>
        ))}
      </>
    ) : (
      <>
        <div className="rounded-xl border border-lime-400/20 bg-lime-400/[0.05] p-3.5">
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white">
            <Wand2 className="h-4 w-4 text-lime-300" /> Generate captions
          </p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-400">
            AI transcribes audio and places styled captions on the timeline.
          </p>
          <div className="mt-3 space-y-2">
            <select className="h-9 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 text-[12.5px] text-white focus:outline-none">
              <option>Auto-detect language</option>
              <option>English (US)</option>
              <option>Spanish</option>
              <option>German</option>
              <option>Japanese</option>
            </select>
            <button className="h-9 w-full rounded-lg bg-lime-400 font-bold text-lime-950 transition hover:brightness-110">Generate on V2</button>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="text-[12px] font-semibold text-white">Caption style</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {["Modern", "Classic", "Karaoke", "Minimal"].map((s, i) => (
              <button key={s} className={cn("rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold", i === 0 ? "border-lime-400/50 bg-lime-400/10 text-lime-300" : "border-white/10 text-slate-400 hover:text-white")}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </>
    );

  return (
    <PanelShell
      title={tool === "text" ? "Text overlays" : "Auto captions"}
      action={
        tool === "text" ? <SpanPro /> : <span className="flex items-center gap-1"><Languages className="h-3 w-3 text-cyan-300" /><SpanPro /></span>
      }
    >
      {content}
    </PanelShell>
  );
}