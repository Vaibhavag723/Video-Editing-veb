"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, ChevronDown, LogOut, Plus } from "lucide-react";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { adminNav, userNav, userTopNav } from "./nav";
import { Avatar } from "@/components/ui/Avatar";
import { SearchField } from "@/components/ui/SearchField";
import { cn } from "@/lib/cn";

const userTopNavForBar = userTopNav;
const userSideNav = userNav;
const userMobileNav = [
  userNav[0],
  userNav[1],
  userNav[3],
  userNav[2],
  userNav[6],
];

const SECTIONS = ["projects", "templates", "media", "exports", "storage", "profile"];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const right = (
    <>
      <Link
        href="/dashboard"
        className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12.5px] font-semibold text-slate-300 transition-colors hover:border-white/25 hover:text-white md:flex"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
        Back
      </Link>
      <div className="hidden lg:block">
        <SearchField placeholder="Search users, pages…" dense className="w-56" />
      </div>
      <button aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:border-white/20 hover:text-white">
        <Bell className="h-[17px] w-[17px]" strokeWidth={2.1} />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.9)]" />
      </button>
      <button className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5 transition-colors hover:border-white/20 sm:flex">
        <Avatar name="Alex Rivera" size="sm" />
        <span className="text-left leading-tight">
          <span className="block text-[12px] font-semibold text-white">Alex Rivera</span>
          <span className="block text-[10px] font-medium text-lime-300">Super admin</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
      </button>
      <button aria-label="Sign out" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:border-white/20 hover:text-white lg:hidden">
        <LogOut className="h-[17px] w-[17px]" />
      </button>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav items={adminNav.top} right={right} />
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-0">
        <Sidebar items={adminNav.side} topLabel="Admin" />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-10 lg:px-8">{children}</main>
      </div>
      <MobileNav
        items={adminNav.top}
        extraLabel="More"
        extraItems={[{ href: "/editor", label: "Video editor", icon: adminNav.side[6].icon }]}
      />
    </div>
  );
}

export function UserShell({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -62% 0px" }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const right = (
    <>
      <a
        href="/editor"
        className={cn(
          "hidden items-center gap-1.5 rounded-xl bg-gradient-to-b from-lime-400 to-lime-500 px-3.5 py-2 text-[13px] font-bold text-lime-950 shadow-[0_10px_30px_-10px_rgba(163,230,53,0.6)] transition-all hover:brightness-110 sm:inline-flex"
        )}
      >
        <Plus className="h-4 w-4" strokeWidth={2.6} />
        New project
      </a>
      <button className="hidden rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-slate-300 transition-colors hover:border-white/25 hover:text-white md:block lg:hidden xl:block">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
          Pro plan
        </span>
      </button>
      <button aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:border-white/20 hover:text-white">
        <Bell className="h-[17px] w-[17px]" strokeWidth={2.1} />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
      </button>
      <Avatar name="Maya Chen" size="sm" ring className="cursor-pointer" />
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav items={userTopNavForBar} right={right} />
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-0">
        <Sidebar
          items={userSideNav}
          activeId={activeSection}
          footerLabel="Render queue"
          footerMeta="2 jobs · healthy"
        />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-10 lg:px-8">{children}</main>
      </div>
      <MobileNav items={userMobileNav} activeId={activeSection} extraLabel="Profile" />
    </div>
  );
}