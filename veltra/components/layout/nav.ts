import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Newspaper,
  KeyRound,
  MessageSquare,
  Film,
  LayoutTemplate,
  FolderOpen,
  Rocket,
  HardDrive,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  id?: string; // section anchor id (user dashboard scroll-spy)
}

export const adminNav: { top: NavItem[]; side: NavItem[] } = {
  top: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/pages", label: "Pages", icon: FileText },
    { href: "/admin/blog", label: "Blog", icon: Newspaper },
    { href: "/admin/logins", label: "Logins", icon: KeyRound },
    { href: "/admin/questions", label: "Questions", icon: MessageSquare },
  ],
  side: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/pages", label: "Pages", icon: FileText },
    { href: "/admin/blog", label: "Blog", icon: Newspaper },
    { href: "/admin/logins", label: "Logins", icon: KeyRound },
    { href: "/admin/questions", label: "Questions", icon: MessageSquare },
    { href: "/editor", label: "Editor", icon: Film },
  ],
};

export const userNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true, id: "dashboard" },
  { href: "/dashboard#projects", label: "Projects", icon: Film, id: "projects" },
  { href: "/dashboard#templates", label: "Templates", icon: LayoutTemplate, id: "templates" },
  { href: "/dashboard#media", label: "Media", icon: FolderOpen, id: "media" },
  { href: "/dashboard#exports", label: "Exports", icon: Rocket, id: "exports" },
  { href: "/dashboard#storage", label: "Storage", icon: HardDrive, id: "storage" },
  { href: "/dashboard#profile", label: "Profile / Settings", icon: Settings, id: "profile" },
];

export const userTopNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/editor", label: "Editor", icon: Film },
];