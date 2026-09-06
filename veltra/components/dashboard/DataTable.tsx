import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Shared component — no client hooks, so it renders on the server too.
// (Render-function columns passed from server pages must not cross a
//  server→client serialization boundary.)

export interface Column<T> {
  key: string;
  label: string;
  className?: string;
  headClassName?: string;
  render: (row: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  className,
  toolbar,
}: {
  columns: Column<T>[];
  rows: T[];
  className?: string;
  toolbar?: ReactNode;
}) {
  return (
    <div className={cn("panel overflow-hidden", className)}>
      {toolbar && <div className="border-b border-white/[0.07] px-5 py-4">{toolbar}</div>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "label-overline px-5 py-3.5 first:pl-5",
                    c.headClassName
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="group border-b border-white/[0.045] transition-colors last:border-0 hover:bg-white/[0.03]"
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-5 py-3.5 text-[13px] text-slate-300", c.className)}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RowAvatar({ name, meta }: { name: string; meta?: string }) {
  return (
    <div className="flex items-center gap-3">
      <InitialsDot name={name} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-white">{name}</p>
        {meta && <p className="truncate text-[11.5px] text-slate-500">{meta}</p>}
      </div>
    </div>
  );
}

export function InitialsDot({ name }: { name: string }) {
  const short = name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const hues = ["from-violet-500 to-fuchsia-600", "from-lime-400 to-emerald-600", "from-cyan-400 to-blue-600", "from-amber-400 to-orange-600", "from-fuchsia-500 to-pink-600"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10.5px] font-bold text-white",
        hues[h % hues.length]
      )}
    >
      {short}
    </span>
  );
}