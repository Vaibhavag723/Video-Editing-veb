"use client";

import { useCallback, useRef, useState } from "react";
import { Lock, Mic, Minus, MousePointer2, Plus, Scissors, Unlock, ZoomIn } from "lucide-react";
import { cn } from "@/lib/cn";

const DURATION = 120; // seconds
const BASE_PX = 6;

interface Clip { id: string; name: string; start: number; dur: number; color: string; active?: boolean; }
interface Track { id: string; name: string; icon: typeof Mic | typeof MousePointer2; tone: string; clips: Clip[]; }

const TRACKS: Track[] = [
  { id: "v1", name: "Video 1", icon: MousePointer2, tone: "text-violet-300 bg-violet-500/[0.15]", clips: [
    { id: "c1", name: "hero-broll.mp4", start: 0, dur: 38, color: "from-violet-500/80 to-violet-700/70" },
    { id: "c2", name: "product-shot.mov", start: 38, dur: 48, color: "from-cyan-400/80 to-blue-700/70", active: true },
  ]},
  { id: "v2", name: "Video 2", icon: MousePointer2, tone: "text-fuchsia-300 bg-fuchsia-500/[0.15]", clips: [
    { id: "c3", name: "drone-skyline.mp4", start: 12, dur: 22, color: "from-fuchsia-500/80 to-purple-800/70" },
  ]},
  { id: "cap", name: "Captions", icon: MousePointer2, tone: "text-lime-300 bg-lime-400/[0.15]", clips: [
    { id: "c4", name: "Caption — intro", start: 20, dur: 14, color: "from-lime-400/90 to-lime-600/70" },
    { id: "c5", name: "Lower third", start: 62, dur: 12, color: "from-lime-400/90 to-emerald-600/70" },
  ]},
  { id: "a1", name: "Audio 1", icon: Mic, tone: "text-amber-300 bg-amber-400/[0.15]", clips: [
    { id: "c6", name: "voiceover-take2.wav", start: 0, dur: 120, color: "from-amber-400/80 to-orange-600/70" },
  ]},
  { id: "a2", name: "Audio 2", icon: Mic, tone: "text-cyan-300 bg-cyan-400/[0.15]", clips: [
    { id: "c7", name: "summer-drum-loop.mp3", start: 0, dur: 96, color: "from-cyan-400/80 to-blue-600/60" },
  ]},
];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function Timeline({ time, setTime }: { time: number; setTime: (t: number) => void }) {
  const [zoom, setZoom] = useState(1.4);
  const [dragging, setDragging] = useState(false);
  const [snap, setSnap] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const px = BASE_PX * zoom;
  const contentW = DURATION * px;

  const seekAt = useCallback((clientX: number) => {
    const el = contentRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let t = (clientX - rect.left) / px;
    if (snap) t = Math.round(t);
    setTime(Math.max(0, Math.min(DURATION, t)));
  }, [px, snap, setTime]);

  const fit = () => {
    const el = contentRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    const z = Math.max(0.5, Math.min(2.5, (w - 12) / (DURATION * BASE_PX)));
    setZoom(Math.round(z * 20) / 20);
  };

  return (
    <div className="border-t border-white/[0.07] bg-[#070813]/85">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="nums font-mono text-[12px] font-bold text-white">{fmt(time)}</span>
        <span className="text-[11px] text-slate-600">/ {fmt(DURATION)}</span>
        <button
          onClick={() => setSnap((s) => !s)}
          className={cn("hidden items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold sm:flex", snap ? "border-lime-400/40 bg-lime-400/10 text-lime-300" : "border-white/10 text-slate-500")}
        >
          <Scissors className="h-3 w-3" /> Snap
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white" aria-label="Zoom out"><Minus className="h-3.5 w-3.5" /></button>
          <button onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white" aria-label="Zoom in"><Plus className="h-3.5 w-3.5" /></button>
          <button onClick={fit} className="flex h-7 items-center gap-1 rounded-lg border border-white/10 px-2 text-[11px] font-semibold text-slate-400 hover:text-white" aria-label="Fit timeline"><ZoomIn className="h-3.5 w-3.5" /> Fit</button>
        </div>
      </div>

      <div
        className="overflow-x-auto pb-2"
        onPointerDown={(e) => { setDragging(true); seekAt(e.clientX); }}
        onPointerMove={(e) => dragging && seekAt(e.clientX)}
        onPointerUp={() => setDragging(false)}
      >
        <div className="flex">
          {/* sticky track labels */}
          <div className="sticky left-0 z-20 w-24 shrink-0 border-r border-white/[0.07] bg-[#0a0c18] sm:w-28">
            <div className="flex h-7 items-center border-b border-white/[0.06] px-3 text-[9.5px] font-bold uppercase tracking-wider text-slate-600">
              Track
            </div>
            {TRACKS.map((t) => (
              <div key={t.id} className="mb-1 flex h-11 items-center gap-2 px-3">
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", t.tone)}>
                  <t.icon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate text-[11px] font-semibold text-slate-300">{t.name}</span>
              </div>
            ))}
            <div className="flex gap-1.5 pl-3 pt-1">
              <button className="rounded-md border border-white/10 p-1.5 text-slate-500 hover:text-white" aria-label="Add track"><Plus className="h-3 w-3" /></button>
              <button className="rounded-md border border-white/10 p-1.5 text-slate-500 hover:text-white" aria-label="Lock tracks"><Lock className="h-3 w-3" /></button>
              <button className="rounded-md border border-white/10 p-1.5 text-slate-500 hover:text-white" aria-label="Unlock tracks"><Unlock className="h-3 w-3" /></button>
            </div>
          </div>

          {/* ruler + lanes */}
          <div ref={contentRef} className="relative" style={{ width: contentW }} onPointerDown={(e) => e.stopPropagation()}>
            <div className="relative flex h-7 items-end border-b border-white/[0.06]">
              {Array.from({ length: DURATION + 1 }).map((_, i) => (
                <span key={i} className="absolute flex items-end" style={{ left: i * px }}>
                  <span className={cn("w-px", i % 10 === 0 ? "h-2.5 bg-white/25" : "h-1.5 bg-white/10")} />
                  {i % 10 === 0 && (
                    <span className="absolute -bottom-0.5 left-1.5 font-mono text-[9px] text-slate-600">{fmt(i)}</span>
                  )}
                </span>
              ))}
            </div>

            <div className="relative pt-1">
              {TRACKS.map((t) => (
                <div key={t.id} className="relative mb-1 h-11 overflow-hidden rounded-lg bg-white/[0.03]">
                  {Array.from({ length: Math.floor(DURATION / 10) + 1 }).map((_, i) => (
                    <span key={i} className="absolute inset-y-0 w-px bg-white/[0.045]" style={{ left: i * 10 * px }} />
                  ))}
                  {t.clips.map((c) => (
                    <button
                      key={c.id}
                      className={cn(
                        "group absolute inset-y-1 overflow-hidden rounded-lg border bg-gradient-to-r px-2 text-left shadow-sm transition-all",
                        c.color,
                        c.active ? "border-lime-300/80 ring-1 ring-lime-300/50" : "border-white/20 hover:border-white/45"
                      )}
                      style={{ left: c.start * px, width: c.dur * px - 4 }}
                    >
                      <span className="block truncate text-[10.5px] font-bold text-white drop-shadow">{c.name}</span>
                      <span className="nums block font-mono text-[8.5px] text-white/70">{fmt(c.start)} → {fmt(c.start + c.dur)}</span>
                      <span className="absolute inset-y-0 left-0 w-1 cursor-ew-resize bg-white/25 opacity-0 transition-opacity group-hover:opacity-100" />
                      <span className="absolute inset-y-0 right-0 w-1 cursor-ew-resize bg-white/25 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* playhead */}
            <div className="pointer-events-none absolute inset-y-0 z-30" style={{ left: time * px }}>
              <span className="absolute inset-y-0 w-px bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.9)]" />
              <span className="absolute -left-[7px] -top-0.5 h-3.5 w-3.5 rotate-45 rounded-[3px] bg-lime-400 shadow-glow-lime" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}