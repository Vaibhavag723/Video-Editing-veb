// Veltra creator dashboard demo dataset.
import type { Tone } from "./admin-data";

export const userStats = [
  { label: "Projects", value: "12", delta: "+3 this month", icon: "film", tone: "violet" as Tone },
  { label: "Exports", value: "47", delta: "12.4 hrs rendered", icon: "rocket", tone: "lime" as Tone },
  { label: "Media files", value: "1,208", delta: "4.9 GB", icon: "images", tone: "cyan" as Tone },
];

export interface Project {
  id: string;
  title: string;
  updated: string;
  duration: string;
  status: "Editing" | "Rendered" | "Exporting" | "Draft";
  thumb: string;
  frames: string;
  size: string;
}

export const projects: Project[] = [
  { id: "pr1", title: "Product Launch — 60s Hero", updated: "12m ago", duration: "0:58", status: "Editing", thumb: "violet", frames: "1,412", size: "412 MB" },
  { id: "pr2", title: "Summer Campaign 2026", updated: "2h ago", duration: "2:14", status: "Rendered", thumb: "lime", frames: "3,204", size: "1.1 GB" },
  { id: "pr3", title: "Reel 04 — TikTok HD", updated: "1d ago", duration: "0:34", status: "Exporting", thumb: "cyan", frames: "812", size: "188 MB" },
  { id: "pr4", title: "Customer story — Vera", updated: "3d ago", duration: "1:47", status: "Draft", thumb: "fuchsia", frames: "2,566", size: "960 MB" },
  { id: "pr5", title: "Founder vlog — episode 12", updated: "5d ago", duration: "8:02", status: "Rendered", thumb: "amber", frames: "11,520", size: "3.4 GB" },
  { id: "pr6", title: "How to: AI captions in 3 steps", updated: "1w ago", duration: "1:21", status: "Editing", thumb: "rose", frames: "1,944", size: "521 MB" },
];

export interface Template { id: string; name: string; category: string; used: string; gradient: string; }
export const templates: Template[] = [
  { id: "t1", name: "Kinetic Text", category: "Titles", used: "41k uses", gradient: "from-violet-600 to-fuchsia-600" },
  { id: "t2", name: "Speed Ramp", category: "Motion", used: "28k uses", gradient: "from-cyan-500 to-blue-600" },
  { id: "t3", name: "Podcast Clip", category: "Social", used: "19k uses", gradient: "from-amber-500 to-orange-600" },
  { id: "t4", name: "Neon Intro", category: "Titles", used: "12k uses", gradient: "from-lime-400 to-emerald-600" },
  { id: "t5", name: "Duo Split", category: "Layouts", used: "9k uses", gradient: "from-fuchsia-500 to-violet-700" },
];

export interface MediaFile { id: string; name: string; type: "Video" | "Audio" | "Image" | "Text"; size: string; duration: string; tone: Tone; }
export const mediaFiles: MediaFile[] = [
  { id: "m1", name: "hero-broll.mp4", type: "Video", size: "48 MB", duration: "0:42", tone: "violet" },
  { id: "m2", name: "product-shot.mov", type: "Video", size: "126 MB", duration: "1:08", tone: "cyan" },
  { id: "m3", name: "drone-skyline.mp4", type: "Video", size: "88 MB", duration: "0:24", tone: "violet" },
  { id: "m4", name: "voiceover-take2.wav", type: "Audio", size: "12 MB", duration: "2:13", tone: "lime" },
  { id: "m5", name: "summer-drum-loop.mp3", type: "Audio", size: "6 MB", duration: "0:08", tone: "amber" },
  { id: "m6", name: "brand-logo.png", type: "Image", size: "1 MB", duration: "—", tone: "fuchsia" },
  { id: "m7", name: "lower-third-graphic.png", type: "Image", size: "2 MB", duration: "—", tone: "cyan" },
];

export interface ExportRow { id: string; name: string; quality: string; status: "Complete" | "Rendering" | "Failed" | "Queued"; size: string; finished: string; }
export const exportHistory: ExportRow[] = [
  { id: "e1", name: "product-launch-hero-4k.webm", quality: "4K · 60fps", status: "Complete", size: "214 MB", finished: "2m ago" },
  { id: "e2", name: "reel-04-tiktok-hd.mp4", quality: "1080p · 30fps", status: "Rendering", size: "—", finished: "…" },
  { id: "e3", name: "summer-campaign-2k.mov", quality: "2K · 30fps", status: "Complete", size: "1.6 GB", finished: "1d ago" },
  { id: "e4", name: "podcast-clip-fb.mp4", quality: "720p · 30fps", status: "Failed", size: "—", finished: "2d ago" },
  { id: "e5", name: "founder-vlog-1080.mp4", quality: "1080p · 30fps", status: "Complete", size: "988 MB", finished: "4d ago" },
];

export const storagePlan = { usedGB: 24.6, totalGB: 50, pct: 49, plan: "Studio — Pro", renews: "Sep 30, 2026" };

export const recentEdits = [
  { id: 1, project: "Product Launch — 60s Hero", clip: "Shot 04 · trim", time: "12m ago" },
  { id: 2, project: "Product Launch — 60s Hero", clip: "Caption block B", time: "48m ago" },
  { id: 3, project: "Summer Campaign 2026", clip: "Transition · spin", time: "2h ago" },
  { id: 4, project: "Reel 04 — TikTok HD", clip: "Color preset: Neon", time: "5h ago" },
];