---
applyTo: '**'
---

# Agent Memory

This file stores persistent context and user preferences for the development assistant.

## Project Context

- **Project Name:** Merchkins App
- **Stack:** Next.js 14, Convex (backend), TypeScript, TailwindCSS, shadcn/ui
- **Package Manager:** bun
- **Primary Theme Colors:** #1d43d8 (primary blue), #adfc04 (neon accent)

## Available Custom Agents

### Planner Agent (`@planner`)

- **Agent Definition:** `.github/agents/planner.agent.md`
- **Supplementary Instructions:** `.github/instructions/planning-agent.instructions.md`
- **Purpose:** Creates detailed implementation plans for features, bug fixes, and refactoring
- **Output Directory:** `.github/plans/`
- **Activation:**
  - Use `@planner` in chat
  - Use keywords like "plan", "design", "architect", "break down", "scope out"
- **File Naming:** `{kebab-case-title}-{8hex}.plan.md`
- **Plan Types:** Feature (full), Bug Fix (simplified), Refactor
- **Handoffs:**
  - "Start Implementation" → passes to default agent
  - "Refine Plan" → continues planning

### Beast Mode Agent

- **Location:** `.github/instructions/beast.instructions.md`
- **Purpose:** Autonomous problem-solving with thorough iteration until completion
- **Activation:** Activated by default for all tasks

## User Preferences

- Prefers concise, actionable responses
- Appreciates structured markdown formatting
- Uses bun as package manager
- Uses Convex for backend/database

## Project Structure Notes

- Feature-based architecture under `src/features/`
- Convex functions organized by domain in `convex/` folder
- Shared components in `src/components/ui/`
- Plans stored in `.github/plans/`
- Agent definitions in `.github/agents/`
- Instructions stored in `.github/instructions/`
