// VidioCut site footer — the FlowStep bar: tagline left, copyright right.
// On small screens (≤920px) a row of page links appears above the bar since
// the navbar links are hidden there. `note` carries the signed-in hint.
const LINKS = [
  ['home', 'Home'],
  ['features', 'Features'],
  ['how-it-works', 'How it works'],
  ['pricing', 'Pricing'],
  ['about', 'About'],
  ['blog', 'Blog'],
  ['faq', 'FAQ'],
  ['ask', 'Ask'],
];

export default function Footer({ onNavigate, note = '' }) {
  const year = new Date().getFullYear();
  const go = (page) => () => typeof onNavigate === 'function' && onNavigate(page);

  return (
    <footer className="foot">
      <nav className="foot-links" aria-label="Footer pages">
        {LINKS.map(([key, label]) => (
          <button key={key} type="button" onClick={go(key)}>{label}</button>
        ))}
      </nav>
      <div className="foot-left">Trusted by creators moving the internet forward.</div>
      <div className="foot-right">
        © {year} VidioCut · Made for motion{note ? ` · ${note}` : ''}
      </div>
    </footer>
  );
}
