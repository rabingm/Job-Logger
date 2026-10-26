# Cloud continuation — Job Logger

Prepared 26 October 2026 (Australia/Perth).

## Start here

This repository contains the existing M0 implementation, not an empty starter. Read AGENTS.md, README.md, docs/STATUS.md and this file. Preserve the real Expo mobile app, Next.js sharing foundation and shared resume-core. Use repository-relative paths; older documentation contains paths specific to the original Mac.

M0 was reviewed positively. Subsequent feature discussions were planning only: the changes below are not implemented. Obtain an implementation request before doing them. This handoff takes precedence over the old START-CODEX.md instruction to build M0 again. Do not automatically start M1 cloud integration merely because development now runs in a cloud environment.

## Latest product direction

Purpose: expedite job applications without adding repetitive administration.

- Group archived achievements by role/employer. No new chronological ordering requirement was agreed.
- Support multiple current roles (for example two or three), with one default current role. New achievements should automatically use the default, with an optional override. The primary use case is one full-time job.
- Add optional tools used to achievements, with reusable selections to avoid repeated typing. Do not automatically dump all tools into every résumé.
- Keep the current Profile arrangement and add optional phone. Include phone with contact when selected for a résumé; hide-contact must also remove phone.
- Contact, education and previous experience are stable reusable foundation data. Most updates belong to the current role. All foundation information remains editable.
- Preserve the achievement bank when tailoring a version. Switching templates must reuse the same data, without re-entry.
- Plan three clean, professional, modern, photo-free templates: Clean (single column); Modern Split (white layout, narrow contact/skills column, wider experience column, thin dividers); Soft Accent (muted teal sidebar for contact/education/skills and white main experience area).
- Two visual references were supplied in the original chat. Treat them as design inspiration, not personal résumé data. Omit photos and empty photo placeholders. Do not add reference contacts/languages just because the example images show them.
- Application exports contain only résumé content. No app branding, demo labels, URL/date, repeated document title, page-number headers or footers. Name/contact in the résumé body remain. A controlled PDF export should be considered because browser print headers/footers are user-agent settings. Verify actual exported layout and multipage behavior before claiming completion.

## Current implementation and verification

See docs/STATUS.md for dated results. M0 includes local persistent capture and draft recovery, bank search/filter/archive/restore, profile/roles, named versions and duplication, version wording, hide/reorder/remove/add controls, and unpublished share preview. Next.js renders a separate fictional sample, not mobile local edits.

The original Mac passed core/mobile/web TypeScript, nine core tests, Next production build, Expo iOS/Android/web JS exports, dependency peer checks and selected browser interactions. These are historical results; rerun checks in the cloud. No native binary/device test, real backend, auth, RLS, publication, analytics or AI exists.

Browser-local edits do not transfer with source control. Demo fixtures do. No cloud credentials are required for the current app.

## Cloud environment setup

Use Node 24.x (at least 24.3) and pnpm 11.25.0, from the repository root. Do not use the Mac-specific bundled executable paths in the README.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build:web
pnpm build:mobile
```

Start the Expo web review with `pnpm mobile:web` and the separate Next sample with `pnpm web`. The current scripts bind localhost; cloud preview exposure may require environment-specific host/port configuration. Inspect the environment's supported preview mechanism before changing these. Do not deploy publicly as part of setup.

Keep native-device verification separate from JavaScript bundling. Preserve fictional demo mode while later authenticated storage is developed. Do not create paid resources or request secrets for this local milestone.

## Suggested first cloud task (planning)

“Continue the existing Job Logger project. Read AGENTS.md, docs/CLOUD-HANDOFF.md, README.md and docs/STATUS.md. Verify the current M0 in this cloud environment, then propose the smallest coherent implementation slice for the practical workflow and three photo-free templates described in the handoff. Do not rebuild M0, implement features, add auth/cloud storage or deploy yet. Clearly distinguish implemented behavior from planned changes.”
