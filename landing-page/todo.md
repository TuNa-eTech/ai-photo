# AI Photo Studio — Landing Page TODO (Execution Plan)

Status: Ready to implement
Owner: Frontend
Last updated: 2025-11-13

Inputs (confirmed)
- Brand: AI Photo Studio — Tagline: Create. Style. Share.
- Audience: Social users (cinematic/anime). Primary conversions: iOS app download, starter credits purchase.
- Theme: Liquid Glass Beige — Colors: Primary #4A3F35, Base #F5E6D3, Surface #F4E4C1, Accent #E8D5D0, Emphasis #7C3AED; Fonts: Sora (heading), Inter (body)
- Language: Bilingual en + vi (default en) with language switcher in header
- Sections: Hero, Features/Benefits, Social Proof, Testimonials, Pricing, FAQ, Contact/Lead form, Final CTA, Footer
- Pricing (USD): Starter $5, Pro $12, Studio $25 — Yearly: -20% (paid upfront) — Toggle default Monthly
- Form: Formspree (https://formspree.io/f/abcd1234), with reCAPTCHA v3 (site key: 6LcX...mySiteKey)
- Analytics: GA4 ID G-AB12CD34EF, cookie banner ON (load GA only after consent)
- Deployment: Vercel — Canonical domain https://aiphoto.studio
- App Store: https://apps.apple.com/app/id1234567890
- OG image: https://cdn.aiphoto.studio/og/hero-1200x630.jpg
- Logo: Temporary text logo

Acceptance
- Lighthouse: >=90 (Performance, Accessibility, Best Practices, SEO)
- WCAG AA contrast, keyboard navigation, semantic HTML, aria
- Dark mode toggle (persist in localStorage) and respects prefers-color-scheme
- i18n ready with react-i18next (en default, vi secondary)

Checklist (in order)

1) Scaffold project (Vite + React + Yarn)
- [ ] Create project structure under landing-page
  - [package.json](landing-page/package.json)
  - [vite.config.js](landing-page/vite.config.js)
  - [index.html](landing-page/index.html)
  - [tailwind.config.js](landing-page/tailwind.config.js)
  - [postcss.config.js](landing-page/postcss.config.js)
  - [.eslintrc.json](landing-page/.eslintrc.json)
  - [.prettierrc.json](landing-page/.prettierrc.json)
  - [.prettierignore](landing-page/.prettierignore)
  - [.gitignore](landing-page/.gitignore)
  - [public/site.webmanifest](landing-page/public/site.webmanifest)
  - [src/main.jsx](landing-page/src/main.jsx)
  - [src/App.jsx](landing-page/src/App.jsx)
  - [src/styles/tailwind.css](landing-page/src/styles/tailwind.css)
  - [src/utils/gtag.js](landing-page/src/utils/gtag.js)
  - [src/utils/recaptcha.js](landing-page/src/utils/recaptcha.js)
  - [src/hooks/useDarkMode.js](landing-page/src/hooks/useDarkMode.js)
  - [src/hooks/useCookieConsent.js](landing-page/src/hooks/useCookieConsent.js)
  - [src/components/Header.jsx](landing-page/src/components/Header.jsx)
  - [src/components/Footer.jsx](landing-page/src/components/Footer.jsx)
  - [src/components/LanguageSwitcher.jsx](landing-page/src/components/LanguageSwitcher.jsx)
  - [src/components/ThemeToggle.jsx](landing-page/src/components/ThemeToggle.jsx)
  - [src/components/CookieBanner.jsx](landing-page/src/components/CookieBanner.jsx)
  - [src/sections/Hero.jsx](landing-page/src/sections/Hero.jsx)
  - [src/sections/Features.jsx](landing-page/src/sections/Features.jsx)
  - [src/sections/SocialProof.jsx](landing-page/src/sections/SocialProof.jsx)
  - [src/sections/Testimonials.jsx](landing-page/src/sections/Testimonials.jsx)
  - [src/sections/Pricing.jsx](landing-page/src/sections/Pricing.jsx)
  - [src/sections/FAQ.jsx](landing-page/src/sections/FAQ.jsx)
  - [src/sections/Contact.jsx](landing-page/src/sections/Contact.jsx)
  - [src/sections/FinalCTA.jsx](landing-page/src/sections/FinalCTA.jsx)
  - [src/i18n/index.js](landing-page/src/i18n/index.js)
  - [src/i18n/locales/en/common.json](landing-page/src/i18n/locales/en/common.json)
  - [src/i18n/locales/vi/common.json](landing-page/src/i18n/locales/vi/common.json)
  - [tests/Header.test.jsx](landing-page/tests/Header.test.jsx)
  - [tests/Form.test.jsx](landing-page/tests/Form.test.jsx)

