import Reveal from './Reveal.jsx';
import { ArrowRightIcon } from './icons.jsx';

const PILLS = [
  'Fast video editing',
  'Professional color tools',
  'Text & captions',
  'AI-powered tools',
  'Instant export',
];

export default function Hero() {
  return (
    <section className="hero">
      <Reveal className="badge" delay={0.05}>
        <span className="dot" />
        The faster way to make great videos
      </Reveal>

      <Reveal as="h1" className="headline" delay={0.12}>
        Create videos that <span className="hl-teal">keep</span>{' '}
        <span className="hl-purple">moving.</span>
      </Reveal>

      <Reveal as="p" className="subtext" delay={0.2}>
        Edit, enhance and export professional videos directly in your browser — no
        complicated software, no unnecessary installs.
      </Reveal>

      <Reveal className="cta-row" delay={0.28}>
        <a href="#" className="btn-primary">
          Start Editing
          <ArrowRightIcon />
        </a>
        <a href="#" className="btn-ghost">
          Explore Templates
        </a>
      </Reveal>

      <Reveal className="pill-row" delay={0.36}>
        {PILLS.map((label, i) => (
          <span key={label} style={{ display: 'contents' }}>
            {i > 0 && <i className="pill-sep" />}
            <span className="pill">{label}</span>
          </span>
        ))}
      </Reveal>
    </section>
  );
}
