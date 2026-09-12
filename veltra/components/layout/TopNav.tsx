"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function NavLink({
  href,
  label,
  active,
  className,
}: {
  href: string;
  label: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all duration-200",
        active
          ? "bg-lime-soft/[0.09] text-lime-soft"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
        className
      )}
    >
      {active && <span className="absolute -bottom-[18px] h-0.5 w-6 rounded-full bg-lime-soft shadow-[0_0_12px_rgba(168,255,120,0.9)]" />}
      {label}
    </Link>
  );
}

export function isActivePath(pathname: string, href: string, end?: boolean): boolean {
  if (end) return pathname === href || pathname.startsWith(href + "/");
  return pathname.startsWith(href);
}

export function TopNav({
  items,
  right,
  onOpenSearch,
}: {
  items: { href: string; label: string; end?: boolean }[];
  right?: React.ReactNode;
  onOpenSearch?: () => void;
}) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#05060d]/75 backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <Link href="/admin" className="shrink-0" aria-label="Veltra home">
          <span className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 to-purple-800 shadow-glow-soft">
              <svg viewBox="0 0 36 36" className="h-8 w-8" fill="none" aria-hidden="true">
                <path d="M14 11.4v13.2l11.4-6.6L14 11.4Z" fill="#a3e635" />
                <path d="M25.6 7.6 10.8 28.4" stroke="#67e8f9" strokeWidth="2.1" strokeLinecap="round" />
              </svg>
            </span>
            <span className="display hidden text-[17px] font-bold tracking-tight text-white md:block">
              veltra<span className="text-lime-400">.</span>
            </span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 overflow-x-auto lg:flex" aria-label="Primary">
          {items.map((item) => (
            <NavLink
              key={item.href + item.label}
              href={item.href}
              label={item.label}
              active={isActivePath(pathname, item.href, item.end)}
            />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}

export function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-[13px] text-slate-500" aria-label="Breadcrumb">
      {items.map((label, i) => (
        <span key={label} className="flex items-center gap-1.5">
          {i > 0 && <MoveRight className="h-3.5 w-3.5 text-slate-700" />}
          <span className={i === items.length - 1 ? "font-semibold text-white" : ""}>{label}</span>
        </span>
      ))}
    </nav>
  );
}