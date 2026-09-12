"use client";

import { Captions, CheckCircle2, ScanLine, Zap } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Avatar } from "@/components/ui/Avatar";

export function AuthBrandPanel({
  headline = "Create videos that keep moving.",
  sub = "The pro studio that runs in your browser. Edit, caption, and ship scroll-stopping video — without leaving the tab.",
}: {
  headline?: string;
  sub?: string;
}) {
  const points = [
    { icon: Zap, title: "AI captions & cuts", meta: "Auto-transcribe in 60+ languages" },
    { icon: ScanLine, title: "Instant 4K export", meta: "Web-ready renders in minutes" },
    { icon: Captions, title: "Multi-track timeline", meta: "Video, audio, text & effects" },
  ];

  return (
    <div className="relative hidden overflow-hidden border-r border-white/[0.06] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      {/* local ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-violet-600/25 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-purple-800/25 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_46%_at_70%_0%,rgba(139,92,246,0.14),transparent_62%)]" />
      </div>

      <div className="relative flex items-center gap-3">
        <LogoMark size={40} />
        <span className="display text-[22px] font-bold tracking-tight text-white">
          veltra<span className="text-lime-400">.</span>
        </span>
      </div>

      <div className="relative max-w-xl">
        <span className="label-overline text-violet-300">Professional video studio</span>
        <h1 className="display mt-4 text-[44px] font-bold leading-[1.05] tracking-tight xl:text-[56px]">
          {headline}
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-400">{sub}</p>

        <ul className="mt-9 space-y-4">
          {points.map((p) => (
            <li key={p.title} className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-violet-300">
                <p.icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-white">{p.title}</p>
                <p className="text-[12.5px] text-slate-500">{p.meta}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* floating product tease */}
        <div className="relative mt-12 max-w-md">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] shadow-card">
            <div className="relative aspect-video bg-gradient-to-br from-violet-700 via-purple-800 to-[#120a24]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(5,6,13,0.5))]" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 shadow-glow-lime">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-lime-950">
                    <path d="M7 5.5v13l11-6.5L7 5.5Z" />
                  </svg>
                </span>
              </div>
              <span className="absolute left-3 top-3 rounded-md border border-white/[0.15] bg-black/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                1:58 · 4K
              </span>
              <span className="absolute bottom-3 left-3 right-3 flex items-end gap-1 opacity-70">
                {[5, 9, 6, 12, 8, 14, 7, 11, 5, 9, 13, 6, 10, 8, 12, 5, 9, 7, 11, 6, 8, 4].map((h, i) => (
                  <span key={i} className="w-full rounded-sm bg-white/60" style={{ height: `${h * 3}px` }} />
                ))}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.07] bg-[#0b0d1c] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Avatar name="Maya Chen" size="sm" />
                <div>
                  <p className="text-[12px] font-semibold text-white">product-launch-hero.mp4</p>
                  <p className="text-[10.5px] text-slate-500">Autosaved just now</p>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-lime-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-lime-300">
                <CheckCircle2 className="h-3 w-3" /> Saved
              </span>
            </div>
          </div>
          <div className="animate-float pointer-events-none absolute -right-6 -top-6 rounded-xl border border-cyan-400/25 bg-[#0b0d1c]/90 px-3 py-2 shadow-glow-cyan backdrop-blur">
            <p className="text-[11px] font-bold text-cyan-300">Render 98%</p>
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-4">
        <div className="flex -space-x-2.5">
          {["Sofia Alvarez", "Noah Kim", "Maya Chen", "Tomas Berg"].map((n) => (
            <Avatar key={n} name={n} size="sm" ring />
          ))}
        </div>
        <p className="text-[12.5px] text-slate-500">
          Trusted by <span className="font-semibold text-white">40k+ creators</span> and teams worldwide
        </p>
      </div>
    </div>
  );
}