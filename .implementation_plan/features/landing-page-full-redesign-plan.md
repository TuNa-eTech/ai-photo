# Landing Page Full Redesign Plan
**Last Updated:** 2025-11-12

## Status Checklist
- [x] Review memory bank and existing documentation
- [x] Audit current `landing-page` implementation and component inventory
- [x] Finalize information architecture & content mapping
- [x] Approve visual and interaction design system updates
- [ ] Complete implementation & refactor tasks across all sections
- [ ] Execute QA (accessibility, responsive, performance) and obtain sign-off

---

## 1. Background & Alignment
- The redesign must stay aligned with the product vision in [`ui-ux.md`](.documents/product/ui-ux.md) and leverage the content canon defined in [`landing-page-content-templates.md`](.implementation_plan/designs/landing-page-content-templates.md).
- Existing analysis in [`UI-UX-REFACTOR-ANALYSIS.md`](landing-page/UI-UX-REFACTOR-ANALYSIS.md) highlights current shortcomings (visual inconsistency, weak hierarchy, limited trust signals) and serves as the baseline critique.
- The landing site markets the iOS Liquid Glass experience and should reflect the beige glass design language already established for the app and admin materials.

## 2. Goals & Success Metrics
- Increase “Download the iOS App” primary CTA click-through by ≥30% compared to current baseline (tracked via analytics).
- Raise overall Lighthouse performance & accessibility scores to ≥90 on mobile and desktop.
- Reduce bounce rate on key hero scroll depth by ≥20%.
- Provide clear secondary journeys (demo, pricing, support) with visually distinct CTAs.

## 3. Target Audiences & Journeys
1. **New iOS prospects**: first-time visitors evaluating AI photo styling. Primary journey → hero → social proof → download.
2. **Potential premium subscribers**: need pricing clarity. Journey → pricing overview → feature comparison → upgrade CTA.
3. **Support-focused users**: find FAQ/contact quickly. Journey → footer/secondary nav → support resources.
4. **Investors/partners** (secondary): need credibility metrics, team vision.

## 4. Information Architecture & Content Plan
| Section | Purpose | Content Source | Component Action |
| --- | --- | --- | --- |
| Hero | Value prop + CTA | [`landing-page-content-templates.md`](.implementation_plan/designs/landing-page-content-templates.md) §1 | Refactor [`HeroSection.tsx`](landing-page/src/components/sections/HeroSection.tsx) with new layout, optional video/demo slot |
| Trust Indicators | App rating, download stats, logos | Same doc §1 + testimonials | Introduce new trust badge variants via [`TrustBadge.tsx`](landing-page/src/components/ui/TrustBadge.tsx) |
| Features | Key differentiators | Doc §1 “Features” | Simplify [`FeaturesSection.tsx`](landing-page/src/components/sections/FeaturesSection.tsx); ensure icons + copy from template |
| How It Works | 4-step walkthrough | Doc §1 “How It Works” | Rebuild (existing [`HowItWorksSection.tsx`](landing-page/src/components/sections/HowItWorksSection.tsx) needs modern timeline layout) |
| Showcase / Templates | Visual proof | Future live screenshots or static mock | Replace placeholder data in [`ShowcaseSection.tsx`](landing-page/src/components/sections/ShowcaseSection.tsx) with curated assets; add filter micro-interactions |
| Testimonials & Ratings | Social proof | Doc §1 “Testimonials” | Refresh cards in [`TestimonialsSection.tsx`](landing-page/src/components/sections/TestimonialsSection.tsx); integrate rating aggregate |
| Pricing & Plans | Communicate free vs premium | Doc §1 final CTA + §5 subscription | Replace legacy [`FinalCTASection.tsx`](landing-page/src/components/sections/FinalCTASection.tsx) with pricing layout using [`PricingTable.tsx`](landing-page/src/components/ui/PricingTable.tsx) |
| Footer | Navigation + support + legal | Doc §§8–9 + legal terms | Update [`Footer.tsx`](landing-page/src/components/layout/Footer.tsx) with accurate links/content |

## 5. Visual & Interaction Direction
- Honor the Liquid Glass beige palette defined in [`tailwind.config.js`](landing-page/tailwind.config.js) & [`index.css`](landing-page/src/index.css). Introduce subtle gradients and blur layers consistent with iOS app visuals.
- Use organic blob animations sparingly (hero, key highlight) with reduced-motion fallbacks (prefers-reduced-motion).
- Expand typography scale per Inter font usage; ensure responsive clamp() values align with doc references.
- Animation guidelines: micro-interactions <300ms, use Framer Motion for hero and CTA hover states if benefits justify cost.

