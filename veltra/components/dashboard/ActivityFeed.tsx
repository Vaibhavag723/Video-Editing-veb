import { CardHeader } from "@/components/ui/Card";
import { recentActivity } from "@/lib/admin-data";
import { cn } from "@/lib/cn";

const dotTone: Record<string, string> = {
  lime: "bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.85)]",
  green: "bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.85)]",
  purple: "bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.85)]",
  violet: "bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.85)]",
  blue: "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.85)]",
  cyan: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.85)]",
  orange: "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.85)]",
  amber: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.85)]",
  rose: "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.85)]",
  fuchsia: "bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.85)]",
  slate: "bg-slate-500",
};

/** "Recent Activity" panel — colored status dot, name + action, time ago. */
export function ActivityFeed() {
  return (
    <section className="panel anim-fade-up overflow-hidden" style={{ animationDelay: "420ms" }}>
      <CardHeader
        title="Recent Activity"
        subtitle="Latest logins and admin actions"
        className="pb-4"
      />
      <ul className="border-t border-white/[0.05]">
        {recentActivity.map((item) => (
          <li
            key={item.id}
            title={item.meta}
            className="group flex items-center gap-3.5 border-b border-white/[0.045] px-5 py-3.5 transition-colors last:border-0 hover:bg-white/[0.03]"
          >
            <span className={cn("h-2 w-2 shrink-0 rounded-full", dotTone[item.tone])} />
            <p className="min-w-0 truncate text-[13.5px] text-slate-300">
              <span className="font-semibold text-white">{item.title}</span> {item.action}
            </p>
            <span className="ml-auto shrink-0 text-[11.5px] font-medium text-slate-600 transition-colors group-hover:text-slate-500">
              {item.time}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}