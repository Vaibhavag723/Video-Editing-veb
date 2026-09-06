import { MoreHorizontal, Plus } from "lucide-react";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { DataTable } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/Badge";
import { adminPages, type AdminPageRow } from "@/lib/admin-tables";

const statusTone = { Published: "lime", Draft: "slate", Review: "amber" } as const;

export default function AdminPagesPage() {
  const columns = [
    {
      key: "title",
      label: "Title",
      render: (row: AdminPageRow) => (
        <span className="font-semibold text-white">{row.title}</span>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (row: AdminPageRow) => (
        <span className="rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 font-mono text-[11.5px] text-slate-400">
          {row.slug}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: AdminPageRow) => (
        <Badge tone={statusTone[row.status]} dot>
          {row.status}
        </Badge>
      ),
    },
    { key: "author", label: "Author", render: (row: AdminPageRow) => row.author },
    { key: "updated", label: "Updated", render: (row: AdminPageRow) => row.updated },
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
      <PageHeading eyebrow="Admin" title="Pages" subtitle="Marketing site and static content">
        <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 text-[13px] font-semibold text-slate-100 transition-colors hover:bg-white/[0.11]">
          <Plus className="h-4 w-4" strokeWidth={2.2} /> New page
        </button>
      </PageHeading>
      <DataTable<AdminPageRow> columns={columns} rows={adminPages} />
    </>
  );
}