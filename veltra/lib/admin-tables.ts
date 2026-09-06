// Veltra admin console — demo table datasets.
export interface UserRow { id: string; name: string; email: string; role: "Admin" | "Editor" | "Member"; plan: "Pro" | "Agency" | "Free"; status: "Active" | "Pending" | "Suspended"; projects: number; joined: string; }

export const adminUsers: UserRow[] = [
  { id: "u1", name: "Sofia Alvarez", email: "sofia@motionlab.co", role: "Admin", plan: "Agency", status: "Active", projects: 84, joined: "Mar 2024" },
  { id: "u2", name: "Maya Reinhart", email: "maya@vertex.media", role: "Member", plan: "Pro", status: "Active", projects: 51, joined: "Jul 2025" },
  { id: "u3", name: "Tomas Berg", email: "tomas@northframe.io", role: "Editor", plan: "Pro", status: "Active", projects: 37, joined: "Jan 2025" },
  { id: "u4", name: "Leila Haddad", email: "leila@studio-volt.com", role: "Member", plan: "Free", status: "Pending", projects: 8, joined: "Aug 2026" },
  { id: "u5", name: "Noah Kim", email: "noah@pixelwave.app", role: "Editor", plan: "Agency", status: "Active", projects: 62, joined: "Nov 2024" },
  { id: "u6", name: "Elena Petrova", email: "elena@kinoform.dev", role: "Member", plan: "Pro", status: "Suspended", projects: 19, joined: "Feb 2025" },
  { id: "u7", name: "Arnav Shah", email: "arnav@frameforge.gg", role: "Member", plan: "Pro", status: "Active", projects: 43, joined: "Apr 2026" },
];

export interface AdminPageRow { id: string; title: string; slug: string; status: "Published" | "Draft" | "Review"; updated: string; author: string; }
export const adminPages: AdminPageRow[] = [
  { id: "p1", title: "Home", slug: "/", status: "Published", updated: "2h ago", author: "Sofia" },
  { id: "p2", title: "Pricing", slug: "/pricing", status: "Published", updated: "1d ago", author: "Tomas" },
  { id: "p3", title: "Templates", slug: "/templates", status: "Review", updated: "3h ago", author: "Sofia" },
  { id: "p4", title: "About", slug: "/about", status: "Draft", updated: "5d ago", author: "Noah" },
  { id: "p5", title: "Careers", slug: "/careers", status: "Draft", updated: "12d ago", author: "Tomas" },
  { id: "p6", title: "Changelog", slug: "/changelog", status: "Published", updated: "6h ago", author: "Noah" },
];

export interface BlogRow { id: string; title: string; status: "Published" | "Draft" | "Scheduled"; views: string; updated: string; author: string; tag: string; }
export const blogPosts: BlogRow[] = [
  { id: "b1", title: "5 cuts that make scroll-stopping reels", status: "Published", views: "48.2k", updated: "5h ago", author: "Sofia", tag: "Tutorials" },
  { id: "b2", title: "The Veltra AI caption engine is live", status: "Published", views: "31.7k", updated: "2d ago", author: "Noah", tag: "Product" },
  { id: "b3", title: "Color-grading on a deadline: 3 presets to steal", status: "Published", views: "23.9k", updated: "4d ago", author: "Tomas", tag: "Workflow" },
  { id: "b4", title: "Pricing recs for student creators", status: "Draft", views: "—", updated: "6d ago", author: "Maya", tag: "Growth" },
  { id: "b5", title: "What's new in v2.4", status: "Scheduled", views: "—", updated: "7d ago", author: "Noah", tag: "Product" },
  { id: "b6", title: "Behind the motion: our brand refresh", status: "Published", views: "12.6k", updated: "9d ago", author: "Sofia", tag: "Design" },
];

export interface LoginRow { id: string; email: string; provider: "Email" | "Google" | "Magic link"; ip: string; ua: string; status: "Success" | "Failed"; time: string; }
export const loginEvents: LoginRow[] = [
  { id: "l1", email: "sofia@motionlab.co", provider: "Google", ip: "91.34.200.18", ua: "Chrome · Berlin", status: "Success", time: "12:41" },
  { id: "l2", email: "arnav@frameforge.gg", provider: "Email", ip: "182.70.114.9", ua: "Safari · Mumbai", status: "Success", time: "12:37" },
  { id: "l3", email: "noah@…", provider: "Magic link", ip: "67.81.44.2", ua: "Firefox · Austin", status: "Failed", time: "12:29" },
  { id: "l4", email: "elena@kinoform.dev", provider: "Email", ip: "109.173.5.77", ua: "Chrome · Berlin", status: "Failed", time: "12:11" },
  { id: "l5", email: "maya@vertex.media", provider: "Google", ip: "41.223.98.6", ua: "Chrome · Nairobi", status: "Success", time: "11:58" },
  { id: "l6", email: "tomas@northframe.io", provider: "Email", ip: "198.51.100.22", ua: "Edge · Stockholm", status: "Success", time: "11:44" },
];

export interface QuestionRow { id: string; email: string; subject: string; status: "Open" | "Replied" | "Resolved"; time: string; priority: "High" | "Medium" | "Low"; }
export const questions: QuestionRow[] = [
  { id: "q1", email: "maya@vertex.media", subject: "Export stuck at 98% — 4K + captions", status: "Open", time: "38m ago", priority: "High" },
  { id: "q2", email: "leila@studio-volt.com", subject: "Watermark-free on free plan?", status: "Open", time: "1h ago", priority: "Medium" },
  { id: "q3", email: "noah@…", subject: "Team seats billing question", status: "Replied", time: "3h ago", priority: "Medium" },
  { id: "q4", email: "elena@kinoform.dev", subject: "Suspended account — review", status: "Open", time: "5h ago", priority: "High" },
  { id: "q5", email: "arnav@frameforge.gg", subject: "Missing fonts in text overlay", status: "Resolved", time: "1d ago", priority: "Low" },
];
