# LIFE OS 3.0 — Phase 0 Findings & Audit Report

**Date**: 2026-11-24  
**Branch**: `feature/atharva-foundation`  
**Base Tag**: `v2.4-multistack`  
**Canonical V1 Fixture**: `tests/fixtures/v1-backup.json` (55,457 bytes, 24 tables)

---

## 1. Executive Summary

Phase 0 established the safety net, tooling baseline, and migration fixtures for LIFE OS 3.0. During this phase, all 8 previously uninspected pages (`FinancePage`, `FitnessPage`, `CareerPage`, `AcademicsPage`, `AnalyticsPage`, `ObsidianPage`, `EveningReviewPage`, and `ReviewHistoryPage`) were audited in full.

### Core Discoveries & Cross-Cutting Architectural Defects:
1. **UTC Date Boundary Bugs (`toISOString().split('T')[0]`)**:
   - ESLint AST analysis identified **53 occurrences** across components, store, and pages.
   - In timezones like India (`UTC+05:30`), any action performed between midnight (00:00) and 05:30 AM records the previous calendar day in UTC, causing tasks, habit streaks, attendance, and reviews to register on the wrong date.
2. **Missing Deletion Confirmations & Undo Capabilities**:
   - In all 8 pages (`deleteTransaction`, `deleteSavingsGoal`, `deleteWorkoutSession`, `deleteBodyMetric`, `deleteJobApplication`, `deleteSubject`, `deleteAssignment`, `deleteExam`, `deleteTimetableSlot`, `deleteNote`), clicking the trash icon triggers instant, irreversible deletion from IndexedDB with no confirmation dialog and no rollback toast.
3. **Synthetic / Fabricated Metric Fallbacks**:
   - `AnalyticsPage` fabricates fallback completion values when the user has no records: Task completion defaults to `80%`, habit adherence defaults to `85%`, and goal progress defaults to `60%`.
   - `EveningReviewPage` calculates productivity score as `100%` when 0 tasks and 0 habits exist (`taskRatio = 1`, `habitRatio = 1`).
   - These masks deceive first-time users and violate the core LIFE OS principle: **Zero fake/sample data on fresh install**.
4. **Number Formatting & Currency Drift**:
   - `FinancePage` formats currencies as `${currency}${amt.toFixed(2)}` or standard `.toLocaleString()`. It lacks Indian numbering system formatting (`Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`) where numbers are grouped as `₹1,00,000` instead of `₹100,000`.
5. **CSS Variable & Token Inconsistencies**:
   - Across `CareerPage`, `AcademicsPage`, `ObsidianPage`, and `ReviewHistoryPage`, legacy variables like `var(--border)`, `var(--bg-card)`, `var(--bg-secondary)`, `var(--danger)`, and `var(--warning)` are used instead of the canonical design system tokens (`var(--border-default)`, `var(--bg-surface)`, `var(--bg-subtle)`, `var(--status-danger)`, `var(--status-warning)`).
6. **Orphaned Review Workflow**:
   - `EveningReviewPage` allows users to enter "Tomorrow's Top 3 Priorities", but saving the review only stores them as strings in the `eveningReviews` table. They are never ingested into the `tasks` table for the next day, breaking the daily loop.
7. **Python AI Engine Coupling**:
   - `AnalyticsPage` still imports and calls `aiEngine.getDeepAnalytics()`, and `App.tsx` polls `http://localhost:8000` every 10 seconds.

---

## 2. Detailed Page-by-Page Audit

### 2.1. FinancePage (`src/pages/FinancePage.tsx` - 992 lines)
- **Date Handling**: Uses `new Date().toISOString().split('T')[0]` at line 34.
- **Form Validation**: Checks only `!txAmount || isNaN(Number(txAmount))`. Negative amounts and zero values are not rejected cleanly.
- **Deletions**:
  - `deleteSavingsGoal(g.id)` (line 448) triggers immediately.
  - `deleteTransaction(tx.id)` (line 661) triggers immediately.
- **Formatting**: Uses raw strings `${currency}${spent.toFixed(0)}`. Needs `formatCurrencyINR()` helper.
- **Empty States**: Well-designed `EmptyState` component used for filtered transaction list, but category breakdown and budgets simply render empty text divs.

### 2.2. FitnessPage (`src/pages/FitnessPage.tsx` - 1054 lines)
- **Date Handling**: Line 32 uses `toISOString().split('T')[0]`.
- **Form Validation**: Workout logger sets reps and weights with fallbacks, but lacks boundary validation for body metrics (e.g. negative body fat percentage).
- **Deletions**:
  - `deleteWorkoutSession(ws.id)` (line 416) has zero confirmation.
  - `deleteBodyMetric(bm.id)` (line 538) has zero confirmation.
- **Formatting**: Weights and volumes use `.toLocaleString()`.
- **Empty States**: Has `EmptyState` for workout sessions, but empty exercise list in the modal does not guide the user.

### 2.3. CareerPage (`src/pages/CareerPage.tsx` - 856 lines)
- **Date Handling**: Lines 85 and 131 use `toISOString().split('T')[0]`.
- **Deletions**:
  - `deleteJobApplication(app.id)` (line 320) has zero confirmation.
  - `deleteCareerProject(proj.id)` has zero confirmation.
