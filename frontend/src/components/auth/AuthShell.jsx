import { PlayRoundedIcon } from '../site/landing/icons.jsx';

// Shared shell for the Sign in / Sign up / password-reset pages — the same
// FlowStep design system the marketing site uses (scoped under .vcs in
// styles/landing.css): ambient orbs, grid fade and the site navbar.
export default function AuthShell({ onHome, actions, children }) {
  return (
    <div className="vcs auth-page">
      {/* ambient atmosphere (matches the marketing site) */}
      <div className="ambient" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>
      <div className="grid-fade" aria-hidden="true" />

      <header className="nav">
        <div className="nav-inner">
          <button type="button" className="brand" onClick={onHome} aria-label="VidioCut home">
            <span className="brand-mark" aria-hidden="true">
              <PlayRoundedIcon />
            </span>
            <span className="brand-text">
              <span className="brand-name">VidioCut</span>
              <span className="brand-tag">MOTION, REFINED.</span>
            </span>
          </button>
          <div className="nav-actions">{actions}</div>
        </div>
      </header>

      <main className="auth-main">{children}</main>
    </div>
  );
}