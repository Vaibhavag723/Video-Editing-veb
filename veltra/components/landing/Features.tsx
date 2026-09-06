import Reveal from "./Reveal";
import { CloudIcon, LinkIcon, ZapIcon } from "./icons";

const FEATURES = [
  {
    tone: "green",
    icon: <ZapIcon />,
    title: "Built for momentum",
    text: "Every tool feels instant.",
  },
  {
    tone: "blue",
    icon: <LinkIcon />,
    title: "Power without clutter",
    text: "Pro-grade controls, simplified.",
  },
  {
    tone: "purple",
    icon: <CloudIcon />,
    title: "Your studio, anywhere",
    text: "Projects sync in the cloud.",
  },
];

export default function Features() {
  return (
    <section className="features">
      <div className="feat-grid">
        {FEATURES.map((feature, i) => (
          <Reveal
            as="article"
            key={feature.title}
            className={`feat ${feature.tone}`}
            delay={0.05 + i * 0.1}
          >
            <span className="icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}