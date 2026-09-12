import { useState } from 'react';
import FAQS from '../../data/faq';

// Public FAQ page — an accordion built from the faq.js data file.
export default function FaqPage() {
  const [open, setOpen] = useState(0);

  return (
    <section className="site-page faq-page">
      <div className="site-hero">
        <p className="site-eyebrow">FAQ</p>
        <h1>Frequently asked questions</h1>
        <p className="site-sub">Quick answers to the things people ask us most. Can't find what you need?</p>
      </div>
      <div className="faq-list">
        {FAQS.map((item, i) => (
          <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
            <button
              type="button"
              className="faq-q"
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
            >
              <span>{item.q}</span>
              <span className="faq-chevron" aria-hidden="true">⌄</span>
            </button>
            {open === i && <div className="faq-a">{item.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}