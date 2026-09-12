"use client";

import { useEffect, useState } from "react";
import { PanelRight, Settings2, X } from "lucide-react";
import { EditorTopbar } from "@/components/editor/EditorTopbar";
import { ToolRail } from "@/components/editor/ToolRail";
import type { ToolId } from "@/components/editor/tool-data";
import { MediaAudioPanel, TextCaptionsPanel } from "@/components/editor/pan-media";
import { CreativePanel } from "@/components/editor/pan-creative";
import { PreviewCanvas } from "@/components/editor/PreviewCanvas";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { Timeline } from "@/components/editor/Timeline";
import { ExportModal } from "@/components/editor/ExportModal";

const DURATION = 120;

export default function EditorPage() {
  const [tool, setTool] = useState<ToolId>("media");
  const [time, setTime] = useState(28);
  const [playing, setPlaying] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(false);
  const [mobileProps, setMobileProps] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTime((t) => {
        const nt = t + 0.1;
        return nt >= DURATION ? 0 : nt;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing]);

  const toolPanelFor = (t: ToolId) => {
    if (t === "media" || t === "audio") return <MediaAudioPanel tool={t} />;
    if (t === "text" || t === "captions") return <TextCaptionsPanel tool={t} />;
    return <CreativePanel tool={t} />;
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#05060d]">
      <EditorTopbar onExport={() => setExportOpen(true)} />

      <div className="flex min-h-0 flex-1 flex-col items-stretch lg:flex-row">
        {/* tool rail · horizontal on mobile / vertical on lg */}
        <ToolRail
          tool={tool}
          setTool={(t) => {
            setTool(t);
            setMobilePanel(true);
          }}
        />

        {/* tool panel — drawer on mobile, static column on desktop */}
        <div
          className={
            mobilePanel
              ? "fixed inset-y-0 left-0 z-40 flex w-[300px] max-w-[86vw] flex-col border-r border-white/10 bg-[#0b0d1c]/98 backdrop-blur-2xl lg:relative lg:inset-auto lg:z-auto lg:w-[248px] lg:bg-[#070813]/50"
              : "hidden lg:flex lg:w-[248px] lg:flex-col"
          }
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2 lg:hidden">
            <span className="label-overline">Tools</span>
            <button onClick={() => setMobilePanel(false)} className="rounded-lg p-1.5 text-slate-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1">{toolPanelFor(tool)}</div>
        </div>

        {/* center: preview + timeline */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PreviewCanvas playing={playing} time={time} duration={DURATION} onPlayToggle={() => setPlaying((p) => !p)} />
          {/* mobile action row */}
          <div className="flex items-center gap-2 border-t border-white/[0.07] bg-[#070813]/70 px-3 py-2 lg:hidden">
            <button onClick={() => setMobilePanel((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-slate-300">
              <Settings2 className="h-3.5 w-3.5" /> Tools
            </button>
            <button onClick={() => setMobileProps((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-slate-300">
              <PanelRight className="h-3.5 w-3.5" /> Properties
            </button>
          </div>
          <Timeline time={time} setTime={setTime} />
        </main>

        {/* properties — drawer on mobile, static column on desktop */}
        <div
          className={
            mobileProps
              ? "fixed inset-y-0 right-0 z-40 flex w-[300px] max-w-[86vw] flex-col border-l border-white/10 bg-[#0b0d1c]/98 backdrop-blur-2xl xl:relative xl:inset-auto xl:z-auto xl:w-[280px]"
              : "hidden xl:flex xl:w-[280px] xl:flex-col"
          }
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2 xl:hidden">
            <span className="label-overline">Properties</span>
            <button onClick={() => setMobileProps(false)} className="rounded-lg p-1.5 text-slate-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <PropertiesPanel />
          </div>
        </div>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}