import { useEffect, useState } from 'react';
import { getSitePages, getSitePosts } from '../api';
import FaqPage from './site/FaqPage';
import PricingPage from './site/PricingPage';
import AskPage from './site/AskPage';
import Footer from './Footer';
import Reveal from './site/landing/Reveal.jsx';
import EditorMock from './site/landing/EditorMock.jsx';
import { PlayRoundedIcon, ArrowRightIcon, ScissorsIcon, MusicIcon, TypeIcon, SparklesIcon, ZapIcon } from './site/landing/icons.jsx';

const NAV = [
  ['home', 'Home'],
  ['features', 'Features'],
  ['how-it-works', 'How it works'],
  ['pricing', 'Pricing'],
  ['about', 'About'],
  ['blog', 'Blog'],
  ['faq', 'FAQ'],
  ['ask', 'Ask'],
];

const PILLS = [
  'Fast video editing',
  'Professional color tools',
  'Text & captions',
  'AI-powered tools',
  'Instant export',
];

const TOOL_CATEGORIES = [
  {
    tone: 'default', icon: <ScissorsIcon />, badge: 'CORE TOOLS',
    title: 'Video Editing', text: 'Make every frame feel intentional.',
    tags: ['Trim', 'Cut', 'Split', 'Merge', 'Crop', 'Resize', 'Rotate', 'Speed control', 'Reverse', 'Freeze frame'],
  },
  {
    tone: 'default', icon: <MusicIcon />,
    title: 'Audio', text: 'Give your story a voice.',
    tags: ['Upload music', 'Trim', 'Volume', 'Fade in/out', 'Voiceover', 'Noise reduction', 'Waveform'],
  },
  {
    tone: 'default', icon: <TypeIcon />,
    title: 'Text', text: 'Make your message impossible to miss.',
    tags: ['Text overlays', 'Animated text', 'Fonts', 'Colors', 'Shadows', 'Captions', 'Subtitles', 'Auto captions'],
  },
  {
    tone: 'default', icon: <SparklesIcon />,
    title: 'Visual Effects', text: 'Shape the mood of every scene.',
    tags: ['Filters', 'Color grading', 'Blur', 'Transitions', 'Stickers', 'Shapes', 'Animations'],
  },
  {
    tone: 'highlight', icon: <ZapIcon />,
    title: 'AI Features', text: 'Skip the busywork. Keep the creativity.',
    tags: ['AI auto captions', 'Background removal', 'Silence removal', 'Highlight detection', 'AI resize', 'Scene detection', 'Video enhancement'],
  },
];

/* FlowStep "everything you need to create" tools grid, matching the
   VidioCut Studio reference design's 5-category feature section. */
