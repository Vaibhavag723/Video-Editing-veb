/**
 * PostCSS pipeline for the Vite frontend — mirrors veltra/postcss.config.mjs.
 * Tailwind reads tailwind.config.js; autoprefixer keeps the vendor prefixes
 * (e.g. `-webkit-backdrop-filter`) in sync with the target browsers.
 *
 * @type {import('postcss-load-config').Config}
 */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
