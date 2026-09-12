import Link from "next/link";
import { PlayRoundedIcon } from "./icons";

export default function Navbar() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/" aria-label="VidioCut home">
          <span className="brand-mark" aria-hidden="true">
            <PlayRoundedIcon />
          </span>
          <span className="brand-text">
            <span className="brand-name">VidioCut</span>
            <span className="brand-tag">MOTION, REFINED.</span>
          </span>
        </Link>
        <Link className="btn-get" href="/signup">
          Get Started
        </Link>
      </div>
    </header>
  );
}