## 6. Component Strategy
- **Reuse with adjustments**: [`Navigation.tsx`](landing-page/src/components/layout/Navigation.tsx), [`Button.tsx`](landing-page/src/components/ui/Button.tsx), [`ProfessionalButton.tsx`](landing-page/src/components/ui/ProfessionalButton.tsx) (update styling tokens).
- **Refactor**: sections noted above, convert magic numbers to token references, replace placeholder data structures with typed content models from [`types/ui.ts`](landing-page/src/types/ui.ts).
- **New components**:
  - Testimonial carousel / grid with avatar + before/after slider.
  - Trust metric strip (app rating, downloads, security badge).
  - FAQ accordion (optional stretch goal if time allows).
- Maintain Storybook-like documentation via mdx? (future). For now ensure each component exports typed props from [`ui/index.ts`](landing-page/src/components/ui/index.ts).

## 7. Implementation Workstreams & Tasks
### Phase A – Foundations
- [x] Update design tokens (spacing, gradients, glass shadow constants) in [`index.css`](landing-page/src/index.css).
- [x] Ensure Tailwind v4 utilities support new palette usage (adjust [`tailwind.config.js`](landing-page/tailwind.config.js) if needed).
- [x] Define typed content models (e.g., `HeroCopy`, `FeatureItem`) in [`types/ui.types.ts`](landing-page/src/types/ui.types.ts) to replace inline literals.

### Phase B – Core Sections
- [x] Rebuild hero layout with dual CTA + media slot (`HeroSection.tsx`).
- [x] Insert trust metrics component directly under hero using new badges.
- [x] Refresh features card grid with improved iconography and copy from template.
- [x] Rework showcase grid with real assets (placeholder fallback until CMS integration) and lightbox interaction.

### Phase C – Social Proof & Conversion
- [ ] Replace testimonial cards with richer layout (quotes + before/after).
- [ ] Implement pricing table using [`PricingTable.tsx`](landing-page/src/components/ui/PricingTable.tsx) across three tiers.
- [ ] Add final CTA band with gradient background and cross-platform links (iOS download + contact sales).

### Phase D – Footer & Support
- [ ] Update footer navigation links to match doc references (about, blog, careers, etc.).
- [ ] Add compliance/legal stubs referencing Terms, Privacy, Subscription pages (links to be implemented later).
- [ ] Ensure newsletter/contact mini form (if included) posts to placeholder handler with basic validation.

### Phase E – QA & Polish
- [ ] Responsive QA across breakpoints (`xs`→`3xl`).
- [ ] Accessibility audit (keyboard focus, aria labels for icons, color contrast).
- [ ] Performance tuning (image optimization, layout shift prevention, code-splitting if heavy animations).
- [ ] Analytics hooks ready (data-layer events for CTA clicks).

## 8. Content & Asset Requirements
- Request final copy approval from product/marketing on sections defined in [`landing-page-content-templates.md`](.implementation_plan/designs/landing-page-content-templates.md).
- Gather real template imagery or create curated mockups for showcase/testimonials.
- Confirm latest App Store badge assets and legal text once release is scheduled.

## 9. Accessibility & Performance Acceptance
- WCAG 2.1 AA contrast compliance; ensure focus-visible styles for all interactive elements.
- Provide alternative text for every decorative image (empty alt) and meaningful alt for template/showcase assets.
- Target CLS & LCP within Core Web Vitals thresholds; use lazy loading for below-the-fold imagery.

## 10. Testing & QA Plan
- Manual responsive matrix (iPhone SE, iPhone 15 Pro, iPad, 1440p desktop, ultra-wide).
- Lighthouse audits (mobile & desktop) with threshold ≥90 across categories.
- Accessibility checks via axe-core browser extension and keyboard navigation.
- Regression pass on navigation (smooth scroll anchors) and CTA analytics events.

## 11. Risks & Mitigation
- **Content finalization delays** → use placeholder copy from approved template doc; set review deadline.
- **Asset availability** → coordinate with design for export schedule; maintain fallback gradients.
- **Animation performance** → prefer CSS-based animations; gate Framer Motion usage; implement reduced-motion checks.
- **Scope creep (new pages)** → keep MVP to single-page marketing experience; document future expansions separately.

## 12. Approvals & Next Steps
- Share plan for stakeholder review (product/design) by 2025-11-14.
- Upon approval, begin Phase A/B implementation with weekly checkpoints.
- Update this document as tasks move to done; promote completed items to `.implementation_plan/completed/` once launched.
