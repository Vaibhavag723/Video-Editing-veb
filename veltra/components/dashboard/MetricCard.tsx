import { ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Metric tile per the admin dashboard spec:
 * large bold number → label underneath → small green delta pill with arrow.
 * Soft dark panel, subtle border, lime hover glow.
 */
export function MetricCard({
  value,
  label,
  delta,
  index = 0,
}: {
  value: string;
  label: string;
  delta: string;
  index?: number;
}) {
  const neutral = delta === "+0%";
  const up = delta.startsWith("+") && !neutral;

  return (
    <div
      className="panel anim-fade-up group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-lime-soft/25 hover:shadow-[0_18px_50px_-24px_rgba(168,255,120,0.28)]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle, rgba(168,255,120,0.22), transparent 70%)" }}
      />
      <p className="nums display text-[30px] font-bold leading-none tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-[13px] font-medium text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-bold",
          up && "bg-lime-soft/10 text-lime-soft",
          neutral && "bg-white/[0.06] text-slate-400"
        )}
      >
        {up ? (
          <ArrowUpRight className="h-3 w-3" strokeWidth={2.6} />
        ) : (
          <Minus className="h-3 w-3" strokeWidth={2.6} />
        )}
        {delta}
      </p>
    </div>
  );
}