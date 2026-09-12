import type { ReactNode } from "react";

export function SectionTitle({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex flex-wrap items-end justify-between gap-3 ${className ?? ""}`}>
      <div>
        <h2 className="display text-[17px] font-bold tracking-tight text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}