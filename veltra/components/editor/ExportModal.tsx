"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/cn";

const RESOLUTIONS = ["4K 2160p", "2K 1440p", "1080p HD", "720p"];
const FPS = ["24 fps", "30 fps", "60 fps"];
const FORMATS = ["MP4 (H.264)", "WebM (VP9)", "MOV (H.265)"];

export function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [resolution, setResolution] = useState(RESOLUTIONS[2]);
  const [fps, setFps] = useState(FPS[1]);
  const [format, setFormat] = useState(FORMATS[0]);
  const [stage, setStage] = useState<"idle" | "rendering" | "done">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) return;
    setStage("idle");
    setProgress(0);
  }, [open]);

  useEffect(() => {
    if (stage !== "rendering") return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setStage("done");
          return 100;
        }
        return p + 3;
      });
    }, 90);
    return () => clearInterval(id);
  }, [stage]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0b0d1c]/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-600/20 blur-[70px]" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="label-overline text-lime-300">Export</p>
              <h3 className="display mt-1 text-[19px] font-bold text-white">Render your video</h3>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {stage === "done" ? (
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-lime-400/25 bg-lime-400/[0.06] py-8">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-lime-950 shadow-glow-lime">
                <Check className="h-7 w-7" strokeWidth={3} />
              </span>
              <p className="mt-4 text-[15px] font-bold text-white">Export complete!</p>
              <p className="mt-1 text-[12.5px] text-slate-400">product-launch-hero-4k.webm · 214 MB</p>
              <button onClick={onClose} className="mt-5 rounded-xl bg-lime-400 px-5 py-2.5 text-[13px] font-bold text-lime-950 transition hover:brightness-110">
                Download video
              </button>
            </div>
          ) : (
            <>
              <div className="mt-5 space-y-3.5">
                {[
                  { label: "Resolution", values: RESOLUTIONS, state: resolution, set: setResolution },
                  { label: "Frame rate", values: FPS, state: fps, set: setFps },
                  { label: "Format", values: FORMATS, state: format, set: setFormat },
                ].map((g) => (
                  <div key={g.label}>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{g.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.values.map((v) => (
                        <button
                          key={v}
                          onClick={() => g.set(v)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all",
                            g.state === v
                              ? "border-lime-400/50 bg-lime-400/10 text-lime-300"
                              : "border-white/10 text-slate-400 hover:text-white"
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {stage === "rendering" && (
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-300" /> Rendering…
                    </span>
                    <span className="nums font-bold text-white">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-lime-400 transition-all duration-150" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <button
                onClick={() => setStage("rendering")}
                disabled={stage === "rendering"}
                className="mt-6 w-full rounded-xl bg-gradient-to-b from-lime-400 to-lime-500 py-3 text-[14px] font-bold text-lime-950 shadow-glow-lime transition hover:brightness-110 disabled:opacity-50"
              >
                {stage === "rendering" ? "Rendering…" : "Start export"}
              </button>
              <p className="mt-2.5 text-center text-[11px] text-slate-600">Est. time 42s · Pro plan · unlimited 4K</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}