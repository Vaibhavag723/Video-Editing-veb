"use client";

import { useState } from "react";
import { AudioWaveform, Clapperboard, Palette, Settings2 } from "lucide-react";
import { cn } from "@/lib/cn";

function Slider({ label, value, min = 0, max = 100, step = 1, unit = "%" }: {
  label: string; value: number; min?: number; max?: number; step?: number; unit?: string;
}) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-slate-400">{label}</span>
        <span className="nums rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10.5px] font-bold text-white">
          {value}
          {unit}
        </span>
      </div>
      <input type="range" className="vrange" min={min} max={max} step={step} defaultValue={value} style={{ ["--p" as string]: `${p}%` }} />
    </label>
  );
}

function Toggle({ label, on }: { label: string; on: boolean }) {
  return (
    <button className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left">
      <span className="text-[12.5px] font-medium text-slate-300">{label}</span>
      <span className={cn("relative h-5 w-9 rounded-full transition-colors", on ? "bg-lime-400" : "bg-white/[0.12]")}>
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", on ? "left-[18px]" : "left-0.5")} />
      </span>
    </button>
  );
}

const TABS = [
  { id: "clip", label: "Clip", icon: Clapperboard },
  { id: "color", label: "Color", icon: Palette },
  { id: "audio", label: "Audio", icon: AudioWaveform },
  { id: "adjust", label: "Adjust", icon: Settings2 },
] as const;

export function PropertiesPanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("clip");
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-white/[0.07] px-2 pt-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex flex-1 flex-col items-center gap-0.5 rounded-t-lg px-2 py-2 text-[10.5px] font-semibold transition-colors", tab === t.id ? "border-b-2 border-lime-400 text-white" : "text-slate-500 hover:text-slate-300")}>
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3.5">
        {tab === "clip" && (
          <>
            <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-violet-500/20 to-transparent p-3">
              <p className="text-[12px] font-semibold text-white">hero-broll.mp4</p>
              <p className="text-[11px] text-slate-500">Video 1 · 0:00 → 0:38</p>
              <div className="mt-2.5 flex gap-1.5">
                {["Trim", "Split", "Duplicate", "Delete"].map((a) => (
                  <button key={a} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition-colors hover:bg-white/[0.1] hover:text-white">
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <Slider label="Speed" value={100} min={10} max={400} step={5} unit="%" />
            <Slider label="Volume" value={82} unit="%" />
            <Toggle label="Reverse clip" on={false} />
            <Toggle label="Keep source audio" on={true} />
          </>
        )}
        {tab === "color" && (
          <>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Correction</p>
              <div className="space-y-3">
                <Slider label="Brightness" value={4} min={-50} max={50} />
                <Slider label="Contrast" value={18} min={-50} max={50} />
                <Slider label="Saturation" value={12} min={-50} max={50} />
                <Slider label="Temperature" value={-6} min={-50} max={50} />
                <Slider label="Highlights" value={8} min={-50} max={50} />
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-[12px] font-medium text-slate-300">LUT presets</p>
              <div className="mt-2 flex gap-1.5">
                {["Cinema", "Moody", "Warm", "Cold", "None"].map((l, i) => (
                  <button key={l} className={cn("rounded-lg border px-2.5 py-1 text-[11px] font-semibold", i === 1 ? "border-lime-400/50 bg-lime-400/10 text-lime-300" : "border-white/10 text-slate-400 hover:text-white")}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {tab === "audio" && (
          <>
            <Slider label="Audio level" value={82} unit="%" />
            <Slider label="Fade in" value={0.4} min={0} max={5} step={0.1} unit="s" />
            <Slider label="Fade out" value={0.8} min={0} max={5} step={0.1} unit="s" />
            <Toggle label="Compressor" on={true} />
            <Toggle label="Denoise" on={true} />
            <button className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-2.5 text-[12.5px] font-bold text-cyan-950 transition hover:brightness-110">
              Normalize audio
            </button>
          </>
        )}
        {tab === "adjust" && (
          <>
            <Slider label="Position X" value={0} min={-1000} max={1000} step={1} />
            <Slider label="Position Y" value={0} min={-1000} max={1000} step={1} />
            <Slider label="Scale" value={100} min={10} max={300} step={1} unit="%" />
            <Slider label="Rotation" value={0} min={-180} max={180} step={1} unit="°" />
            <Slider label="Opacity" value={100} unit="%" />
            <Toggle label="Blend: Multiply" on={false} />
            <Toggle label="Chroma key" on={false} />
          </>
        )}
      </div>
    </div>
  );
}