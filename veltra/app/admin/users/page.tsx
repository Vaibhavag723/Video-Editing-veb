"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { DataTable, RowAvatar, InitialsDot } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/SearchField";
import { adminUsers, type UserRow } from "@/lib/admin-tables";
import { cn } from "@/lib/cn";

const roleTone = { Admin: "violet", Editor: "cyan", Member: "slate" } as const;
const planTone = { Agency: "fuchsia", Pro: "lime", Free: "slate" } as const;
const statusTone = { Active: "lime", Pending: "amber", Suspended: "rose" } as const;
const FILTERS = ["All", "Active", "Pending", "Suspended"] as const;

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("All");

  const rows = useMemo(
    () =>
      adminUsers.filter(
        (u) =>
          (status === "All" || u.status === status) &&
          `${u.name} ${u.email}`.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [query, status]
  );

  const columns = [
    {
      key: "user",
      label: "User",
      render: (row: UserRow) => <RowAvatar name={row.name} meta={row.email} />,
    },
    {
      key: "role",
      label: "Role",
      render: (row: UserRow) => <Badge tone={roleTone[row.role]}>{row.role}</Badge>,
    },
    {
      key: "plan",
      label: "Plan",
      render: (row: UserRow) => <Badge tone={planTone[row.plan]}>{row.plan}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (row: UserRow) => <Badge tone={statusTone[row.status]} dot>{row.status}</Badge>,
    },
    {
      key: "projects",
      label: "Projects",
      className: "nums font-semibold text-white",
      render: (row: UserRow) => row.projects,
    },
    { key: "joined", label: "Joined", render: (row: UserRow) => row.joined },
    {
      key: "actions",
      label: "",
      headClassName: "text-right",
      className: "text-right",
      render: () => (
        <button
          aria-label="Row actions"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        eyebrow="Admin"
        title="Users"
        subtitle="Manage accounts, roles and workspace access"
      >
        <Button size="sm" icon={UserPlus}>
          New user
        </Button>
      </PageHeading>

      <DataTable<UserRow>
        columns={columns}
        rows={rows}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <SearchField
              placeholder="Search users…"
              dense
              value={query}
              onChange={setQuery}
              className="w-full max-w-xs"
            />
            <div className="ml-auto flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatus(f)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all",
                    status === f
                      ? "bg-lime-soft/[0.12] text-lime-soft"
                      : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {rows.length === 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-[13px] text-slate-500">
          <InitialsDot name="No One" />
          No users match your filters.
        </div>
      )}
    </>
  );
}