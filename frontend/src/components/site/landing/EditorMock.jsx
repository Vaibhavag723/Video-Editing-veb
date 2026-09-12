import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import {
  CursorIcon,
  ScissorsIcon,
  TypeIcon,
  SparklesIcon,
  ShapesIcon,
  ImageIcon,
  MusicIcon,
  SlidersIcon,
  FilmIcon,
  ResetIcon,
  PlaySolidIcon,
  PlayRoundedIcon,
  SkipBackIcon,
  SkipFwdIcon,
} from './icons.jsx';

const RULER_MARKS = ['00:00', '00:05', '00:10', '00:15', '00:20'];

const TRACKS = [
  {
    label: 'V2',
    clips: [
      { name: 'Intro', color: 'purple', left: '4%', width: '26%' },
      { name: 'Titles', color: 'purple', left: '58%', width: '17%', selected: true },
    ],
  },
  {
    label: 'V1',
    clips: [
      { name: 'B-Roll', color: 'blue', left: '10%', width: '44%' },
      { name: 'Outro', color: 'blue', left: '57%', width: '35%' },
    ],
  },
  {
    label: 'A1',
    clips: [{ name: 'Voiceover', color: 'teal', left: '10%', width: '78%' }],
  },
];

const SWATCHES = [
  'linear-gradient(135deg,#e7e7ec,#b9b9c2)',
  'linear-gradient(135deg,#f0b46f,#c97b3d)',
  'linear-gradient(135deg,#7fb2ff,#3b6fe0)',
  'linear-gradient(135deg,#c084fc,#7c3aed)',
  'linear-gradient(135deg,#00f0c8,#ff8a5c)',
];

const ANIMATIONS = ['Fade In', 'Slide Up', 'Zoom Out'];

/** Subtle 3D tilt following the pointer (fine pointers, motion allowed only). */
function usePointerTilt(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = null;

    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.transform = `rotateX(${cy.toFixed(3)}deg) rotateY(${cx.toFixed(3)}deg)`;
      if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) raf = requestAnimationFrame(loop);
      else raf = null;
    };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / r.width;
      const py = (e.clientY - (r.top + r.height / 2)) / r.height;
      tx = Math.max(-1, Math.min(1, px)) * 3.2;
      ty = Math.max(-1, Math.min(1, py)) * -2.4;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

export default function EditorWindow() {
  const tiltRef = useRef(null);
  const [opacity, setOpacity] = useState(100);
  usePointerTilt(tiltRef);

  return (
    <section className="stage">
      <Reveal variant="reveal-scale" className="window-wrap" delay={0.15}>
        <div className="window-glow" aria-hidden="true" />
        <div className="window-tilt" ref={tiltRef}>
          <div className="window-float">
            <div className="window" role="img" aria-label="VidioCut Studio — video editor interface preview">
              <div className="win-bar">
                <span className="win-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <div className="win-title">
                  <b>VidioCut Studio</b>
                  <em>/</em>
                  <span className="fname">
                    <FilmIcon />
                    campaign-04
                  </span>
                </div>
                <div className="win-actions">
                  <span className="avatars" aria-hidden="true">
                    <i className="av-a">M</i>
                    <i className="av-b">K</i>
                  </span>
                  <button className="btn-export" type="button">
                    Export
                  </button>
                </div>
              </div>

              <div className="win-body">
                <div className="rail" aria-hidden="true">
                  <span className="tool active"><CursorIcon /></span>
                  <span className="tool"><ScissorsIcon /></span>
                  <span className="tool"><TypeIcon /></span>
                  <span className="tool"><SparklesIcon /></span>
                  <span className="tool"><ShapesIcon /></span>
                  <span className="tool"><ImageIcon /></span>
                  <span className="tool"><MusicIcon /></span>
                  <span className="tool gear"><SlidersIcon /></span>
                </div>
                <div className="viewport">
                  <div className="canvas">
                    <span className="chip chip-tl">
                      <i className="rec" />
                      00:00:12:04
                    </span>
                    <span className="chip chip-tr">1920 × 1080 · 24 FPS</span>
                    <span className="chip chip-bl">Night_Drive_04.mp4</span>
                    <button className="play-btn" type="button" aria-label="Play preview">
                      <PlaySolidIcon />
                    </button>
                  </div>
                </div>

                <aside className="props">
                  <div className="props-head">
                    <h3>PROPERTIES</h3>
                    <ResetIcon />
                  </div>

                  <div className="pgroup">
                    <div className="prow">
                      <label>Position</label>
                    </div>
                    <div className="xy">
                      <div className="field">
                        <span className="k">X</span>
                        <span className="v">128</span>
                      </div>
                      <div className="field">
                        <span className="k">Y</span>
                        <span className="v">96</span>
                      </div>
                    </div>
                  </div>

                  <div className="pgroup">
                    <div className="prow">
                      <label>Opacity</label>
                      <span className="val">{opacity}%</span>
                    </div>
                    <input
                      className="slider"
                      type="range"
                      min="0"
                      max="100"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(90deg,#00f0c8,#a855f7 ${opacity}%,rgba(255,255,255,.12) ${opacity}%)`,
                      }}
                      aria-label="Opacity"
                    />
                  </div>

                  <div className="pgroup">
                    <div className="prow">
                      <label>Color grade</label>
                    </div>
                    <div className="swatches">
                      {SWATCHES.map((bg, i) => (
                        <i
                          key={bg}
                          className={`swatch${i === SWATCHES.length - 1 ? ' active' : ''}`}
                          style={{ background: bg }}
                        />
                      ))}
                    </div>
                    <div className="lut-note">
                      LUT · <b>Neo Noir</b>
                    </div>
                  </div>

                  <div className="pgroup">
                    <div className="prow">
                      <label>Animation</label>
                    </div>
                    <div className="anim-list">
                      {ANIMATIONS.map((name, i) => (
                        <div key={name} className={`anim-opt${i === 0 ? ' active' : ''}`}>
                          <span>{name}</span>
                          <i className="radio" />
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>

                <div className="timeline">
                  <div className="tl-tools">
                    <span className="tl-btn">
                      <SkipBackIcon />
                    </span>
                    <span className="tl-btn play">
                      <PlayRoundedIcon />
                    </span>
                    <span className="tl-btn">
                      <SkipFwdIcon />
                    </span>
                    <span className="tc">00:00:12:04</span>
                    <div className="tl-right">
                      <span className="zoom">
                        <i />
                        <b />
                      </span>
                      <span className="mini-chip">Fit</span>
                    </div>
                  </div>

                  <div className="tl-area">
                    <div className="ruler">
                      {RULER_MARKS.map((mark, i) => (
                        <span key={mark} style={{ left: `${i * 25}%` }}>
                          {mark}
                        </span>
                      ))}
                    </div>
                    {TRACKS.map((track) => (
                      <div className="track" key={track.label}>
                        <span className="tlabel">{track.label}</span>
                        <div className="lane">
                          {track.clips.map((clip) => (
                            <div
                              key={clip.name}
                              className={`clip ${clip.color}${clip.selected ? ' selected' : ''}`}
                              style={{ left: clip.left, width: clip.width }}
                            >
                              <span>{clip.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="playhead" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

