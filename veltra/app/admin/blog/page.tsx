import { MoreHorizontal, Plus } from "lucide-react";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { DataTable } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/Badge";
import { blogPosts, type BlogRow } from "@/lib/admin-tables";

const statusTone = { Published: "lime", Draft: "slate", Scheduled: "cyan" } as const;
const tagTone: Record<string, "cyan" | "violet" | "lime" | "amber" | "fuchsia"> = {
  Tutorials: "cyan",
  Product: "violet",
  Workflow: "lime",
  Growth: "amber",
  Design: "fuchsia",
};

export default function AdminBlogPage() {
  const columns = [
    {
      key: "title",
      label: "Post",
      render: (row: BlogRow) => <span className="font-semibold text-white">{row.title}</span>,
    },
    {
      key: "tag",
      label: "Tag",
      render: (row: BlogRow) => <Badge tone={tagTone[row.tag]}>{row.tag}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (row: BlogRow) => (
        <Badge tone={statusTone[row.status]} dot>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "views",
      label: "Views",
      className: "nums font-semibold text-white",
      render: (row: BlogRow) => row.views,
    },
    { key: "author", label: "Author", render: (row: BlogRow) => row.author },
    { key: "updated", label: "Updated", render: (row: BlogRow) => row.updated },
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
      <PageHeading eyebrow="Admin" title="Blog" subtitle="Articles, drafts and scheduling">
        <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 text-[13px] font-semibold text-slate-100 transition-colors hover:bg-white/[0.11]">
          <Plus className="h-4 w-4" strokeWidth={2.2} /> New post
        </button>
      </PageHeading>
      <DataTable<BlogRow> columns={columns} rows={blogPosts} />
    </>
  );
}