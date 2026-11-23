# LIFE OS — DESIGN SYSTEM & BRAND IDENTITY SPECIFICATION 2.0

**Status**: Active Production Standard  
**Version**: 2.0.0  
**Maintainer**: Principal Design Systems Architect & Senior Product Designer  
**Scope**: All 13 LIFE OS modules, shared components, developer tools, and future additions.

---

## 1. Brand Identity & Vision

LIFE OS is a personal operating system that unifies daily productivity, strategic long-term goals, financial velocity, progressive overload fitness, academic safety, career architecture, and AI assistance.

### Design Principles
1. **Human-Centered Purpose**: Software designed for real daily execution, not a generic SaaS admin dashboard.
2. **Anti-AI-Slop Discipline**: Zero gratuitous purple-to-blue gradients, zero fluorescent ambient halos, zero frosted glass overuse.
3. **Tactile Craft & Tabular Precision**: Financial, temporal, and numeric data is rendered with monospace tabular figures (`JetBrains Mono` with `tnum` and `cv05` features) for vertical alignment.
4. **Spatial Restraint**: Empty space is luxury. Components are grouped into coherent "islands of context" with predictable gutters.
5. **Local-First & Multi-Tech Sovereignty**: 100% offline-capable, local-first with IndexedDB (Dexie.js), backed by SQLite and the Python AI engine.

---

## 2. Official 5-Color Brand Palette

The brand identity is governed strictly by five core colors. No unauthorized primary accents (cyan, neon violet, royal blue, magenta) are permitted.

| Color Name | HEX | CSS Token | Core Product Role |
|---|---|---|---|
| **Brick Ember** | `#B80C09` | `--raw-brick` / `--palette-brick` | Primary interactive buttons, key progress emphasis, active tab indicators, critical status alerts. |
| **Dark Walnut** | `#6B2B06` | `--raw-walnut` / `--palette-walnut` | Secondary accents, elevated dark cards, warm neutral borders, supporting visual depth. |
| **Alabaster Grey** | `#E5E7E6` | `--raw-alabaster` / `--palette-alabaster` | Main light-mode canvas, light surfaces, dark text contrast in Dark Mode. |
| **Silver** | `#B7B5B3` | `--raw-silver` / `--palette-silver` | Secondary typography, subtle chrome, table dividers, muted UI chrome. |
| **Pitch Black** | `#141301` | `--raw-pitch` / `--palette-pitch` | Dark-mode canvas foundation, main dark typography contrast in Light Mode. |

### Semantic Color Derivatives

| Functional Role | Color Name | Light Mode Token | Dark Mode Token | HEX / Alpha |
|---|---|---|---|---|
| **Success** | Forest Olive / Sage | `--status-success` | `--status-success` | `#4E632D` (L) / `#8BA85D` (D) |
| **Warning** | Warm Amber / Ochre | `--status-warning` | `--status-warning` | `#8F5419` (L) / `#C78235` (D) |
| **Danger / Error** | Brick Ember | `--status-danger` | `--status-danger` | `#B80C09` (L) / `#D12A27` (D) |
| **Information** | Dark Walnut | `--status-info` | `--status-info` | `#6B2B06` (L) / `#B56832` (D) |

---

## 3. Three-Tier Token Architecture

Design tokens are organized into three strict tiers:

```
Tier 1: Primitives  ──>  Tier 2: Semantics  ──>  Tier 3: Components
(--raw-brick, etc.)       (--bg-surface, etc.)    (--btn-primary-bg, etc.)
```

### 3.1 Primitive Tokens
Primitives hold raw values independent of theme or context:
- `--raw-brick: #B80C09;`
- `--raw-walnut: #6B2B06;`
- `--raw-alabaster: #E5E7E6;`
- `--raw-silver: #B7B5B3;`
- `--raw-pitch: #141301;`
- `--space-1` through `--space-16` (4px to 64px)
- `--radius-xs` through `--radius-xl` (4px to 24px)
- `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);`

### 3.2 Semantic Tokens (Theme-Aware)
Semantic tokens adapt based on `data-theme="light"` or `data-theme="dark"`:

```css
/* Light Mode */
--bg-main: var(--raw-alabaster);
--bg-surface: #F3F5F4;
--bg-elevated: #FFFFFF;
--text-primary: var(--raw-pitch);
--text-secondary: #4A4640;
--border-default: rgba(20, 19, 1, 0.14);
--accent-primary: var(--raw-brick);

/* Dark Mode */
--bg-main: var(--raw-pitch);
--bg-surface: #1C1710;
--bg-elevated: #281D14;
--text-primary: var(--raw-alabaster);
--text-secondary: var(--raw-silver);
--border-default: rgba(229, 231, 230, 0.14);
--accent-primary: var(--raw-brick-light);
```

### 3.3 Component Tokens
Components consume semantic tokens directly. No component may hardcode hex or rgb values in inline styles.

---

## 4. Typography System

### Font Families
- **UI Sans**: `'Plus Jakarta Sans', -apple-system, sans-serif` (Default interface, navigation, form inputs).
- **Tabular / Monospace**: `'JetBrains Mono', monospace` (All numbers, countdowns, timestamps, currency, keyboard shortcuts).
- **Editorial Serif**: `'Newsreader', Georgia, serif` (Editorial quotes, morning greetings).

### Modular Type Scale

