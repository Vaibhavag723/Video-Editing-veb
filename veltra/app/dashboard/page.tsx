"use client";

import { ArrowRight, Film, FolderOpen, Images, Plus, Rocket, Sparkles, Upload, Wand2 } from "lucide-react";
import { UserShell } from "@/components/layout/Shells";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { SectionTitle } from "@/components/dashboard/SectionTitle";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { StorageCard, ProfileSettingsCard } from "@/components/dashboard/SettingsCards";
import { userStats, projects, templates, mediaFiles, exportHistory, recentEdits } from "@/lib/user-data";
import { cn } from "@/lib/cn";

const statIcon = { film: Film, rocket: Rocket, images: Images } as const;
const statTone: Record<string, "violet" | "lime" | "cyan"> = { violet: "violet", lime: "lime", cyan: "cyan" };
const expTone: Record<string, "lime" | "violet" | "rose" | "amber" | "cyan"> = {
  Complete: "lime", Rendering: "cyan", Failed: "rose", Queued: "amber",
};
const mediaIcon: Record<string, React.ElementType> = { Video: Film, Audio: Sparkles, Image: FolderOpen, Text: Wand2 };

export default function UserDashboardPage() {
  return (
    <UserShell>
      <PageHeading
        eyebrow="Workspace · Pro"
        title="Good afternoon, Maya"
        subtitle="Tuesday, August 30 — your Summer Campaign render is 62% done."
      >
        <Button icon={Plus}>Create new project</Button>
      </PageHeading>

      {/* quick stats */}
      <div className="anim-fade-up-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {userStats.map((s) => {
          const Icon = statIcon[s.icon as keyof typeof statIcon];
          return (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              delta={undefined}
              sub={s.delta}
              tone={statTone[s.tone]}
              icon={<Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />}
            />
          );
        })}
      </div>

      {/* create new project banner */}
      <div className="anim-fade-up-2 relative mt-5 overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-r from-violet-700/40 via-purple-800/30 to-[#0b0d1c] p-6 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime-400/10 blur-[90px]" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-[90px]" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-md">
            <span className="label-overline text-lime-300">New project</span>
            <h2 className="display mt-2 text-[22px] font-bold tracking-tight text-white md:text-[26px]">
              Start from scratch or a trend-ready template
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-400">
              Drop in your footage, pick a style, and let AI captions + auto-cuts do the heavy lifting.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button size="lg" icon={Plus}>Start blank</Button>
              <Button variant="secondary" size="lg" icon={Sparkles}>Templates</Button>
              <Button variant="outline" size="lg" icon={Upload}>Import media</Button>
            </div>
          </div>
          <div className="hidden min-w-[240px] flex-1 max-w-sm flex-col gap-2.5 md:flex">
            {[
              { label: "AI captions", meta: "Auto-generate in 60+ languages", tone: "bg-lime-400/10 text-lime-300 border-lime-400/20" },
              { label: "One-click reframe", meta: "9:16 · 1:1 · 4:5 smart crop", tone: "bg-violet-500/[0.15] text-violet-300 border-violet-400/25" },
              { label: "Brand kit sync", meta: "Fonts, colors and lower thirds", tone: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-xl border bg-black/20 px-4 py-3 backdrop-blur">
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-black", f.tone)}>✦</span>
                <div>
                  <p className="text-[13px] font-semibold text-white">{f.label}</p>
                  <p className="text-[11.5px] text-slate-500">{f.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* projects */}
      <section id="projects" className="mt-8 scroll-mt-24">
        <SectionTitle
          title="Projects"
          subtitle="12 projects · 1 exporting right now"
          action={
            <Button variant="secondary" size="sm">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      {/* templates */}
      <section id="templates" className="mt-8 scroll-mt-24">
        <SectionTitle
          title="Templates"
          subtitle="Trending starts — swap in your footage and go"
          action={<Button variant="secondary" size="sm">Browse library</Button>}
        />
        <div className="flex snap-x gap-4 overflow-x-auto pb-2">
          {templates.map((t) => (
            <button
              key={t.id}
              className="group w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.18]"
            >
              <div className={cn("relative aspect-video bg-gradient-to-br", t.gradient)}>
                <div className="absolute inset-0 grid place-items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition-all group-hover:scale-110">
                    <Film className="h-4 w-4" fill="white" />
                  </span>
                </div>
                <span className="absolute left-2 top-2 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                  {t.category}
                </span>
              </div>
              <div className="p-3">
                <p className="text-[13px] font-semibold text-white">{t.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{t.used}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* media */}
      <section id="media" className="mt-8 scroll-mt-24">
        <SectionTitle
          title="Media"
          subtitle="1,208 files · 4.9 GB across the library"
          action={<Button variant="secondary" size="sm" icon={Upload}>Upload</Button>}
        />
        <Card>
          <ul className="divide-y divide-white/[0.045]">
            {mediaFiles.map((m) => {
              const Icon = mediaIcon[m.type];
              return (
                <li key={m.id} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.025]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-violet-300">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{m.name}</p>
                    <p className="text-[11.5px] text-slate-500">
                      {m.type} · {m.duration}
                    </p>
                  </div>
                  <Badge tone={m.type === "Video" ? "cyan" : m.type === "Audio" ? "lime" : "slate"}>{m.type}</Badge>
                  <span className="nums hidden text-[12px] text-slate-500 sm:block">{m.size}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      {/* recent edits */}
      <section className="mt-8 scroll-mt-24">
        <SectionTitle title="Recent edits" subtitle="Your latest timeline changes" />
        <Card>
          <ul className="divide-y divide-white/[0.045]">
            {recentEdits.map((e) => (
              <li key={e.id} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.025]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/[0.14] text-violet-300">
                  <Wand2 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">{e.project}</p>
                  <p className="text-[11.5px] text-slate-500">{e.clip}</p>
                </div>
                <span className="text-[11.5px] text-slate-600">{e.time}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* exports */}
      <section id="exports" className="mt-8 scroll-mt-24">
        <SectionTitle
          title="Exports"
          subtitle="47 renders to date · 12.4 hrs of footage"
          action={<Button variant="secondary" size="sm">Render queue</Button>}
        />
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["File", "Quality", "Status", "Size", "Finished"].map((h) => (
                    <th key={h} className="label-overline px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exportHistory.map((e) => (
                  <tr key={e.id} className="border-b border-white/[0.045] transition-colors last:border-0 hover:bg-white/[0.025]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/[0.12] text-cyan-300">
                          <Rocket className="h-4 w-4" />
                        </span>
                        <span className="text-[13px] font-semibold text-white">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] text-slate-500">{e.quality}</td>
                    <td className="px-5 py-3.5"><Badge tone={expTone[e.status]} dot>{e.status}</Badge></td>
                    <td className="nums px-5 py-3.5 text-[12.5px] text-slate-400">{e.size}</td>
                    <td className="px-5 py-3.5 text-[12.5px] text-slate-500">{e.finished}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* storage + profile */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section id="storage" className="scroll-mt-24">
          <StorageCard />
        </section>
        <section id="profile" className="scroll-mt-24">
          <ProfileSettingsCard />
        </section>
      </div>
    </UserShell>
  );
}