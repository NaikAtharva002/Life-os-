# LIFE OS — Team Quickstart & Developer Cheat Sheet

This guide provides step-by-step commands for each team member to clone, sync, develop, and submit work on their assigned branch.

---

## Initial Setup for All Developers

Ensure you have:
- Node.js (v18+ recommended)
- Git (v2.30+)
- Access to the GitHub repository

```bash
# 1. Clone the repository
git clone <YOUR_REPOSITORY_URL>
cd life-os

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
# App is live at http://localhost:5173/
```

---

## Individual Developer Workflows

### Person 1 — Atharva (Foundation & Architecture)
**Assigned Branch**: `feature/atharva-foundation`  
**Domain**: Design tokens, global layout shell, sidebar, dashboard, system settings.

```bash
# Switch to your branch
git switch feature/atharva-foundation

# Pull latest work
git pull origin feature/atharva-foundation

# Sync with develop baseline
git fetch origin
git merge origin/develop

# Make changes to owned files:
# (src/index.css, src/App.tsx, src/components/Sidebar.tsx, src/pages/Dashboard.tsx, etc.)

# Validate build & regression tests
npm run build
node e2e-test.mjs

# Commit and push
git add .
git commit -m "feat(foundation): refine top toolbar and design tokens"
git push -u origin feature/atharva-foundation
```

---

### Person 2 — Team Member 2 (Goals & Tasks)
**Assigned Branch**: `feature/goals-tasks`  
**Domain**: Goal management, priorities, milestones, task views (List, Kanban, Calendar).

```bash
# Switch to your branch
git switch feature/goals-tasks

# Pull latest work
git pull origin feature/goals-tasks

# Sync with develop baseline
git fetch origin
git merge origin/develop

# Make changes to owned files:
# (src/pages/GoalsPage.tsx, src/components/GoalCard.tsx, src/pages/TasksPage.tsx, etc.)

# Validate build & regression tests
npm run build
node e2e-test.mjs

# Commit and push
git add .
git commit -m "feat(tasks): add custom calendar filters and kanban drag"
git push -u origin feature/goals-tasks
```

---

### Person 3 — Team Member 3 (Habits & Fitness)
**Assigned Branch**: `feature/habits-fitness`  
**Domain**: Daily habits, streaks, 70-day consistency heatmap, gym & workout tracker.

```bash
# Switch to your branch
git switch feature/habits-fitness

# Pull latest work
git pull origin feature/habits-fitness

# Sync with develop baseline
git fetch origin
git merge origin/develop

# Make changes to owned files:
# (src/pages/HabitsPage.tsx, src/components/HabitCard.tsx, src/pages/FitnessPage.tsx, etc.)

# Validate build & regression tests
npm run build
node e2e-test.mjs

# Commit and push
git add .
git commit -m "feat(habits): add sound cue on habit completion and workout volume chart"
git push -u origin feature/habits-fitness
```

---

### Person 4 — Team Member 4 (Finance & Analytics)
**Assigned Branch**: `feature/finance-analytics`  
**Domain**: Wealth tracking, transaction ledger, monthly budgets, savings goals, productivity analytics.

```bash
# Switch to your branch
git switch feature/finance-analytics

# Pull latest work
git pull origin feature/finance-analytics

# Sync with develop baseline
git fetch origin
git merge origin/develop

# Make changes to owned files:
# (src/pages/FinancePage.tsx, src/pages/AnalyticsPage.tsx, etc.)

# Validate build & regression tests
npm run build
node e2e-test.mjs

# Commit and push
git add .
git commit -m "feat(finance): add recurring expense automation and category breakdown chart"
git push -u origin feature/finance-analytics
```

---

### Person 5 — Team Member 5 (Academics, Career & AI)
**Assigned Branch**: `feature/academics-career-ai`  
**Domain**: Academic semesters, attendance calculator, career pipeline, Astra AI Copilot, Obsidian notes.

```bash
# Switch to your branch
git switch feature/academics-career-ai

# Pull latest work
git pull origin feature/academics-career-ai

# Sync with develop baseline
git fetch origin
git merge origin/develop

# Make changes to owned files:
# (src/pages/AcademicsPage.tsx, src/pages/CareerPage.tsx, src/pages/AssistantPage.tsx, src/pages/ObsidianPage.tsx, etc.)

# Validate build & regression tests
npm run build
node e2e-test.mjs

# Commit and push
git add .
git commit -m "feat(academics): add bunk prediction calculator and obsidian note export"
git push -u origin feature/academics-career-ai
```

---

## Submitting Your Work via Pull Request

1. **Push your branch to GitHub**:
   ```bash
   git push origin <your-assigned-branch>
   ```
2. **Navigate to GitHub in your browser**:
   - Go to your repository on GitHub.
   - Click **"Compare & pull request"**.
3. **Set the Target Branch**:
   - Base branch: **`develop`** (⚠️ **NEVER select `main`**).
   - Compare branch: `feature/<your-feature-branch>`.
4. **Complete the Template**:
   - Fill out the PR template (`.github/pull_request_template.md`).
   - Attach screenshots if UI was touched.
   - Confirm you ran `npm run build` with 0 errors.
5. **Request Review**:
   - Assign **Atharva** and a peer reviewer.
   - Once approved, the Integration Owner merges your work into `develop`.
