const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/* ---- rail tools ---- */
export const CursorIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
  </svg>
);

export const ScissorsIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
  </svg>
);

export const TypeIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <path d="M4 7V5h16v2M12 5v14M9 19h6" />
  </svg>
);

export const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
  </svg>
);

export const ShapesIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <path d="M16.5 3.5L20 9h-7l3.5-5.5z" />
    <circle cx="16.5" cy="16.5" r="4.5" />
  </svg>
);

export const ImageIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

export const MusicIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export const SlidersIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <path d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="9" cy="6" r="2.2" fill="#131318" />
    <circle cx="15" cy="12" r="2.2" fill="#131318" />
    <circle cx="7" cy="18" r="2.2" fill="#131318" />
  </svg>
);

/* ---- window chrome ---- */
export const FilmIcon = () => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4" />
  </svg>
);

export const ResetIcon = () => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const PlaySolidIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.5v13l11-6.5-11-6.5z" />
  </svg>
);

export const PlayRoundedIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 4.8c0-1.2 1.3-1.9 2.3-1.3l10 6.1c1 .6 1 2 0 2.6l-10 6.1C8.3 18.9 7 18.2 7 17V4.8z" />
  </svg>
);

export const SkipBackIcon = () => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth="2">
    <path d="M19 20L9 12l10-8v16z" />
    <path d="M5 19V5" />
  </svg>
);

export const SkipFwdIcon = () => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth="2">
    <path d="M5 4l10 8-10 8V4z" />
    <path d="M19 5v14" />
  </svg>
);

/* ---- hero + cards ---- */
export const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth="2.2">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ZapIcon = () => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth="1.8">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export const LinkIcon = () => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth="1.8">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const CloudIcon = () => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth="1.8">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);