function FeatureCards({ onStart }) {
  return (
    <section className="tools-section">
      <Reveal className="tools-eyebrow" delay={0.05}>
        <SparklesIcon /> EVERYTHING YOU NEED TO CREATE
      </Reveal>
      <Reveal as="h2" className="tools-heading" delay={0.1}>
        Powerful tools for videos <span className="muted">that keep moving.</span>
      </Reveal>
      <Reveal as="p" className="tools-sub" delay={0.15}>
        From quick cuts to polished campaigns, VidioCut gives you a fast, focused workspace
        for every part of your creative process.
      </Reveal>

      <div className="tools-grid">
        {TOOL_CATEGORIES.map((cat, i) => (
          <Reveal as="article" key={cat.title} className={`tool-card ${cat.tone}`} delay={0.05 + i * 0.08}>
            <div className="tool-card-head">
              <span className="tool-icon">{cat.icon}</span>
              {cat.badge && <span className="tool-badge">{cat.badge}</span>}
            </div>
            <h3>{cat.title}</h3>
            <p>{cat.text}</p>
            <div className="tool-tags">
              {cat.tags.map((tag) => <span key={tag} className="tool-tag">{tag}</span>)}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="tools-cta" delay={0.1}>
        <span className="tools-cta-icon"><ZapIcon /></span>
        <div className="tools-cta-text">
          <b>Ready to make something move?</b>
          <span>Start creating for free. No credit card required.</span>
        </div>
        <button type="button" className="btn-primary" onClick={onStart}>
          Start Editing <ArrowRightIcon />
        </button>
      </Reveal>
    </section>
  );
}

/* FlowStep hero — badge, gradient headline, CTAs, feature pills */
function Hero({ onStart, onExplore }) {
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
        <button type="button" className="btn-primary" onClick={onStart}>
          Start Editing
          <ArrowRightIcon />
        </button>
        <button type="button" className="btn-ghost" onClick={onExplore}>
          Explore Templates
        </button>
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

/* FlowStep feature cards */
function FeatureCards() {
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


export default function Site({ user, onLogin, onSignUp, onOpenEditor, onOpenAdmin, onLogout, onLogoutEverywhere, onBack, canGoBack }) {
  const [page, setPage] = useState('home');
  const [pages, setPages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([getSitePages(), getSitePosts()])
      .then(([p, b]) => { if (alive) { setPages(p); setPosts(b); } })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const getPage = (key) => pages.find((p) => p.key === key) || { key, title: key, hero: '', body: '' };
  const labels = Object.fromEntries(NAV);

  if (loading) return <div className="site-loading"><span className="spinner">&nbsp;</span><p>Loading VidioCut…</p></div>;

  const startCta = () => (user ? onOpenEditor() : onSignUp());

  return (
    <div className="vcs">
      {/* ambient atmosphere */}
      <div className="ambient" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>
      <div className="grid-fade" aria-hidden="true" />

      <header className="nav">
        <div className="nav-inner">
          <button type="button" className="brand" onClick={() => setPage('home')} aria-label="VidioCut home">
            <span className="brand-mark" aria-hidden="true">
              <PlayRoundedIcon />
            </span>
            <span className="brand-text">
              <span className="brand-name">VidioCut</span>
              <span className="brand-tag">MOTION, REFINED.</span>
            </span>
          </button>
          <nav className="nav-links" aria-label="Site pages">
            {NAV.map(([key, label]) => (
              <button key={key} type="button" className={page === key ? 'active' : ''} onClick={() => setPage(key)}>
                {label}
              </button>
            ))}
          </nav>
          <div className="nav-actions">
            {canGoBack && (
              <button type="button" className="btn-back site-top-back" onClick={onBack} aria-label="Back" title="Back">←</button>
            )}
            {user ? (
              <>
                <span className="site-user">Hi, {user.name}</span>
                <button type="button" className="btn-get primary" onClick={onOpenEditor}>Open editor</button>
                {user.isAdmin && <button type="button" className="site-btn mini" onClick={onOpenAdmin}>Admin</button>}
                <button type="button" className="site-btn ghost" onClick={onLogout}>Log out</button>
                {onLogoutEverywhere && (
                  <button type="button" className="site-btn ghost" onClick={onLogoutEverywhere} title="Sign out of every browser and device">Sign out all</button>
                )}
              </>
            ) : (
              <>
                <button type="button" className="site-btn ghost" onClick={onLogin}>Sign in</button>
                <button type="button" className="btn-get primary" onClick={onSignUp}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {page === 'home' ? (
          <>
            <Hero onStart={startCta} onExplore={() => setPage('features')} />
            <EditorMock />
            <FeatureCards onStart={startCta} />
          </>
        ) : page === 'blog' ? (
          <section className="site-page">
            <div className="site-hero">
              <p className="site-eyebrow">Blog</p>
              <h1>Stories in motion</h1>
              <p className="site-sub">Tips, updates and stories from the VidioCut team.</p>
            </div>
            {!open && <div className="post-grid">
              {posts.length === 0 && <p className="site-muted">No posts published yet.</p>}
              {posts.map((post) => (
                <button key={post.id} type="button" className="post-card" onClick={() => setOpen(post)}>
                  {post.image && <img src={post.image} alt="" />}
                  <b>{post.title}</b>
                  <p>{post.excerpt || post.content}</p>
                </button>
              ))}
            </div>}
            {open && (
              <article className="post-read">
                <button type="button" className="site-btn ghost" onClick={() => setOpen(null)}>← Back to blog</button>
                <h1>{open.title}</h1>
                {open.image && <img src={open.image} alt="" />}
                <p className="site-post-date">{new Date(open.created_at).toLocaleDateString()}</p>
                <p style={{ whiteSpace: 'pre-wrap' }}>{open.content}</p>
              </article>
            )}
          </section>
        ) : page === 'faq' ? (
          <FaqPage />
        ) : page === 'pricing' ? (
          <PricingPage onSelectPlan={() => startCta()} />
        ) : page === 'ask' ? (
          <AskPage user={user} />
        ) : (
          <section className="site-page">
            <div className="site-hero">
              <p className="site-eyebrow">{labels[page]}</p>
              <h1>{getPage(page).hero || getPage(page).title}</h1>
              {getPage(page).body.includes('✦') ? null : <p className="site-sub">{getPage(page).body}</p>}
              <div className="site-cta">
                <button type="button" className="site-btn solid" onClick={startCta}>Start editing →</button>
                {!user && <button type="button" className="site-btn ghost" onClick={onSignUp}>Create account</button>}
              </div>
            </div>
            {getPage(page).body.includes('✦') && (
              <div className="site-bullets">
                {renderBullets(getPage(page).body).map((b, i) => <span key={i} className="site-bullet">{b}</span>)}
              </div>
            )}
            {page === 'features' && <FeatureCards onStart={startCta} />}
          </section>
        )}
      </main>

      <Footer onNavigate={setPage} note={user ? `Signed in as ${user.email}` : ''} />
    </div>
  );
}

function renderBullets(body) {
  return String(body || '')
    .split(/\u2726/)
    .map((s) => s.trim())
    .filter(Boolean);
}