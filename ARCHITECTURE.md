# ARCHITECTURE

## 1. System Architecture (Local-First AI-Native Personal OS)

LIFE OS runs as a local-first React 19 + TypeScript + Vite 8 application backed by IndexedDB (Dexie v4 migration-safe from v1/v2/v3) and Zustand (`useStore.ts`).

### Layer Overview
1. **Storage Layer (`src/db/index.ts`, `src/db/repository.ts`)**:
   - Dexie `LifeOS_IndexedDB` stores all personal dimensions.
   - Version 4 safely adds `lifestyleItems` (travel, hobbies, memories, relationships, experiences) and `ritMemory` (persistent user context notes/preferences for RIT) while preserving 100% of existing v1/v2/v3 user records (`isDemo: false`, `deletedAt: null`).
   - Zod backup schema (`src/lib/backupSchema.ts`) stays backward-compatible with v1/v2/v3 exports while supporting new optional fields.
2. **State & Selector Layer (`src/store/useStore.ts`, `src/lib/dashboardSelectors.ts`)**:
   - Central Zustand store syncs mutations optimistically and persists to IndexedDB.
   - `filterUserRecords` ensures `deletedAt` rows and `isDemo` rows (when `isDemoMode` is false) never leak into Home, Analytics, Search, or RIT context.
3. **RIT Intelligence Engine (`src/lib/ritEngine.ts`)**:
   - **Context Builder**: Compiles a real-time, privacy-preserving snapshot of the signed-in/local user's tasks, overdue queue, goals, habits, academics (classes, attendance, assignments, exams), finance (income, spend, budgets), career, fitness, lifestyle memories, evening reviews, notes, and RIT personal memory.
   - **Action & Tool Layer**: Supports real executable actions with clear status/confirmations:
     - `create_task` (powered by `chrono-node` NLP + store `addTask`)
     - `complete_task` / `reschedule_overdue_today`
     - `create_goal` / `create_habit` / `log_expense` / `save_note` / `save_memory` / `start_focus` / `navigate`
   - **Dual Execution Mode**:
     - **Live Gemini Mode**: When `settings.geminiApiKey` is configured, calls Google Gemini (`generativelanguage.googleapis.com` `gemini-2.5-flash`) with real structured JSON tool/plan output and honest error handling if the key is invalid or offline.
     - **Deterministic Local Intelligence Mode**: When offline or without an API key, runs a genuine multi-domain analyzer over real IndexedDB data (zero fake stats or canned claims).
4. **Liquid Glass Surface Layer (`src/components/LiquidGlassSurface.tsx`)**:
   - Wraps `liquid-gl@3.0.0` cleanly in React `useEffect` with `lens.destroy()` cleanup, `prefers-reduced-motion` awareness, WebGL/WebGPU capability check, and automatic high-contrast CSS `backdrop-filter` + solid inner reading surface fallback (`R-25` WCAG AA compliance).
5. **UI & Life Dimensions**:
   - **RIT Command Center & Liquid Glass AI Search** (`⌘K` / `/`, plus full RIT workspace at `/assistant` / `/rit`): Unified search across all dimensions + natural-language RIT command & structured action cards.
   - **Today / OS Home (`/`)**: Personalized command home integrating RIT daily brief/quick prompt, Today's Execution, Habits, Focus Sprint, Today's Timetable, Upcoming 7-Day Cross-Dimension Events, Finance/Fitness/Evening Review, and Active Goals.
   - **Lifestyle & Experiences (`/lifestyle`)**: Dedicated workspace for Travel, Hobbies, Memories, Relationships, and Personal Experiences.