2) Dependencies and tooling
- [ ] Add Tailwind CSS, PostCSS, Autoprefixer
- [ ] Add ESLint (React 19), Prettier, prettier-plugin-tailwindcss
- [ ] Add Vitest, @testing-library/react, @testing-library/user-event, jsdom
- [ ] Add Framer Motion for subtle animations
- [ ] Add react-i18next, i18next, i18next-browser-languagedetector

3) Tailwind configuration (brand + dark mode)
- [ ] Configure [tailwind.config.js](landing-page/tailwind.config.js) with:
  - darkMode: 'class'
  - content globs for src and index.html
  - container center + padding
  - screens: md 768, lg 1024, xl 1280, 2xl 1536
  - theme.extend.colors: brand tokens
  - fontFamily: Sora, Inter
- [ ] Create [src/styles/tailwind.css](landing-page/src/styles/tailwind.css) with base/components/utilities and CSS vars for themes (optional)

4) Index HTML and SEO
- [ ] Add Google Fonts (Sora, Inter) with preconnect
- [ ] Add SEO meta:
  - Title (en default), meta description (en)
  - Canonical: https://aiphoto.studio
  - OG/Twitter: title, description, url, image (https://cdn.aiphoto.studio/og/hero-1200x630.jpg), type=website, card=summary_large_image
  - theme-color: light #F5E6D3, dark #0B0E0F
  - lang handling (update via i18n on mount)
- [ ] Add web manifest link [public/site.webmanifest](landing-page/public/site.webmanifest)
- [ ] Add App Store smart banner meta (optional) and basic favicon references (can use generated set later)

5) Global app shell
- [ ] Implement [src/main.jsx](landing-page/src/main.jsx): React root, i18n init, Theme and Consent providers, import tailwind.css
- [ ] Implement [src/App.jsx](landing-page/src/App.jsx): assemble sections in order, lazy-load Testimonials and FAQ

6) Header (sticky, accessible)
- [ ] [src/components/Header.jsx](landing-page/src/components/Header.jsx): 
  - Text logo placeholder
  - Navigation links (Features, Pricing, FAQ)
  - Primary CTA: Download iOS → https://apps.apple.com/app/id1234567890
  - Secondary CTA (optional in nav or Hero): Start with 2 free credits
  - Language switcher (react-i18next) — persist selection in localStorage
  - Dark mode toggle — persist in localStorage, respects prefers-color-scheme
  - Mobile menu button (aria-expanded, aria-controls), focus management, ESC to close

7) Cookie banner and GA4
- [ ] [src/hooks/useCookieConsent.js](landing-page/src/hooks/useCookieConsent.js): manage consent state in localStorage (ttl 365 days)
- [ ] [src/components/CookieBanner.jsx](landing-page/src/components/CookieBanner.jsx): accessible banner, Accept/Reject buttons
- [ ] [src/utils/gtag.js](landing-page/src/utils/gtag.js): load GA only when:
  - env VITE_GA_MEASUREMENT_ID present AND consent=accepted
- [ ] Ensure no GA network calls before consent

8) Hero section
- [ ] [src/sections/Hero.jsx](landing-page/src/sections/Hero.jsx): 
  - Headline (en): Cinematic photos in one tap
  - Subheadline (en): Turn portraits into cinematic or anime styles in seconds. Fast, private, social-ready.
  - CTAs: Download on iOS (primary), Start with 2 free credits (secondary)
  - Hero imagery (Unsplash before/after):
    - Before: https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=80
    - After: https://images.unsplash.com/photo-1519400197429-404ae1a1e184?auto=format&fit=crop&w=1600&q=80
  - Lazy-load secondary image, use fetchpriority on primary, add alt text, sizes

