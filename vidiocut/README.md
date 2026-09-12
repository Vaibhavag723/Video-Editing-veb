# VidioCut — Landing Page (React + Vite)

Ultra-premium dark-mode SaaS landing page for **VidioCut**, a browser-based AI video editor.
React 19 + Vite, plain CSS — no UI libraries, fully self-contained.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build -> dist/
npm run preview  # serve the production build
```

## Structure

```
vidiocut/
├── index.html               # Vite entry (fonts, meta, favicon)
├── package.json
├── vite.config.js           # port 3000 (mirrors ../frontend)
└── src/
    ├── main.jsx             # React root
    ├── App.jsx              # page composition + ambient background
    ├── index.css            # global tokens + all component styles
    └── components/
        ├── Navbar.jsx       # green play logo, wordmark/tagline, Get Started
        ├── Hero.jsx         # badge, headline, CTAs, feature pills
        ├── EditorWindow.jsx # "VidioCut Studio / campaign-04" mock (tilt + live opacity slider)
        ├── Features.jsx     # 3 feature cards (green/blue/purple)
        ├── Footer.jsx
        ├── Reveal.jsx       # IntersectionObserver scroll-reveal wrapper
        └── icons.jsx        # inline SVG icon set
```

## Interactions

- Staggered scroll reveals (IntersectionObserver, respects `prefers-reduced-motion`)
- Subtle 3D pointer tilt on the editor window (fine-pointer devices only)
- Live opacity slider (controlled React state) in the PROPERTIES panel
