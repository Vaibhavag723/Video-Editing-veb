"use client";

import {
  ArrowLeftRight, Bot, Captions, Check, ScanLine, Scissors, Sparkles, Wand2, Zap,
} from "lucide-react";
import { PanelShell, type ToolId } from "./tool-data";
import { SpanPro } from "./pan-media";

const gradientFor = (c: string) =>
  c === "violet" ? "from-violet-500 to-purple-800"
  : c === "cyan" ? "from-cyan-400 to-blue-700"
  : c === "lime" ? "from-lime-400 to-emerald-700"
  : c === "fuchsia" ? "from-fuchsia-500 to-pink-700"
  : "from-amber-400 to-orange-700";

export function CreativePanel({ tool }: { tool: ToolId }) {
  if (tool === "effects") {
    const presets = [
      { n: "Glitch pop", d: "Break + recover", g: "from-rose-500 to-fuchsia-600" },
      { n: "Zoom punch", d: "Impact emphasis", g: "from-amber-400 to-orange-600" },
      { n: "Luma fade", d: "Soft dissolve", g: "from-violet-500 to-purple-800" },
      { n: "VHS tape", d: "Retro vibe", g: "from-lime-400 to-emerald-700" },
    ];
    return (
      <PanelShell title="Effects" action={<SpanPro />}>
        {presets.map((e) => (
          <div key={e.n} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5">
            <span className={`flex h-9 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white ${e.g}`}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-white">{e.n}</p>
              <p className="text-[11px] text-slate-500">{e.d}</p>
            </div>
            <button className="rounded-lg p-1.5 text-slate-500 hover:bg-white/[0.07] hover:text-white" aria-label={`Add ${e.n}`}>+</button>
          </div>
        ))}
      </PanelShell>
    );
  }

  if (tool === "filters") {
    const filters = [
      { n: "Original", c: "from-slate-500 to-slate-700" },
      { n: "Noir", c: "from-zinc-600 to-zinc-900" },
      { n: "Violet hour", c: "from-violet-500 to-purple-800" },
      { n: "Laguna", c: "from-cyan-400 to-blue-700" },
      { n: "Neon dusk", c: "from-fuchsia-500 to-indigo-800" },
      { n: "Lumen", c: "from-lime-300 to-emerald-800" },
    ];
    return (
      <PanelShell title="Filters" action={<span className="rounded bg-white/[0.06] px-1.5 text-[10px] font-bold text-slate-400">None</span>}>
        {filters.map((f) => (
          <button key={f.n} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5 text-left transition-colors hover:border-white/[0.16]">
            <span className={`h-9 w-14 shrink-0 rounded-lg bg-gradient-to-br ${f.c}`} />
            <span className="flex-1 text-[12.5px] font-semibold text-white">{f.n}</span>
          </button>
        ))}
      </PanelShell>
    );
  }

  // transitions
  const transitions = [
    { n: "Crossfade", d: "0.4s · classic", c: "violet" },
    { n: "Spin", d: "0.5s · dynamic", c: "cyan" },
    { n: "Wipe", d: "0.6s · directional", c: "lime" },
    { n: "Zoom", d: "0.5s · punch", c: "amber" },
  ];
  if (tool === "transitions") {
    return (
      <PanelShell title="Transitions">
        {transitions.map((t) => (
          <div key={t.n} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5">
            <span className={`flex h-9 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white ${gradientFor(t.c)}`}>
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-white">{t.n}</p>
              <p className="text-[11px] text-slate-500">{t.d}</p>
            </div>
            <button className="rounded-lg p-1.5 text-slate-500 hover:bg-white/[0.07] hover:text-white" aria-label={`Add ${t.n}`}>+</button>
          </div>
        ))}
      </PanelShell>
    );
  }

  const aiTools = [
    { icon: Captions, n: "Auto captions", d: "Transcribe + style" },
    { icon: Scissors, n: "Smart trim", d: "Cut silences & filler" },
    { icon: ScanLine, n: "Auto reframe", d: "9:16 · 1:1 · 4:5" },
    { icon: Wand2, n: "Remove background", d: "One-click keying" },
  ];
  return (
    <PanelShell title="AI assistant">
      <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.08] p-4">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
          <Bot className="h-4 w-4 text-violet-300" /> Veltra AI
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-slate-400">
          Describe the edit you want in plain words and Veltra will draft it.
        </p>
        <textarea
          rows={2}
          placeholder="Make a punchy 15s opener…"
          className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-[12.5px] text-white placeholder:text-slate-600 focus:border-violet-400/50 focus:outline-none"
        />
        <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-600 py-2 text-[12.5px] font-bold text-white hover:brightness-110">
          <Zap className="h-3.5 w-3.5" /> Generate edit
        </button>
      </div>
      {aiTools.map((a) => (
        <button key={a.n} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5 text-left transition-colors hover:border-violet-400/30">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/[0.15] text-violet-300">
            <a.icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-white">{a.n}</p>
            <p className="text-[11px] text-slate-500">{a.d}</p>
          </div>
          <Check className="h-3.5 w-3.5 text-lime-400" />
        </button>
      ))}
    </PanelShell>
  );
}