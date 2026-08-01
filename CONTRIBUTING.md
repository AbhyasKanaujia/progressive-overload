# Contributing to Progressive Overload

## Before you start

- Pick an open issue and comment that you're working on it
- Create a branch from `main`: `git checkout -b feat/<short-description>` or `fix/<short-description>`
- Keep PRs small and focused on one issue

## Required checklist before opening a PR

Every PR must pass these checks. CI enforces them automatically.

- [ ] **TypeScript compiles** — run `npx tsc --noEmit`
- [ ] **Prettier formatting** — run `npx prettier --write .`
- [ ] **Tests pass** — run `npm test`
- [ ] **Tests exist** — every new source file needs a corresponding `.test.ts` in `__tests__/` or alongside it
- [ ] **Coverage threshold** — global coverage must stay above the configured threshold
- [ ] **Commit messages** follow conventional commits: `feat:`, `fix:`, `ci:`, `refactor:`, etc.

## Branch naming

| Prefix | Use for |
|--------|---------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `ci/` | CI or tooling changes |
| `docs/` | Documentation only |
| `refactor/` | Code changes that neither fix a bug nor add a feature |

## Commit messages

```
feat: add exercise library screen
fix: correct SQLite schema foreign key
refactor: extract workout card into component
ci: update PR checks workflow
```

## PR template

GitHub will auto-populate your PR description. Fill in the Summary, Changes, and Test Plan sections.

## What happens after you open a PR

1. CI runs automatically (type check, format, tests, coverage)
2. A maintainer reviews and may request changes
3. Once approved and green, it gets squash-merged to `main`
