import { KeyRound, ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { DataTable } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/Badge";
import { loginEvents, type LoginRow } from "@/lib/admin-tables";

const statusTone = { Success: "lime", Failed: "rose" } as const;

const chips = [
  { icon: ShieldCheck, label: "Success rate", value: "96.4%", tone: "text-lime-300" },
  { icon: TriangleAlert, label: "Failed attempts (24h)", value: "13", tone: "text-rose-300" },
  { icon: KeyRound, label: "Active sessions", value: "412", tone: "text-cyan-300" },
];

export default function AdminLoginsPage() {
  const columns = [
    {
      key: "email",
      label: "Email",
      render: (row: LoginRow) => <span className="font-medium text-white">{row.email}</span>,
    },
    {
      key: "provider",
      label: "Provider",
      render: (row: LoginRow) => <Badge tone="slate">{row.provider}</Badge>,
    },
    {
      key: "ip",
      label: "IP",
      className: "font-mono text-[12px] text-slate-500",
      render: (row: LoginRow) => row.ip,
    },
    { key: "ua", label: "Device", render: (row: LoginRow) => row.ua },
    {
      key: "status",
      label: "Status",
      render: (row: LoginRow) => (
        <Badge tone={statusTone[row.status]} dot>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "time",
      label: "Time",
      className: "nums text-slate-500",
      render: (row: LoginRow) => row.time,
    },
  ];

  return (
    <>
      <PageHeading
        eyebrow="Admin"
        title="Logins"
        subtitle="Authentication events and security audit"
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {chips.map((c) => (
          <div key={c.label} className="panel flex items-center gap-3.5 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
              <c.icon className={`h-[18px] w-[18px] ${c.tone}`} strokeWidth={2.1} />
            </span>
            <span>
              <span className="nums display block text-[20px] font-bold leading-none text-white">
                {c.value}
              </span>
              <span className="mt-1 block text-[11.5px] text-slate-500">{c.label}</span>
            </span>
          </div>
        ))}
      </div>
      <DataTable<LoginRow> columns={columns} rows={loginEvents} />
    </>
  );
}