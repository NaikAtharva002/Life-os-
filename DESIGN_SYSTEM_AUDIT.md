# LIFE OS — DESIGN SYSTEM AUDIT & ARCHITECTURAL INVENTORY (v2.0)

**Date**: November 23, 2026  
**Auditor**: Principal Design Systems Architect & Senior Product Designer  
**Repository**: [https://github.com/NaikAtharva002/Life-os-](https://github.com/NaikAtharva002/Life-os-)  
**Branch**: `feature/atharva-foundation`  
**Application**: LIFE OS — Personal Operating System  

---

## 1. Executive Summary

This audit establishes the baseline for **LIFE OS Design System 2.0**. LIFE OS is a local-first personal operating system uniting 13 operational modules (Tasks, Goals, Habits, Finance, Gym & Fitness, Academics, Career & Work, Analytics, AI Copilot, Obsidian Notes, Focus Sanctuary, Evening Review, Settings). 

While the recent visual upgrade established an authentic 5-color brand palette (**Brick Ember** `#B80C09`, **Dark Walnut** `#6B2B06`, **Alabaster Grey** `#E5E7E6`, **Silver** `#B7B5B3`, **Pitch Black** `#141301`) and eliminated generic purple AI slop, the codebase exhibits significant design token fragmentation:
- **Font Size Fragmentation**: 25+ distinct font sizes (including arbitrary fractions like `8.5px`, `10.5px`, `11.5px`, `12.5px`, `13.5px`).
- **Border Radius Inconsistencies**: 22+ arbitrary radii (`2px`, `3px`, `4px`, `6px`, `8px`, `10px`, `12px`, `14px`, `16px`, `20px`, `24px`, `30px`, `40px`) used indiscriminately across sibling components.
- **Color Bleed**: Over 18 legacy hex values (Tailwind grays, hardcoded whites, old slate blues) persist in inline style attributes.
- **Breakpoints**: Only a single hardcoded `@media (max-width: 768px)` rule exists, lacking standard mobile (`390px`), tablet (`768px`), laptop (`1024px`/`1280px`), and desktop (`1440px+`) responsive tokens.
- **Component Duplication**: Buttons, inputs, modals, and tables lack unified UI component primitives, resulting in repetitive inline style props across 16 page files.

---

## 2. Package & Dependency Analysis

| Package | Version | Classification | Design System Role |
|---|---|---|---|
| `react` / `react-dom` | `^19.3.1` | Core Framework | Component composition & modern rendering |
| `lucide-react` | `^1.76.0` | UI Icons | Sole iconography system (stroke weight 1.75-2px) |
| `dexie` | `^4.4.7` | Local DB | IndexedDB persistence for theme & settings |
| `zustand` | `^5.1.0` | State Management | Real-time theme & variant state store |
| `date-fns` | `^4.4.0` | Utilities | Calendar, timestamp, and schedule calculations |
| `canvas-confetti` | `^1.9.4` | Feedback | Streak and milestone celebrations |
| `playwright` | `^1.65.1` | Automated Testing | Multi-viewport visual regression verification |
| `typescript` | `~7.0.2` | Tooling | Strict type verification |
| `vite` | `^8.3.6` | Bundler | HMR & production build pipeline |

*Verdict*: The dependency graph is lean, modern, and sufficient. No extra UI component libraries are required. We will build a native, high-performance design system component kit directly on top of CSS tokens and React.

---

## 3. Official Brand Palette & Color Audit

### 3.1 The 5 Foundation Colors
The product's identity is defined exclusively by:

1. **Brick Ember (`#B80C09`)**: Primary interactive color, focus outlines, high-priority status badges, active indicators.
2. **Dark Walnut (`#6B2B06`)**: Secondary accents, elevated dark cards, warm neutral borders.
3. **Alabaster Grey (`#E5E7E6`)**: Canvas foundation in Light Mode, crisp high-contrast text in Dark Mode.
4. **Silver (`#B7B5B3`)**: Secondary text, borders, dividers, subtle chrome.
5. **Pitch Black (`#141301`)**: Canvas foundation in Dark Mode, crisp high-contrast text in Light Mode.

### 3.2 Audit of Color Inconsistencies
A repository-wide search revealed:
- `160+` occurrences of `#B80C09` in components.
- `26` occurrences of hardcoded `#ffffff` / `#FFFFFF` (must be tokenized to `var(--color-text-on-accent)` or `var(--color-surface-elevated)`).
- `60+` occurrences of Tailwind gray hex codes (`#d1d5db`, `#9ca3af`, `#cbd5e1`, `#e5e7eb`, `#f3f4f6`, `#6b7280`).
- Legacy blue/purple traces (`#60a5fa`, `#3b82f6`, `#6366f1`, `#818cf8`) and emerald greens (`#10b981`, `#34d399`) that bypass semantic tokens.

*Action*: Replace all arbitrary hex codes with centralized semantic tokens (`--color-*`).

---

## 4. Typography Scale & Hierarchy Audit

### 4.1 Fonts Loaded
- **UI Sans**: `'Plus Jakarta Sans', -apple-system, sans-serif` (All core UI, labels, navigation, buttons).
- **Tabular & Code**: `'JetBrains Mono', monospace` (All metrics, timers, currencies, percentages, codes).
- **Editorial Accent**: `'Newsreader', Georgia, serif` (Editorial hero quotes, morning greetings).

### 4.2 Fragmented Font Sizes Identified
Currently in use across `.tsx` files:
`8px`, `8.5px`, `9px`, `9.5px`, `10px`, `10.5px`, `11px`, `11.5px`, `12px`, `12.5px`, `13px`, `13.5px`, `14px`, `15px`, `16px`, `17px`, `18px`, `20px`, `22px`, `24px`, `26px`, `32px`, `36px`, `38px`, `96px`.

### 4.3 Standard Modular Typography Scale (To Implement)

| Token | Size | Line Height | Weight | Letter Spacing | Primary Use Case |
|---|---|---|---|---|---|
| `--font-display` | `32px` | `1.2` | 700 / 500 (serif) | `-0.02em` | Editorial greeting, Hero title |
| `--font-heading-page` | `24px` | `1.25` | 700 | `-0.015em` | Page header titles |
| `--font-heading-section`| `18px` | `1.3` | 700 | `-0.01em` | Major module section headers |
| `--font-heading-sub` | `15px` | `1.35` | 600 | `-0.005em` | Card titles, modal headers |
| `--font-body-large` | `14px` | `1.5` | 400 / 500 | `0` | Primary content, descriptions |
| `--font-body-regular` | `13px` | `1.5` | 400 / 500 | `0` | Standard UI text, list items |
| `--font-body-small` | `12px` | `1.45` | 400 / 500 | `0` | Secondary metadata, helper text |
| `--font-caption` | `11px` | `1.4` | 500 / 600 | `0.02em` | Subtitles, timestamps |
| `--font-label` | `10.5px`| `1.3` | 700 | `0.06em` | Uppercase category pills, tags |
| `--font-numeric-hero` | `28px` | `1.1` | 700 (mono) | `-0.03em` | Timer display, main KPI metric |
| `--font-numeric-stat` | `20px` | `1.2` | 700 (mono) | `-0.02em` | Card metrics, balance values |

---

## 5. Spacing, Layout & Rhythm Audit

### 5.1 Current Deficiencies
- Gaps and paddings vary arbitrarily: `3px`, `5px`, `7px`, `10px`, `11px`, `13px`, `14px`, `18px`, `22px`, `26px`, `28px`.
- Page container max-width is set to `1440px` with hardcoded inline paddings (`24px 32px`).

### 5.2 8-Point Standard Spacing Scale (To Implement)
- `--space-1`: `4px` (Micro gaps, tight icon offsets)
- `--space-2`: `8px` (Standard intra-component gap, button inner padding-x)
- `--space-3`: `12px` (Card row item padding, compact list gaps)
- `--space-4`: `16px` (Standard container padding, form field gaps)
- `--space-5`: `20px` (Card inner padding, section headers)
- `--space-6`: `24px` (Island container padding, major column gutters)
- `--space-8`: `32px` (Major section spacing, desktop page gutters)
- `--space-10`: `40px` (Hero offsets, empty state vertical breathing room)
- `--space-12`: `48px` (Page boundary gutters)
- `--space-16`: `64px` (Major layout structural offsets)

---

## 6. Border Radius & Shape Geometry Audit

### 6.1 Current Fragmentation
Currently 22 distinct radii are in use (`10px` on 30 elements, `8px` on 24, `6px` on 19, `4px` on 19, `14px` on 14, `12px` on 8, etc.).

### 6.2 Standard Radius Scale (To Implement)
- `--radius-xs`: `4px` (Micro badges, tags, scrollbars)
- `--radius-sm`: `8px` (Buttons, form inputs, triage rows, status chips)
- `--radius-md`: `12px` (Inner cards, stat modules, table containers)
- `--radius-lg`: `16px` (Major islands, hero cards, dialog modals)
- `--radius-xl`: `24px` (Floating drawers, hero sections)
- `--radius-pill`: `9999px` (Pill tabs, circular avatars, round badges)

---

## 7. Component Inventory & Standardization Strategy

| Component Category | Existing State | Action | Standardization Plan |
|---|---|---|---|
| **Buttons** (`.btn`) | Basic classes exist, but inline styles override colors and padding across pages | Refactor | Standardize variants: `primary`, `secondary`, `tertiary`, `ghost`, `danger`, `icon-only`. Add `loading` and `disabled` states. |
| **Inputs & Forms** | Global `input, select, textarea` styled, but lacks consistent search/number/toggle primitives | Refactor | Create unified input wrappers, focus rings (`0 0 0 3px var(--accent-subtle)`), error states, and toggle switches. |
| **Cards & Surfaces** | `.card`, `.editorial-island`, `.photo-tile` | Standardize | Ensure consistent borders, backgrounds (`--bg-surface`, `--bg-elevated`), and elevation hierarchy. |
| **Badges & Tags** | Fragmented `.badge`, inline pills | Unify | Provide semantic variants: `badge-brick`, `badge-walnut`, `badge-silver`, `badge-success`, `badge-warning`. |
| **Modals & Drawers** | Separate modal overlays in each component | Standardize | Standardize backdrop blur (`4px`), shadow (`--shadow-lg`), and escape key handling. |
| **Tables** | Global styles exist, but cells differ | Standardize | Clean tabular headers, hover states, and monospace numbers. |
| **Status / Priority** | Inline colored text | Componentize | Unify `PriorityBadge` and `StatusIndicator` components across Tasks, Goals, Academics, Career. |
| **Showcase Gallery** | None | Create | Add a dedicated developer-only Design System Gallery component to preview and test every token and primitive. |

---

## 8. Light & Dark Mode Architectural Audit

### Current Behavior
- Theme is switched via `document.documentElement.setAttribute('data-theme', theme)`.
- Persisted in IndexedDB `settings.theme`.
- Dark Mode uses `#141301` foundation with `#281D14` elevated walnut surfaces.
- Light Mode uses `#E5E7E6` alabaster foundation with `#FFFFFF` elevated surfaces.

### Issues to Resolve
1. Scrim contrast in Light Mode on photographic cards must prevent white text clipping.
2. Inverted text colors must strictly honor semantic tokens (`--text-primary`, `--text-secondary`, `--text-muted`).
3. Ensure zero unmapped background flashes during route changes.

---

## 9. Responsive Breakpoints

Standardized Responsive Tokens:
- **Mobile**: `max-width: 640px` (Single column, collapsed drawer, full-width inputs).
- **Tablet**: `max-width: 1024px` (2-column grids, compact sidebar, adjusted hero height).
- **Laptop**: `1025px - 1440px` (Default 3-column layouts, full navigation).
- **Desktop**: `> 1440px` (Max-width container centered at 1440px with generous margins).

---

## 10. Audit Conclusion & Next Steps

1. **Step 2**: Reorganize `src/index.css` into a clean **3-Tier Token Architecture** (Primitives → Semantics → Components).
2. **Step 3**: Build a reusable, zero-dependency UI component kit (`Button`, `Input`, `Badge`, `Card`, `Modal`, `Toggle`, `Tabs`, `Table`).
3. **Step 4**: Standardize and refactor modules across the app to reference the new tokens and components.
4. **Step 5**: Build a Developer Design System Gallery view (`/design-system` or developer modal).
5. **Step 6**: Generate full design system documentation in `docs/DESIGN_SYSTEM.md`.
6. **Step 7**: Verify build, run multi-viewport Playwright regression tests, commit, and push.
