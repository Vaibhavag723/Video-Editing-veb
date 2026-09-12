import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { adminStats } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Dashboard · Veltra Admin" };

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeading title="Dashboard" subtitle="Overview of your Veltra workspace" />

      {/* Metric cards — 5 across on desktop */}
      <section
        aria-label="Key metrics"
        className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5"
      >
        {adminStats.map((s, i) => (
          <MetricCard key={s.label} index={i} value={s.value} label={s.label} delta={s.delta} />
        ))}
      </section>

      {/* Bottom section — activity feed + quick actions */}
      <section className="mt-6 grid items-start gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
      </section>
    </>
  );
}