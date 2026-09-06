import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="anim-fade-up mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="label-overline text-violet-300">{eyebrow}</p>}
        <h1 className="display mt-1.5 text-[26px] font-bold tracking-tight text-white md:text-[30px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-[13.5px] text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2.5">{children}</div>}
    </div>
  );
}