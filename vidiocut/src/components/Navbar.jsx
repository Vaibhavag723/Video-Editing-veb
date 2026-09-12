import { PlayRoundedIcon } from './icons.jsx';

export default function Navbar() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="#">
          <span className="brand-mark" aria-hidden="true">
            <PlayRoundedIcon />
          </span>
          <span className="brand-text">
            <span className="brand-name">VidioCut</span>
            <span className="brand-tag">MOTION, REFINED.</span>
          </span>
        </a>
        <button className="btn-get" type="button">
          Get Started
        </button>
      </div>
    </header>
  );
}
