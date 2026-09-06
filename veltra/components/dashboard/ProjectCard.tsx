import Link from "next/link";
import { Film, MoreHorizontal, Play } from "lucide-react";
import type { Project } from "@/lib/user-data";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const thumbs: Record<string, string> = {
  violet: "from-violet-500 to-purple-900",
  lime: "from-lime-400 to-emerald-800",
  cyan: "from-cyan-400 to-blue-900",
  fuchsia: "from-fuchsia-500 to-pink-900",
  amber: "from-amber-400 to-orange-900",
  rose: "from-rose-500 to-red-900",
};

const statusTone: Record<Project["status"], "cyan" | "lime" | "violet" | "slate"> = {
  Editing: "cyan",
  Rendered: "lime",
  Exporting: "violet",
  Draft: "slate",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="panel group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16]">
      <Link href="/editor" className="block">
        <div
          className={cn(
            "relative aspect-video overflow-hidden bg-gradient-to-br",
            thumbs[project.thumb] ?? thumbs.violet
          )}
        >
          {/* ambient inner glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.14),transparent_55%)]" />
          {/* film sprockets */}
          <div className="absolute inset-y-0 left-0 flex flex-col justify-between py-2 opacity-30">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="mx-1 h-2 w-1.5 rounded-sm bg-white/80" />
            ))}
          </div>
          <div className="absolute inset-y-0 right-0 flex flex-col justify-between py-2 opacity-30">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="mx-1 h-2 w-1.5 rounded-sm bg-white/80" />
            ))}
          </div>
          {/* center play */}
          <div className="absolute inset-0 grid place-items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
              <Play className="ml-0.5 h-4 w-4 fill-white" />
            </span>
          </div>
          <span className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-semibold text-white/80">
            <span className="rounded-md bg-black/35 px-1.5 py-0.5 backdrop-blur">{project.duration}</span>
            <span className="rounded-md bg-black/35 px-1.5 py-0.5 backdrop-blur">{project.frames} frames</span>
          </span>
        </div>
      </Link>
      <div className="flex items-center gap-3 p-3.5">
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-violet-300")}>
          <Film className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <Link href="/editor" className="block truncate text-[13.5px] font-semibold text-white hover:text-lime-300">
            {project.title}
          </Link>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-slate-500">
            Updated {project.updated} · {project.size}
          </p>
        </div>
        <Badge tone={statusTone[project.status]} dot>
          {project.status}
        </Badge>
        <button className="rounded-lg p-1 text-slate-600 transition-colors hover:bg-white/[0.06] hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}