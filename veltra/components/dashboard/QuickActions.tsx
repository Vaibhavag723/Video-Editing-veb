import Link from "next/link";
import { ChevronRight, MessageSquare, PenLine, UserPlus } from "lucide-react";
import { CardHeader } from "@/components/ui/Card";

const actions = [
  {
    label: "Create user",
    desc: "Add a new account",
    icon: UserPlus,
    href: "/admin/users",
    tile: "border-lime-400/20 bg-gradient-to-br from-lime-400/20 to-emerald-500/[0.06] text-lime-300",
  },
  {
    label: "New post",
    desc: "Draft a blog entry",
    icon: PenLine,
    href: "/admin/blog",
    tile: "border-violet-400/25 bg-gradient-to-br from-violet-500/25 to-fuchsia-500/[0.08] text-violet-300",
  },
  {
    label: "View questions",
    desc: "Review submissions",
    icon: MessageSquare,
    href: "/admin/questions",
    tile: "border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-blue-500/[0.06] text-cyan-300",
  },
];

/** "Quick Actions" panel — three common admin tasks + system health status. */
export function QuickActions() {
  return (
    <section className="panel anim-fade-up p-5 pt-4" style={{ animationDelay: "500ms" }}>
      <CardHeader
        title="Quick Actions"
        subtitle="Common admin tasks"
        className="mb-4 px-0 pt-0"
      />
      <div className="space-y-2.5">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="group flex items-center gap-3.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.055]"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${a.tile}`}
            >
              <a.icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold text-white">{a.label}</span>
              <span className="block text-[11.5px] text-slate-500">{a.desc}</span>
            </span>
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-lime-soft" />
          </Link>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-lime-400/[0.15] bg-lime-400/[0.05] px-4 py-3.5">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.9)]" />
        </span>
        <span className="min-w-0">
          <span className="block text-[12.5px] font-semibold text-lime-300">System healthy</span>
          <span className="block text-[11px] text-slate-500">
            All systems operational, last check 9m ago
          </span>
        </span>
      </div>
    </section>
  );
}