- **Styling**: Extensive use of legacy variables: `var(--border)`, `var(--bg-secondary)`, `var(--bg-card)`, `var(--success)`.
- **Empty States**: Present for kanban stages when empty.

### 2.4. AcademicsPage (`src/pages/AcademicsPage.tsx` - 1190 lines)
- **Date Handling**: Line 43 uses `toISOString().split('T')[0]`.
- **Attendance Algorithm**:
  - Percentage: `(attended / total) * 100`.
  - Safe bunk calculation: `Math.floor((attended - 0.75 * total) / 0.75)`.
  - Must attend consecutive calculation: `Math.ceil((0.75 * total - attended) / 0.25)`.
  - Excellent feature for Indian university students, but 1-click attendance buttons (`Present (+1)`, `Absent`) have no instant undo action if misclicked.
- **Deletions**: `deleteSubject`, `deleteAssignment`, `deleteExam`, `deleteTimetableSlot` all execute immediately with no confirmation.
- **Token Inconsistency**: Uses `var(--danger)` at line 438.

### 2.5. AnalyticsPage (`src/pages/AnalyticsPage.tsx` - 441 lines)
- **External Calls**: `aiEngine.getDeepAnalytics()` from `../services/aiEngineClient`. Shows "Python AI Engine offline" on failure.
- **Date Handling**: Lines 50, 62 use `toISOString().split('T')[0]`.
- **Fabricated Metrics**:
  - `tasks.length === 0 ? 80 : ...`
  - `expectedEntries === 0 ? 85 : ...`
  - `activeGoals.length === 0 ? 60 : ...`
  - Must be replaced with true zero values and an encouraging empty state for new installations.

### 2.6. ObsidianPage (`src/pages/ObsidianPage.tsx` - 510 lines)
- **Date Handling**: Line 172 uses `toISOString().split('T')[0]`.
- **Deletions**: `deleteNote(activeNote.id)` (line 400) deletes without confirmation.
- **Zero-State Vulnerability**: If all notes are deleted or on clean install, `activeNote` is `undefined`, causing editor input bindings to be unstable or blank without a clear empty call-to-action.
- **Styling**: Legacy CSS variables `var(--border)`, `var(--bg-card)`, `var(--bg-secondary)`.

### 2.7. EveningReviewPage (`src/pages/EveningReviewPage.tsx` - 755 lines)
- **Date Handling**: Lines 36 and 347 use `toISOString().split('T')[0]`.
- **Productivity Score**: Defaults to 100% when 0 tasks and 0 habits exist.
- **Broken Tomorrow Loop**: "Tomorrow's Priorities" are saved into IndexedDB review record, but never spawned into `tasks` table with `dueDate = tomorrow`.
- **Form State**: Editing dates loads previous review correctly, but rating stars lack aria-labels.

### 2.8. ReviewHistoryPage (`src/pages/ReviewHistoryPage.tsx` - 282 lines)
- **Date Handling**: Line 43 uses `checkDate.toISOString().split('T')[0]`.
- **Streak Calculation**: Iterates backwards 365 days; if UTC date string differs from local date string, the streak breaks falsely at midnight.
- **Token Inconsistencies**: `var(--warning)`, `var(--success)`, `var(--danger)`.

---

## 3. Tooling Baseline Status

- **Vitest**: Configured in `vitest.config.ts`, jsdom environment, setup file `tests/setup.ts`. Verified with `npm test` passing (`tests/smoke.test.ts`).
- **ESLint**: Configured in `eslint.config.js` with Flat Config:
  - Includes `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-react-hooks`.
  - Custom `no-restricted-syntax` rule active, identifying all 53 `toISOString().split('T')[0]` occurrences.
  - Verified with `npm run lint` passing (0 errors, 53 warnings).
- **TypeScript**: `tsc` compiler check clean.
- **Vite Build**: Verified production bundle compiles cleanly.

---

## 4. Phase 1 Roadmap Alignment

Based on these audit findings, Phase 1 will execute:
1. Purge legacy demo artifacts (`VariantHeaderBanner.tsx`, `ComparisonDrawer.tsx`, `DashboardObsidian.tsx`, scripts, and docs).
2. Move `services/ai_engine`, `src-tauri`, `docker-compose.yml` into `/labs`.
3. Eliminate `aiEngineClient.ts`, remove engine polling in `App.tsx`, and delete AI call sites in `TasksPage`, `AnalyticsPage`, and `SettingsPage`.
4. Create `src/lib/dates.ts` (`todayLocal()`, `toLocalDateString()`, `startOfDay()`, `dayStartHour` support) and replace all 53 `toISOString().split('T')[0]` call sites, upgrading the ESLint rule to `error`.
5. Implement store action try/catch rollbacks, error toasts, and DB init recovery screen.
6. Self-host fonts (`@fontsource/plus-jakarta-sans`, `@fontsource/jetbrains-mono`) and remove external Google Fonts CDN.
7. Call `navigator.storage.persist()` on first launch.
