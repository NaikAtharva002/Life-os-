# SKILLS AND TOOLS AUDIT

## 1. Installed Antigravity Plugins & Skills

Verified directly from the local Antigravity Language Server (`GetAllPlugins`) and filesystem:

| Plugin / Source | Status | Skills / Capabilities | How Used in LIFE OS |
|---|---|---|---|
| **antislop** (user plugin) | Enabled (`isGlobal: true`) | `antislop`, `antislop-ui`, `antislop-layoutmobile`, `antislop-human`, `antislop-copywriting`, `antislop-code` | Enforces real user data, WCAG AA contrast, keyboard accessibility, mobile reflow, and clean copy during UI/code work. |
| **swarm** (built-in plugin) | Enabled (`isGlobal: true`) | Native multi-agent swarm coordination (used only when `/swarm` is invoked) | Not required for single-branch execution; subagents available if parallel tasks are needed. |
| **Built-in skills** | Available | `antigravity-guide`, `agy-customizations`, `plugin`, `generative_ui`, `mcp-app-development`, `run-workflow`, `conversations`, `automation`, `ui-plugin-navigation` | Referenced for Antigravity plugin and workflow conventions. |

## 2. MCP Servers & External Connectors

- **Configured MCP servers (`~/.gemini/config/mcp_config.json`)**: None currently configured.
- **GitHub CLI (`gh`)**: Not installed on PATH (`git` `2.52.0` + Git Credential Manager `2.6.1` signed in as `rishita1524-source` are active for clone/fetch/push).
- **Supabase / External Backend Connectors**: None active in this local-first repository; persistence is client-side IndexedDB via Dexie.js.

## 3. Available Development, Research & Testing Tools

| Capability | Tool / Runtime | Status | Notes / Workaround |
|---|---|---|---|
| **Frontend Build & Typecheck** | `tsc` + `vite` (`npm run build`) | Available | Verified working (`vite v8.3.8`, `typescript ^5.7.3`). |
| **Linting** | `eslint src` (`npm run lint`) | Available | Verified working (`eslint ^10.15.0`). |
| **Unit & Component Tests** | `vitest` + `@testing-library/react` + `fake-indexeddb` | Available | Verified working (`npm test`). |
| **Browser Automation / Visual QA** | `playwright` + headless Microsoft Edge (`msedge`) | Available | Verified working against local `vite preview`. |
| **Web Research** | `search_web` tool | Available | Used to research GitHub AI SaaS UI, agentic UIs, and `liquid-gl`. |
| **Design Tools (Figma/Canva)** | Not installed as MCP plugins | Unavailable | Implemented directly using LIFE OS design tokens and `lucide-react` + custom SVG monogram. |
| **Python / Rust Local Backends** | `services/ai_engine` and `src-tauri` referenced in legacy `README.md` | Not present in repository | Removed in earlier `dc8de31` cleanup; all AI/RIT orchestration runs in TypeScript with optional Google Gemini API integration. |
