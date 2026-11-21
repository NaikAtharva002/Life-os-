# LIFE OS — The Local-First Personal Operating System

![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-Tauri_2.0-DEA584?logo=rust&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Local-First](https://img.shields.io/badge/Architecture-Local--First-green.svg)

**LIFE OS** is an engineered, privacy-preserving personal productivity platform designed for execution velocity across academic, financial, professional, and athletic domains.

Built with a **multi-language, multi-technology architecture**, LIFE OS pairs a fast reactive TypeScript/React frontend with a Python/FastAPI intelligence engine, SQLite relational analytics, and a native Rust/Tauri desktop shell.

---

## ⚡ Technology Matrix

| Layer | Technology | Responsibility |
|---|---|---|
| **Frontend UI** | **TypeScript 5.8 + React 19 + Vite 6** | Application state (`Zustand`), interactive data tables, Kanban pipelines, subtask checklists, and responsive layout. |
| **Styling & Design** | **Semantic HTML5 + Custom Obsidian CSS** | Strict **Anti-AI-Slop** design system (Obsidian Graphite `#0c0d10`, Linear-style tactile panels, hairline progress tracks). |
| **Client Storage** | **IndexedDB (Dexie.js)** | Tier-1 instant offline storage. Operates 100% locally in browser without mandatory server processes. |
| **Intelligence Engine** | **Python 3.13 + FastAPI + Pydantic v2** | Deterministic Natural Language task/habit extraction, academic bunk calculus, financial cashflow projections, and daily executive summaries. |
| **Relational Data** | **SQL + SQLite 3 (WAL Mode)** | Tier-2 structured analytics database. Versioned SQL migrations (`001_initial_schema.sql`, `002_analytical_views.sql`) and reporting views. |
| **Native Performance** | **Rust + Tauri 2.0 (`src-tauri`)** | Native desktop wrapper, unsandboxed Obsidian vault filesystem export, and OS notification dispatch. |
| **Containerization** | **Docker & Docker Compose** | Multi-stage container builds and volume-mounted service orchestration. |
| **CI / CD** | **GitHub Actions** | Matrix automated testing across TypeScript build, Pytest suite (8 unit tests), Rust syntax validation, and Docker builds. |

---

## 🚀 Quickstart & Execution Modes

### Mode 1: Instant Web Mode (Zero Backend Required)
Runs 100% locally in your browser using IndexedDB:
```bash
# Clone the repository
git clone https://github.com/NaikAtharva002/Life-os-.git
cd Life-os-

# Install & launch
npm install
npm run dev
# App is live at http://localhost:5173
```

### Mode 2: Hybrid Local Intelligence Mode (Web + Python AI Engine)
Unlocks deep SQLite analytics, Natural Language task parsing, and academic bunk optimization:
```bash
# Terminal 1: Launch Frontend
npm run dev

# Terminal 2: Launch Python AI Engine
cd services/ai_engine
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe main.py
# AI Engine runs at http://localhost:8000
```

### Mode 3: Containerized Ecosystem (Docker Compose)
Runs the entire frontend, Python engine, and volume-mounted SQLite database in isolated containers:
```bash
docker compose up -d
# Frontend: http://localhost:5173
# API & Docs: http://localhost:8000/docs
```

---

## 🧪 Testing & Verification

```bash
# 1. Frontend TypeScript & Production Build
npm run build

# 2. Python AI Engine Pytest Suite
cd services/ai_engine
pytest -v
```

---

## 📚 Technical Documentation

- [MULTI_STACK_ARCHITECTURE.md](./MULTI_STACK_ARCHITECTURE.md) — Exhaustive system architecture, inter-service contracts, and database schema documentation.
- [TEAM_WORKFLOW.md](./TEAM_WORKFLOW.md) — 5-Person Git branching model, pull request templates, and development guidelines.
- [TEAM_QUICKSTART.md](./TEAM_QUICKSTART.md) — Setup and onboarding guide for collaborative team members.
