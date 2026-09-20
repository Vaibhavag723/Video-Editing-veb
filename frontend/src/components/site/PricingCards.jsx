import Reveal from './landing/Reveal.jsx';

const PLANS = [
  {
    name: 'FREE',
    tagline: 'For quick trims and everyday edits.',
    price: '$0',
    period: 'free forever',
    cta: 'Start editing',
    featured: false,
    features: ['Trim', 'Cut', 'Color', 'Text', '720p export'],
  },
  {
    name: 'PRO',
    tagline: 'For creators who want the full studio.',
    price: '$12',
    period: 'per month',
    cta: 'Go Pro',
    featured: true,
    features: ['Stickers', 'Music library', '1080p export', 'Cloud sync'],
  },
  {
    name: 'TEAMS',
    tagline: 'For studios and collaborators.',
    price: '$29',
    period: 'per month',
    cta: 'Contact sales',
    featured: false,
    features: ['Collaboration', 'Priority support', 'Unlimited projects'],
  },
];

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Pricing cards — Tailwind utilities for layout, legacy `.site-btn`
 * classes for the CTAs so they match the rest of the marketing site.
 */
export default function PricingCards({ onCta }) {
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-5 px-1 pt-2 md:grid-cols-3">
      {PLANS.map((plan, i) => (
        <Reveal
          as="article"
          key={plan.name}
          delay={0.06 + i * 0.09}
          className={
            plan.featured
              ? 'relative flex flex-col rounded-lg border border-solid border-accent/60 bg-panel-2 p-7 shadow-card'
              : 'relative flex flex-col rounded-lg border border-solid border-border bg-panel p-7'
          }
        >
          {plan.featured && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#0a0a0a]">
              Most popular
            </span>
          )}
          <h3 className="m-0 font-display text-xs font-bold uppercase tracking-[0.14em] text-muted">
            {plan.name}
          </h3>
          <p className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-4xl font-bold tracking-tight text-ink">{plan.price}</span>
            <span className="text-[13px] text-muted">/ {plan.period}</span>
          </p>
          <p className="mt-2 min-h-[40px] text-[13.5px] leading-relaxed text-muted">{plan.tagline}</p>
          <ul className="m-0 mt-4 flex flex-1 flex-col gap-2.5 border-t border-solid border-border p-0 pt-5">
            {plan.features.map((feature) => (
              <li key={feature} className="flex list-none items-center gap-2.5 text-[13.5px] text-ink">
                <span className={plan.featured ? 'text-accent' : 'text-mint'}>
                  <CheckIcon />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onCta}
            className={plan.featured ? 'site-btn solid mt-6 w-full' : 'site-btn ghost mt-6 w-full'}
          >
            {plan.cta}
          </button>
        </Reveal>
      ))}
    </div>
  );
}
