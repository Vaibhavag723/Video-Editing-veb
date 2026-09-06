import Link from "next/link";
import Reveal from "./Reveal";
import { ArrowRightIcon } from "./icons";

const PILLS = [
  "Fast video editing",
  "Professional color tools",
  "Text & captions",
  "AI-powered tools",
  "Instant export",
];

export default function Hero() {
  return (
    <section className="hero">
      <Reveal className="badge" delay={0.05}>
        <span className="dot" />
        The faster way to make great videos
      </Reveal>

      <Reveal as="h1" className="headline" delay={0.12}>
        Create videos that <span className="hl-teal">keep</span>{" "}
        <span className="hl-purple">moving.</span>
      </Reveal>

      <Reveal as="p" className="subtext" delay={0.2}>
        Edit, enhance and export professional videos directly in your browser —
        no complicated software, no unnecessary installs.
      </Reveal>

      <Reveal className="cta-row" delay={0.28}>
        <Link href="/signup" className="btn-primary">
          Start Editing
          <ArrowRightIcon />
        </Link>
        <Link href="/editor" className="btn-ghost">
          Explore Templates
        </Link>
      </Reveal>

      <Reveal className="pill-row" delay={0.36}>
        {PILLS.map((label, i) => (
          <span key={label} style={{ display: "contents" }}>
            {i > 0 && <i className="pill-sep" />}
            <span className="pill">{label}</span>
          </span>
        ))}
      </Reveal>
    </section>
  );
}