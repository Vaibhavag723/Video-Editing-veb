import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "lime" | "cyan" | "violet" | "amber" | "rose" | "slate" | "fuchsia";

const tones: Record<Tone, string> = {
  lime: "bg-lime-400/10 text-lime-300 border-lime-400/20",
  cyan: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
  violet: "bg-violet-500/[0.15] text-violet-300 border-violet-400/25",
  amber: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  rose: "bg-rose-500/10 text-rose-300 border-rose-400/20",
  fuchsia: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/20",
  slate: "bg-white/[0.06] text-slate-300 border-white/10",
};

export function Badge({
  tone = "slate",
  dot = false,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        tones[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "lime" && "bg-lime-400",
            tone === "cyan" && "bg-cyan-400",
            tone === "violet" && "bg-violet-400",
            tone === "amber" && "bg-amber-400",
            tone === "rose" && "bg-rose-400",
            tone === "fuchsia" && "bg-fuchsia-400",
            tone === "slate" && "bg-slate-500"
          )}
        />
      )}
      {children}
    </span>
  );
}