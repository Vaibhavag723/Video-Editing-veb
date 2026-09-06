// VidioCut brand mark — the FlowStep tile: a green rounded square with a
// rounded white play triangle. Pure inline SVG: crisp at any size, no
// external asset. Renders a <svg>, so surrounding wordmark text stays in
// the markup and is styled by the parent CSS (.brand / .brand-mark).
export default function Logo({ size = 28, className = '' }) {
  const gradId = `vc-tile-${size}`;
  return (
    <svg
      className={`cr-logo ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="VidioCut"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3df59f" />
          <stop offset="1" stopColor="#12c476" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${gradId})`} />
      <path
        d="M19 15.4c0-1.7 1.8-2.7 3.2-1.8l14.2 8.6c1.4.8 1.4 2.8 0 3.6l-14.2 8.6c-1.4.9-3.2-.1-3.2-1.8V15.4z"
        fill="#ffffff"
      />
    </svg>
  );
}
