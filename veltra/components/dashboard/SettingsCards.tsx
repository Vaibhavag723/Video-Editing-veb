"use client";

import { useState } from "react";
import { ArrowUpRight, BadgeCheck, Bell, LogOut, ShieldCheck, Zap } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { storagePlan } from "@/lib/user-data";
import { cn } from "@/lib/cn";

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        on ? "bg-lime-400" : "bg-white/[0.12]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
          on ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

export function StorageCard() {
  const pct = storagePlan.pct;
  return (
    <Card>
      <CardHeader title="Storage" subtitle={`${storagePlan.plan} · renews ${storagePlan.renews}`} />
      <div className="flex items-center gap-5 p-5 pt-4">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center">
          <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
            <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="#a3e635"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 2 * Math.PI * 40} ${2 * Math.PI * 40}`}
              style={{ filter: "drop-shadow(0 0 8px rgba(163,230,53,0.5))" }}
            />
          </svg>
          <span className="absolute nums display text-[19px] font-bold text-white">{pct}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-slate-400">
            <span className="nums font-bold text-white">{storagePlan.usedGB} GB</span> of{" "}
            {storagePlan.totalGB} GB used
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">
            Projects and exports are stored safely with end-to-end encryption.
          </p>
          <Button size="sm" className="mt-3" icon={ArrowUpRight}>
            Upgrade to Agency (2 TB)
          </Button>
        </div>
      </div>
      <div className="px-5 pb-5">
        <Progress value={storagePlan.pct} />
        <p className="mt-2 text-[11px] text-slate-600">Auto-archive inactive drafts to free up space.</p>
      </div>
    </Card>
  );
}

export function ProfileSettingsCard() {
  const [digest, setDigest] = useState(true);
  const [notify, setNotify] = useState(true);
  const [autosave, setAutosave] = useState(true);
  return (
    <Card>
      <CardHeader title="Profile & settings" subtitle="Account, preferences and security" />
      <div className="space-y-5 p-5 pt-4">
        <div className="flex items-center gap-4">
          <Avatar name="Maya Chen" size="xl" ring />
          <div>
            <p className="display text-[15px] font-semibold text-white">Maya Chen</p>
            <p className="text-[12.5px] text-slate-500">maya@vertex.media</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-lime-300">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified creator · Pro
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          {[
            { label: "Weekly digest", desc: "Project stats in your inbox every Monday", on: digest, toggle: () => setDigest((v) => !v) },
            { label: "Render notifications", desc: "Alerts when exports finish", on: notify, toggle: () => setNotify((v) => !v) },
            { label: "Autosave drafts", desc: "Push every edit to cloud instantly", on: autosave, toggle: () => setAutosave((v) => !v) },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-white">{s.label}</p>
                <p className="text-[11.5px] text-slate-500">{s.desc}</p>
              </div>
              <Switch on={s.on} onToggle={s.toggle} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone="violet" dot>
            <ShieldCheck className="h-3.5 w-3.5" /> 2FA enabled
          </Badge>
          <Badge tone="cyan">
            <Zap className="h-3.5 w-3.5" /> 4K exports
          </Badge>
          <Badge tone="lime">
            <Bell className="h-3.5 w-3.5" /> Notifications on
          </Badge>
        </div>

        <div className="flex items-center gap-3 border-t border-white/[0.06] pt-4">
          <Button variant="secondary" size="sm" icon={LogOut}>
            Sign out
          </Button>
          <span className="text-[11.5px] text-slate-600">Last signed in: 2h ago · Chrome on Windows</span>
        </div>
      </div>
    </Card>
  );
}