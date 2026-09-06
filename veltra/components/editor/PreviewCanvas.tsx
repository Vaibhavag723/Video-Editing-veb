"use client";

import { Maximize, Pause, Play, Volume2, Zap } from "lucide-react";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function PreviewCanvas({
  playing,
  time,
  duration,
  onPlayToggle,
}: {
  playing: boolean;
  time: number;
  duration: number;
  onPlayToggle: () => void;
}) {
  const pct = Math.min(100, (time / duration) * 100);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* scene */}
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#04050b] p-3 md:p-4">
        <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-violet-700 via-purple-900 to-[#0d0716] shadow-card">
          {/* scene blobs */}
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-[80px]" />
          <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-[90px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
          {/* corner markers */}
          <span className="absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-white/25" />
          <span className="absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-white/25" />
          <span className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-white/25" />
          <span className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-white/25" />

          {/* fake title card */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <span className="label-overline text-lime-300">Product launch</span>
            <h3 className="display mt-3 text-[clamp(22px,5.5vw,58px)] font-black leading-none tracking-tight text-white">
              Launch day.
              <br />
              <span className="text-gradient">Let&apos;s go.</span>
            </h3>
            <p className="mt-4 max-w-sm text-[clamp(11px,1.4vw,14px)] text-slate-300/90">
              New hardware, zero compromise — the studio cut in Veltra.
            </p>
          </div>

          {/* status chips */}
          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-[10.5px] font-bold text-white backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
            </span>
            REC 0:00:04:12
          </span>
          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-[10.5px] font-bold text-white backdrop-blur">
            <Zap className="h-3 w-3 text-lime-300" /> 16:9 · 4K
          </span>
          <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-lime-400/30 bg-black/50 px-3.5 py-1.5 text-[11px] font-bold text-lime-300 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
            AI captions on
          </span>

          {/* center play affordance */}
          <button
            onClick={onPlayToggle}
            aria-label={playing ? "Pause" : "Play"}
            className="group absolute inset-0 grid place-items-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur transition-transform group-hover:scale-110">
              {playing ? <Pause className="h-6 w-6 fill-white" /> : <Play className="ml-1 h-6 w-6 fill-white" />}
            </span>
          </button>
        </div>
      </div>

      {/* transport bar */}
      <div className="flex items-center gap-3 border-t border-white/[0.07] bg-[#070813]/70 px-4 py-2.5 backdrop-blur-xl">
        <button onClick={onPlayToggle} className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 text-lime-950 shadow-glow-lime transition hover:brightness-110" aria-label="Play/pause">
          {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
        </button>
        <div className="flex items-baseline gap-1.5 font-mono text-[13px]">
          <span className="font-bold text-white">{fmt(time)}</span>
          <span className="text-slate-600">/ {fmt(duration)}</span>
        </div>
        {/* scrubbar */}
        <div className="relative h-5 flex-1 cursor-pointer" onClick={(e) => {}}>
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/[0.1]">
            <div className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-400" style={{ width: `${pct}%` }} />
          </div>
          <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow shadow-black/40" style={{ left: `${pct}%` }} />
        </div>
        <span className="hidden text-[11px] font-semibold text-slate-500 sm:block">30 fps</span>
        <button className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white sm:flex" aria-label="Volume">
          <Volume2 className="h-4 w-4" />
        </button>
        <button className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white sm:flex" aria-label="Fullscreen">
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}