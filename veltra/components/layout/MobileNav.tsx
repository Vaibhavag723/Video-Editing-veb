"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { NavItem } from "./nav";
import { cn } from "@/lib/cn";

export function MobileNav({
  items,
  extraLabel = "More",
  extraItems = [],
  activeId,
}: {
  items: NavItem[];
  extraLabel?: string;
  extraItems?: NavItem[];
  activeId?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visible = items.slice(0, 4);
  const active = (href: string, end?: boolean, id?: string) => {
    if (activeId && id) return id === activeId;
    const base = href.split("#")[0];
    return end ? pathname === base || pathname.startsWith(base + "/") : pathname.startsWith(base);
  };

  return (
    <>
      {/* more sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="absolute inset-x-3 bottom-24 rounded-2xl border border-white/10 bg-[#0b0d1c]/95 p-2 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="label-overline">{extraLabel}</span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {[...items.slice(4), ...extraItems].map((item) => {
              const Icon = item.icon;
              const isActive = active(item.href, item.end, item.id);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                    isActive ? "bg-white/[0.07] text-white" : "text-slate-300"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] text-violet-300" strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#070813]/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 px-1">
          {visible.map((item) => {
            const Icon = item.icon;
            const isActive = active(item.href, item.end, item.id);
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1 py-2.5"
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                    isActive ? "bg-lime-400/[0.15] text-lime-300" : "text-slate-500"
                  )}
                >
                  <Icon className="h-[19px] w-[19px]" strokeWidth={2.1} />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    isActive ? "text-lime-300" : "text-slate-500"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex flex-col items-center gap-1 py-2.5"
          >
            <span className="flex h-8 w-12 items-center justify-center rounded-full text-slate-400">
              <Menu className="h-[19px] w-[19px]" strokeWidth={2.1} />
            </span>
            <span className="text-[10px] font-semibold text-slate-500">{extraLabel}</span>
          </button>
        </div>
      </nav>
    </>
  );
}