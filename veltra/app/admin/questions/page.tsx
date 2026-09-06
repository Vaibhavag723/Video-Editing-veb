import { PageHeading } from "@/components/dashboard/PageHeading";
import { DataTable } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/Badge";
import { questions, type QuestionRow } from "@/lib/admin-tables";

const statusTone = { Open: "amber", Replied: "violet", Resolved: "lime" } as const;
const priorityTone = { High: "rose", Medium: "amber", Low: "slate" } as const;

export default function AdminQuestionsPage() {
  const columns = [
    {
      key: "subject",
      label: "Subject",
      render: (row: QuestionRow) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{row.subject}</p>
          <p className="truncate text-[11.5px] text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (row: QuestionRow) => (
        <Badge tone={priorityTone[row.priority]}>{row.priority}</Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: QuestionRow) => (
        <Badge tone={statusTone[row.status]} dot>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "time",
      label: "Received",
      className: "text-slate-500",
      render: (row: QuestionRow) => row.time,
    },
    {
      key: "actions",
      label: "",
      headClassName: "text-right",
      className: "text-right",
      render: () => (
        <button className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-slate-300 transition-colors hover:border-lime-soft/30 hover:text-lime-soft">
          Reply
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        eyebrow="Admin"
        title="Questions"
        subtitle="Support inbox — user submissions and replies"
      />
      <DataTable<QuestionRow> columns={columns} rows={questions} />
    </>
  );
}