// Veltra admin console — metric cards and activity feed.
export type Tone = "violet" | "lime" | "cyan" | "amber" | "rose" | "slate" | "fuchsia" | "blue" | "orange" | "purple";

export const adminStats = [
  { label: "Users", value: "8,429", delta: "+10%" },
  { label: "Admins", value: "36", delta: "+2%" },
  { label: "Posts", value: "1,204", delta: "+16%" },
  { label: "Pages", value: "92", delta: "+0%" },
  { label: "Logins", value: "3,671", delta: "+22%" },
];

export type ActivityKind = "user" | "project" | "export" | "payment" | "login" | "admin" | "question";
export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string; // bold lead (usually the actor's name)
  action?: string;
  meta?: string;
  time: string;
  tone: Tone;
}

export const recentActivity: ActivityItem[] = [
  { id: "a1", kind: "login", title: "Sara M", action: "logged in", meta: "Chrome · New York", time: "2 minutes ago", tone: "lime" },
  { id: "a2", kind: "user", title: "Marcus P", action: "deleted a post", meta: "“Pricing recs for student creators”", time: "5 minutes ago", tone: "orange" },
  { id: "a3", kind: "admin", title: "Admin", action: "updated permissions", meta: "Editor role — upload limits raised", time: "15 minutes ago", tone: "purple" },
  { id: "a4", kind: "user", title: "New user", action: "registered", meta: "leila@studio-volt.com", time: "24 minutes ago", tone: "blue" },
  { id: "a5", kind: "question", title: "Jamie C", action: "submitted a question", meta: "Export stuck at 98% — 4K + captions", time: "38 minutes ago", tone: "orange" },
  { id: "a6", kind: "login", title: "Damien", action: "logged in from UK", meta: "Safari · London", time: "1 hour ago", tone: "lime" },
];