9) Content sections
- [ ] Features grid (3–6 items) — concise copy, icons, subtle motion
- [ ] Social Proof — 4 logos row (Vercel, Unsplash, Netlify, GitHub) — alt text, reduced opacity
- [ ] Testimonials — 2–3 cards — lazy loaded via React.lazy
- [ ] Pricing — 3 plans: Starter $5, Pro $12, Studio $25; monthly/yearly toggle with -20% yearly; emphasize Starter for onboarding
- [ ] FAQ — accessible accordion (button + aria-expanded + aria-controls)
- [ ] Final CTA — reiterate primary CTA to iOS app
- [ ] Footer — legal links (Privacy, Terms), small nav, language links duplication if needed

10) Contact/Lead form (Formspree + reCAPTCHA v3)
- [ ] [src/utils/recaptcha.js](landing-page/src/utils/recaptcha.js): helper to load and execute v3
- [ ] [src/sections/Contact.jsx](landing-page/src/sections/Contact.jsx): 
  - Inputs: name, email, message (all validated client-side)
  - On submit: get reCAPTCHA token then POST to Formspree endpoint https://formspree.io/f/abcd1234
  - Show success and error messages with accessible alerts and focus management
  - Disable submit while pending

11) i18n content
- [ ] Initialize [src/i18n/index.js](landing-page/src/i18n/index.js) with react-i18next and language detector (localStorage)
- [ ] Provide [src/i18n/locales/en/common.json](landing-page/src/i18n/locales/en/common.json) and [src/i18n/locales/vi/common.json](landing-page/src/i18n/locales/vi/common.json):
  - Keys: nav, hero, features, socialProof, testimonials, pricing, faq, contact, footer, cta, form, cookie, theme
- [ ] Ensure dynamic html lang updates on language change

12) Accessibility and performance
- [ ] Use semantic HTML landmarks (header, main, section, footer)
- [ ] Keyboard: trap focus in mobile menu, ESC closes, focus-visible rings
- [ ] Alt text for images; high contrast tokens; test against WCAG AA
- [ ] Lazy-load heavy sections; min bundle; no render-blocking scripts
- [ ] Preconnect fonts; display=swap; limit font weights to used set

13) Tests (Vitest + RTL)
- [ ] [tests/Header.test.jsx](landing-page/tests/Header.test.jsx): opens/closes mobile menu via click and keyboard (Enter/Space, ESC), focus returns correctly
- [ ] [tests/Form.test.jsx](landing-page/tests/Form.test.jsx): client validation errors; successful submit path (mock fetch); error path; reCAPTCHA token mocked

14) Environment variables (.env.example)
- [ ] Create .env example values:
  - VITE_GA_MEASUREMENT_ID=G-AB12CD34EF
  - VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/abcd1234
  - VITE_RECAPTCHA_SITE_KEY=6LcX...mySiteKey
  - VITE_DEFAULT_LOCALE=en
  - VITE_CANONICAL_URL=https://aiphoto.studio
  - VITE_APP_STORE_URL=https://apps.apple.com/app/id1234567890
  - VITE_OG_IMAGE_URL=https://cdn.aiphoto.studio/og/hero-1200x630.jpg

15) Build scripts (Yarn)
- [ ] Add scripts in [package.json](landing-page/package.json):
  - dev: vite
  - build: vite build
  - preview: vite preview
  - lint: eslint src --ext .js,.jsx
  - format: prettier --write .
  - test: vitest run
  - test:ui: vitest

16) Deployment (Vercel)
- [ ] Ensure build outputs to dist
- [ ] Set env vars in Vercel
- [ ] Configure domain aiphoto.studio and set canonical to https://aiphoto.studio
- [ ] Verify caching headers (static assets) and compression defaults
- [ ] Post-deploy Lighthouse audit; fix regressions if any

Notes
- Brand color updates: edit palette in [tailwind.config.js](landing-page/tailwind.config.js), then yarn dev/build
- Replace temporary text logo with SVG/PNG when available
- Future: Add PWA icon set and standalone manifest if desired

Yarn commands (when running locally)
- yarn dev — start dev server
- yarn build — production build (dist/)
- yarn preview — preview production build
- yarn test — run unit tests
- yarn lint — run lint rules

End of TODO