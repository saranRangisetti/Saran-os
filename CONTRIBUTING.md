# Contributing

This project is a Next.js + React (TypeScript) app styled with styled-components and a custom window manager.

## Local Development

- Prerequisites
  - Node.js: 20.x (LTS). See `.nvmrc`/`.tool-versions`.
  - Yarn: v1.x (classic)
  - Git

- Setup
  - Install dependencies:
    - `yarn install`
  - Optional: generate search/index/icon caches once locally:
    - `yarn build:prebuild`
  - Start dev server:
    - `yarn dev`

- Useful scripts
  - Lint (ESLint + Stylelint): `yarn lint`
  - Typecheck: `yarn typecheck`
  - Unit tests (Jest): `yarn test`
  - E2E tests (Playwright): `yarn e2e`
  - Build: `yarn build`
  - Preview static export: `yarn preview`

## Commit Style

Use Conventional Commits, e.g.:

- `feat(window): add snap behavior`
- `fix(file-explorer): correct rename focus trap`
- `docs(readme): update local dev notes`

## CI Checks

On push/PR, CI runs:

1. Lint: `yarn lint`
2. Typecheck: `yarn typecheck`
3. Unit tests: `yarn test --ci`
4. Build: `yarn build`

## Pull Requests

- Keep PRs focused and small when possible
- Include before/after notes for UX/visual changes
- Add tests when fixing bugs or adding features
- Ensure `yarn lint` and `yarn typecheck` pass locally

## Coding Standards

- TypeScript strict mode is enabled; prefer explicit types in public APIs
- Follow existing patterns for contexts/hooks/components
- Prefer accessibility-first patterns (roles, labels, focus states)

## Troubleshooting

- If `yarn install` fails with OpenSSL errors, set `NODE_OPTIONS=--openssl-legacy-provider` (see README notes) or ensure Node 20.x is used.
