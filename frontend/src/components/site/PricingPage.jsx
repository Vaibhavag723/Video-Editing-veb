import { useState } from 'react';

// Pricing tiers, copied from the VidioCut Studio reference design. This app
// has no real billing/payment integration, so every plan's CTA just routes
// into sign-up/the editor like the rest of the site — the numbers here are
// informational, not wired to an actual subscription.
const PLANS = [
  {
    key: 'free', name: 'Free', price: 0, cadence: '/ free forever',
    blurb: 'For quick trims and everyday edits.',
    features: ['Trim', 'Cut', 'Color', 'Text', '720p export'],
    cta: 'Start editing',
  },
  {
    key: 'pro', name: 'Pro', price: 12, cadence: '/ per month', popular: true,
    blurb: 'For creators who want the full studio.',
    features: ['Stickers', 'Music library', '1080p export', 'Cloud sync'],
    cta: 'Go Pro',
  },
  {
    key: 'teams', name: 'Teams', price: 29, cadence: '/ per month',
    blurb: 'For studios and collaborators.',
    features: ['Collaboration', 'Priority support', 'Unlimited projects'],
    cta: 'Contact sales',
  },
];

export default function PricingPage({ onSelectPlan }) {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="site-page pricing-page">
      <div className="site-hero">
        <p className="site-eyebrow">Simple pricing for every creator</p>
        <h1>Choose a plan that keeps <span className="hl-teal">moving.</span></h1>
        <p className="site-sub">
          Everything you need to create polished, professional videos in your browser.
          Upgrade when your creativity takes off.
        </p>
      </div>

      <div className="pricing-toggle">
        <span className={yearly ? '' : 'active'}>Monthly</span>
        <button type="button" role="switch" aria-checked={yearly} className={`toggle-switch${yearly ? ' on' : ''}`} onClick={() => setYearly((y) => !y)}>
          <span className="toggle-knob" />
        </button>
        <span className={yearly ? 'active' : ''}>Yearly</span>
        <span className="pricing-save">Save 20% annually</span>
      </div>

      <div className="pricing-grid">
        {PLANS.map((plan) => {
          const price = yearly && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price;
          return (
            <article key={plan.key} className={`pricing-card${plan.popular ? ' popular' : ''}`}>
              {plan.popular && <span className="pricing-badge">MOST POPULAR</span>}
              <p className="pricing-tier-label">{plan.name.toUpperCase()}</p>
              <p className="pricing-amount"><b>${price}</b><span>{plan.cadence}</span></p>
              <p className="pricing-blurb">{plan.blurb}</p>
              <ul className="pricing-features">
                {plan.features.map((f) => <li key={f}><span className="pricing-check">✓</span>{f}</li>)}
              </ul>
              <button
                type="button"
                className={plan.popular ? 'site-btn solid' : 'site-btn ghost'}
                onClick={() => onSelectPlan?.(plan.key)}
              >
                {plan.cta}
              </button>
            </article>
          );
        })}
      </div>

      <p className="pricing-footnote">All plans include secure cloud storage, automatic updates, and cancel-anytime billing.</p>
    </section>
  );
}
