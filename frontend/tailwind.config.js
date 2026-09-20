/**
 * Tailwind is layered *on top of* the hand-written design system that already
 * ships in this app (src/index.css, src/styles/pro.css, src/styles/editor.css,
 * src/styles/landing.css).
 *
 * How the two coexist
 * -------------------
 * 1. Every existing stylesheet is wrapped in `@layer components`, so all of the
 *    current class names still work exactly as before **and** any Tailwind
 *    utility written in the JSX wins over them without `!important`.
 * 2. The tokens below mirror the CSS custom properties that already drive the
 *    UI — `:root --c-*` in styles/pro.css and `.vcs --*` in styles/landing.css —
 *    so `bg-panel`, `text-accent`, `border-border`, `rounded-sm`, `z-chat`, …
 *    speak the same language as the existing stylesheets.
 * 3. `preflight` is OFF on purpose: the document reset is owned by pro.css and
 *    switching preflight on would restyle the marketing site, admin and editor.
 *    To make Tailwind the source of truth for base styles: set
 *    `preflight: true`, delete the duplicated resets at the top of pro.css and
 *    add `*, ::before, ::after { border-style: solid; border-width: 0 }` (the
 *    bit of preflight that `border-*` / `divide-*` utilities rely on).
 * 4. Keyframes are deliberately NOT redefined here — the `animation` utilities
 *    below reference the `@keyframes` that already live in the stylesheets
 *    (fade-up, ed-rise-in, chatIn, vcs-playhead-sweep, …), so there is exactly
 *    one definition of each. Delays: use arbitrary values, e.g.
 *    `[animation-delay:120ms]`.
 * 5. `borderRadius` / `transitionDuration` intentionally remap a few of
 *    Tailwind's defaults onto this app's design tokens (14px radius, 160ms
 *    ease). `md`, `xl`, `2xl` keep Tailwind's stock values.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // mirrors styles/pro.css `:root` (--c-*)
        bg: '#0a0a0a',
        'bg-2': '#0e0e12',
        panel: '#131318',
        'panel-2': '#1a1a20',
        border: '#232329',
        'border-2': '#2c2c34',
        ink: '#f5f5f7',
        muted: '#9a9aa6',
        link: '#4c8dff',
        ok: '#18c96a',
        bad: '#ff5f60',
        accent: {
          DEFAULT: '#00f0c8', // --c-accent
          2: '#4c8dff', // --c-accent2
          soft: '#8af5e0', // --c-accent-soft
        },
        // mirrors styles/landing.css `.vcs` (--teal / --purple / --green).
        // Named `grape`/`mint` on purpose so Tailwind's own `purple-*` and
        // `green-*` palettes stay intact.
        grape: '#a855f7',
        mint: '#30e087',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '8px', // --radius-sm
        DEFAULT: '14px', // --radius
        lg: '20px', // --radius-lg
        pill: '999px', // --radius-pill
      },
      boxShadow: {
        card: 'var(--shadow)',
      },
      zIndex: {
        chrome: '30',
        chat: '1200',
      },
      screens: {
        xs: '620px', // editor.css: smallest breakpoint
        editor: '1100px', // editor.css: 3-column → compact
      },
      transitionDuration: {
        DEFAULT: '160ms', // --t
      },
      transitionTimingFunction: {
        DEFAULT: 'ease', // --t
      },
      animation: {
        // component entrance/motion already defined in the stylesheets
        'fade-up': 'fade-up .45s ease both',
        'fade-down': 'fade-down .5s ease both',
        'scale-in': 'scale-in .5s ease both',
        'slide-up': 'slide-up .3s ease both',
        'slide-in-right': 'slide-in-right .3s ease both',
        'rise-in': 'ed-rise-in .36s cubic-bezier(.22, 1, .36, 1) backwards',
        'pop-in': 'ed-pop-in .34s cubic-bezier(.22, 1, .36, 1) backwards',
        'bubble-in': 'bubbleIn .2s ease-out',
        'chat-in': 'chatIn .22s ease-out',
        'chat-dot': 'chatDot 1s ease-in-out infinite',
        'blink-caret': 'blink-caret .9s step-end infinite',
        'pulse-soft': 'pulse-soft 3.2s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        drift: 'drift 38s ease-in-out infinite alternate',
        float: 'float 9s ease-in-out infinite',
        ring: 'ring 2.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};
