# Navigation Expanded Top Bar Plan
Last Updated: 2025-11-12

## Status Checklist
- [x] Requirements gathered from stakeholder (desktop/tablet expanded, mobile collapsed)
- [x] Audit current navigation implementation
- [x] Implement expanded layout for desktop/tablet
- [x] Retain dropdowns on desktop/tablet with hover and click
- [x] Add accessibility and keyboard support
- [ ] Responsive QA across breakpoints and polish

## Scope
- Keep dropdowns on desktop/tablet (hover or click to open).
- Only collapse into hamburger on mobile (< md).
- Ensure the navigation fills the top bar width with clear left (logo), center (nav), right (CTAs) alignment.

## Current State (before this refinement)
- Navigation component: [landing-page/src/components/layout/Navigation.tsx](landing-page/src/components/layout/Navigation.tsx)
  - Uses md breakpoint for expanded nav; md+ shows inline nav, mobile uses hamburger
  - Dropdowns implemented on desktop/tablet via hover [Navigation.tsx](landing-page/src/components/layout/Navigation.tsx:127)
  - Active state computed via location [Navigation.tsx](landing-page/src/components/layout/Navigation.tsx:67)
- Styles and tokens: [landing-page/src/index.css](landing-page/src/index.css)
  - nav-glass-enhanced, dropdown-enhanced, mobile-nav-enhanced, animations
- Tailwind screens configured: [landing-page/tailwind.config.js](landing-page/tailwind.config.js:5)
  - md: 768px, lg: 1024px, etc.
- App integration: [landing-page/src/App.tsx](landing-page/src/App.tsx:31)
  - Navigation receives items, logo, and cta

## Design Decisions
- Desktop/tablet (md and up): single persistent top bar with inline items and dropdowns for children.
- Mobile (below md): hamburger controls a panel; nested child items listed inside.
- Keep glass effect on scroll, smooth hover states, and primary/secondary CTAs.
- Support both hover and click to open dropdowns (for accessibility and touch-friendly desktop devices).
- Preserve anchor-based navigation behavior.

## Implementation Plan (Todo)
1) Layout and Alignment (Expanded Top Bar)
- [ ] In [Navigation.tsx](landing-page/src/components/layout/Navigation.tsx:96), change the center nav container to consume available width:
  - Use flex-1 on the nav items container and justify-center to truly center the items across the bar
  - Example: hidden md:flex flex-1 items-center justify-center space-x-4 md:space-x-6
- [ ] Keep logo aligned left and CTA group aligned right; ensure adequate spacing on md vs lg:
  - Left: logo block
  - Center: flex-1 navigation items
  - Right: CTA block (ProfessionalButton)

2) Dropdown Interaction (Desktop/Tablet)
- [x] Retain hover behavior to open dropdowns [Navigation.tsx](landing-page/src/components/layout/Navigation.tsx:159)
- [x] Add click-to-toggle on top-level items with children:
  - On md+: clicking a parent should toggle its dropdown (and close others)
  - Clicking outside or pressing Escape closes any open dropdown
  - Close dropdown on route change or anchor navigation
- [x] Ensure dropdown z-index layering and positioning work at various viewport widths
- [x] Keep animated underline and background hover, but ensure whitespace-nowrap on nav labels to prevent wrapping
  - Add whitespace-nowrap to top-level nav links

3) Accessibility and Keyboard Support
- [x] Add proper aria attributes:
  - Parent items with children: aria-haspopup="menu", aria-expanded state bound to open/closed
  - Dropdown container: role="menu", child links: role="menuitem"
- [x] Keyboard interactions:
  - Enter/Space on parent toggles dropdown
  - ArrowDown opens dropdown and moves focus to first item
  - Escape closes dropdown, returns focus to parent
  - Tab/Shift+Tab maintain expected focus traversal (no trap on desktop)
- [x] Provide visible focus styles for keyboard users on all interactive elements

4) Mobile Menu Enhancements
- [x] Keep existing md:hidden hamburger and nested rendering [Navigation.tsx](landing-page/src/components/layout/Navigation.tsx:229)
- [x] Ensure tapping a top-level item closes the menu and scrolls to anchor
- [x] Provide aria-controls and aria-expanded on the menu button

5) Spacing, Density, and Visual Polish
- [x] Adjust spacing tokens at md vs lg:
  - Reduce horizontal padding per item on md to avoid wrap; increase on lg for comfort
  - Use px-3 on md, px-4 on lg for top-level items [Navigation.tsx](landing-page/src/components/layout/Navigation.tsx:139)
- [x] Add whitespace-nowrap on labels; consider text-sm on md, text-base on lg if density is tight
- [x] Confirm nav height h-16 on mobile, h-18 on md+ [tailwind.config.js](landing-page/tailwind.config.js:80)
- [x] Maintain nav-glass-enhanced on scroll [index.css](landing-page/src/index.css:462)

6) State Management and Cleanup
- [x] Add outside click listener to close any open dropdown on desktop/tablet
- [x] Reset open dropdown on navigation or hash change
- [x] Ensure passive scroll listener or throttle if needed; current simple useEffect is acceptable

7) Analytics Hooks (Optional)
- [ ] Add data attributes to CTA buttons and nav item clicks for analytics later (e.g., data-analytics="nav-cta-download")

## Acceptance Criteria
- On md and larger:
  - [x] Navigation is inline across the top bar with logo left, centered nav items, CTAs right
  - [x] Dropdowns open via hover and click; keyboard interactions work; aria metadata correct
- On mobile (< md):
  - [x] Hamburger visible; menu panel lists child items; tapping items closes menu
  - [x] Smooth active styling for current section; underline and hover effects remain
  - [x] No layout wrapping at typical widths; labels remain readable
  - [ ] Lighthouse Accessibility score ≥ 90 on navigation-related checks

## QA Plan
- Viewports: 375, 414, 768, 834, 1024, 1280, 1440, 1920
- Test cases:
  - Hover parent item to open dropdown (md+)
  - Click parent to toggle dropdown (md+)
  - Keyboard navigation: Tab focus order, Enter/Space to open, ArrowDown, Escape to close
  - Mobile: open/close menu, nested items tap-through and close behavior
  - Anchor navigation: clicking navigates and updates active state [Navigation.tsx](landing-page/src/components/layout/Navigation.tsx:67)
- Accessibility tools: keyboard only pass, focus-visible, aria roles/expanded correct

## Relation to Full Redesign Plan
- Aligns with navigation clarity and IA goals in [landing-page-full-redesign-plan.md](.implementation_plan/features/landing-page-full-redesign-plan.md:1)
- Supports improved conversion by keeping primary CTAs consistently visible in header

## Notes/Risks
- If top-level count grows, consider reducing spacing or moving low-priority items under a "More" menu
- Consider debouncing outside-click listeners if performance issues arise