| Level | Size | Weight | Line Height | Tracking | Class | Usage |
|---|---|---|---|---|---|---|
| **Display** | `32px` | 700 / 500 (serif) | `1.2` | `-0.02em` | `.text-display` | Dashboard greeting |
| **Page Heading** | `24px` | 700 | `1.25` | `-0.015em` | `.text-heading-page` | View header titles |
| **Section Heading** | `18px` | 700 | `1.3` | `-0.01em` | `.text-heading-section`| Island headers, Question titles |
| **Subheading** | `15px` | 600 | `1.35` | `-0.005em`| `.text-heading-sub` | Card titles, modal headers |
| **Body Large** | `14px` | 400 / 500 | `1.5` | `0` | `.text-body-lg` | Primary descriptions |
| **Body Regular** | `13px` | 400 / 500 | `1.5` | `0` | `.text-body` | Standard list items, labels |
| **Body Small** | `12px` | 400 / 500 | `1.45` | `0` | `.text-body-sm` | Secondary metadata |
| **Caption** | `11px` | 500 / 600 | `1.4` | `0.02em` | `.text-caption` | Timestamps, status subtitles |
| **Label** | `10px` | 700 | `1.3` | `0.05em` | `.text-label` | Uppercase eyebrow pills |
| **Numeric KPI** | `24px` / `28px` | 700 (mono) | `1.1` | `-0.03em` | `.tabular` | Cadence %, balances, timers |

---

## 5. Spacing & 8-Point Layout Grid

Every margin, padding, and gap must adhere to the 8-point scale:

- `--space-1`: `4px` (Tight icon offsets, micro gaps)
- `--space-2`: `8px` (Standard inter-element gap, button padding-x)
- `--space-3`: `12px` (Card item padding, compact list gaps)
- `--space-4`: `16px` (Standard container padding, form field gaps)
- `--space-5`: `20px` (Card inner padding, section headers)
- `--space-6`: `24px` (Island container padding, major column gutters)
- `--space-8`: `32px` (Major section spacing, desktop page gutters)
- `--space-10`: `40px` (Hero offsets, empty state vertical breathing room)
- `--space-12`: `48px` (Page boundary gutters)
- `--space-16`: `64px` (Major structural layout offsets)

---

## 6. Border Radius Scale

Mismatched corner radii are strictly prohibited. Every visual container maps to:

- `--radius-xs`: `4px` (Micro badges, tags, scrollbars)
- `--radius-sm`: `8px` (Buttons, form inputs, triage rows, status chips)
- `--radius-md`: `12px` (Inner cards, stat modules, table containers)
- `--radius-lg`: `16px` (Major islands, hero cards, dialog modals)
- `--radius-xl`: `24px` (Floating drawers, hero sections)
- `--radius-pill`: `9999px` (Pill tabs, circular avatars, round badges)

---

## 7. Component Library & Standards

The centralized component kit lives in `src/components/ui/` with zero external runtime dependencies.

### 7.1 Button (`<Button />`)
- **Variants**: `primary`, `secondary`, `tertiary`, `ghost`, `danger`
- **Sizes**: `sm` (24px height), `md` (32px height), `lg` (40px height)
- **Props**: `icon`, `iconPosition`, `loading`, `disabled`, `fullWidth`
- **Focus**: `outline: 2px solid var(--accent-primary); outline-offset: 2px;`

### 7.2 Badge (`<Badge />`)
- **Variants**: `brick`, `walnut`, `silver`, `success`, `warning`, `danger`, `neutral`
- **Props**: `size` (`sm` | `md`), `dot` (boolean indicator)

### 7.3 Card (`<Card />`)
- **Variants**: `default`, `elevated`, `interactive`, `island`
- **Props**: `selected` (boolean active ring)

### 7.4 Input & Select (`<Input />`, `<Select />`)
- **Props**: `label`, `helperText`, `error`, `leftIcon`, `rightIcon`
- **Focus Ring**: `box-shadow: 0 0 0 3px var(--accent-subtle);`

### 7.5 Toggle (`<Toggle />`)
- Accessible switch with label and description slots.

### 7.6 ProgressBar (`<ProgressBar />`)
- **Variants**: `brick`, `walnut`, `success`, `warning`
- **Props**: `value` (0-100), `size` (`sm` | `md` | `lg`), `label`, `showPercentage`

### 7.7 Modal (`<Modal />`)
- Built-in backdrop click, escape listener, focus containment, and header/footer slots.

### 7.8 EmptyState (`<EmptyState />`)
- Standardized placeholder with icon circle, title, description, and action CTA button.

---

## 8. Iconography Standards

1. **Family**: `lucide-react` exclusively.
2. **Stroke Weight**: Default `1.75px` or `2px`. Never use hairline `1px` or extra-heavy `3px` except for micro-checks.
3. **Standard Sizes**:
   - Small inline / button icon: `12px`–`14px`
   - Section / Toolbar icon: `16px`
   - Hero / Tile header icon: `20px`–`24px`
   - Empty state illustration icon: `32px`–`44px`
4. **No Emoji as UI Controls**: Emojis are reserved for celebratory feedback (e.g. confetti, streak flames) and must never replace functional interface icons.

---

## 9. Responsive Breakpoints

| Breakpoint | Range | Behavioral Transformation |
|---|---|---|
| **Mobile** | `≤ 640px` | Sidebar transitions into off-canvas mobile drawer; workspace padding scales to `14px`; single-column grid; full-width inputs. |
| **Tablet** | `641px - 1024px` | 2-column grids; compact sidebar option; adjusted hero card heights. |
| **Laptop / Desktop** | `1025px - 1440px` | Standard 3-column layout; permanent sidebar; max-width 1440px centered container. |
| **Ultra-Wide** | `> 1440px` | Centered layout with generous margin gutters. |

---

## 10. Developer Component Showcase

A private, developer-only component gallery is integrated directly into the application:
- **Route**: `design-system`
- **Command Palette Shortcut**: Press `⌘K` or `Ctrl+K` and select **`Developer: Design System Showcase`** (`G DS`).
- **Settings Access**: Settings → Section 5 (Developer Tools) → **`Open Design System Component Gallery`**.
