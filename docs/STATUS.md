# M0 delivered — ready for product review

Date: 23 October 2026 (Australia/Perth)

## Delivered

- pnpm workspace and lockfile; Expo TypeScript / React Native / Expo Router app; Next.js App Router sample frontend; shared `@resume/core`.
- Local onboarding with fictional example or empty workspace. Profile identity/contact, roles, education and skills editing.
- Quick capture, optional metric/date/tags/role, persistent unfinished capture input, searchable bank, tag/role filters, master editing, archive/restore.
- Named versions, empty creation, duplication, live Clean résumé, version-only wording, reset to original, selection add/remove, hide/show, achievement and role reordering, summary/headline editing and section visibility.
- Local share preview and contact hiding, explicitly unpublished. Separate server-rendered fictional web example with noindex, dark mode and print CSS. No invented auth, links, QR codes, AI or analytics.
- Loading, empty and validation states; save feedback/retry; non-destructive load failure; labelled inputs, accessible buttons, native switches, keyboard-aware edit sheets and scalable native text.
- Original files in `docs/reference` remain untouched. All source work is inside `resume-app`; no unrelated parent files were edited.

## Verified

Environment: macOS 27.0 arm64; bundled Node 24.22.1 and pnpm 11.25.0. System shell initially had neither Node nor npm. Full Xcode is not configured: `xcode-select -p` returns `/Library/Developer/CommandLineTools`; `xcrun simctl list devices` fails because simctl is unavailable.

| Check | Result |
| --- | --- |
| `CI=true pnpm install --no-frozen-lockfile` | Completed; compatible React types aligned; lockfile written |
| `pnpm typecheck` | Passed for core, mobile and web |
| `pnpm test` | 9 tests passed, 0 failed |
| `pnpm peers check` | No peer dependency issues |
| `EXPO_OFFLINE=1 …/expo/bin/cli install --check` from mobile | Dependencies up to date against installed SDK map |
| `…/expo/bin/cli export --platform all` from mobile | Passed: web, iOS and Android bundles exported |
| `…/next/dist/bin/next build` from web | Passed: production compile, TypeScript and static generation |
| `node scripts/check-web.mjs` with Next server | Passed: SSR, noindex, hidden contact absent from HTML/RSC response, unpublished route returns 404 |
| Browser interaction review | Passed: demo onboarding, draft+metric reload recovery, capture/save, duplicate, focused wording edit, reorder, add from bank, share preview, hide contact, source version unchanged, archive/restore |
| Visual review | Expo preview inspected at 663px browser width; Next sample inspected in dark mode at desktop width. Screenshots in `docs/review` |

The core tests cover deterministic resolution, explicit empty overrides, duplicate and master isolation, archive retention, snapshot stability, live access expiry/revocation/contact removal, cross-owner rejection, reorder boundaries, queued persistence, corrupted-load rejection and failed-save retry. These are domain tests, not real multi-account/RLS tests.

Registry access and local server/socket operations required sandbox approvals. An early pnpm YAML configuration problem and React type peer mismatch were corrected. Initial tsx CLI tests needed IPC access; the final test script uses Node directly with the tsx import hook and passes in the sandbox. Package installation logged retries for optional binaries on other platforms but completed successfully.

## Review now

See `README.md` for setup and the complete walkthrough. In two terminals from this directory:

```sh
pnpm mobile:web    # http://localhost:8081
pnpm web           # http://127.0.0.1:3000/demo
```

The local servers were left running for this review. The current browser workspace includes a clearly labelled fictional review achievement and a copied version used during verification. New browser/device storage starts with the standard five-example fixture and onboarding.

## Limitations / unverified

- No native simulator/device run, signed native binary, TestFlight build or iPhone keyboard/VoiceOver test. Native bundling is not device verification.
- No timed human usability study or claim that capture/tailoring meets its target time yet.
- Browser print styling exists; a physical print/PDF pagination review was not performed. A phone-width Next page and full large-text accessibility review remain product-review checks.
- Local drafts only. No authentication, sync, migration, encrypted storage, backup/export, actual publication, QR, approximate views, expiry/revocation endpoint, backend RLS or account deletion.
- The Next fixture is separate from mobile edits. Draft edits can follow changed master wording; nothing is publicly published. Production snapshot updates remain M3.
- Skills/education use whole-section visibility; per-entry version choices and richer date editing remain M2. Modern template, AI and reminders are deferred.
- General-purpose audience and working branding are provisional. Guided multi-achievement onboarding and richer native navigation should be assessed in review.

## Next action — product review, then M1 only when requested

Review the local capture → bank → tailor → preview flow. Do not start cloud integration in this milestone.

M1 setup needed: an authorized Supabase project (project URL, client publishable key, server-side credentials stored only in ignored server environment files), email Auth settings and redirect URLs, Apple Developer access for Sign in with Apple identifiers/capability and provider configuration, compatible full Xcode and an iPhone/simulator for native checks. An Expo account/EAS setup is needed if choosing hosted development builds. No credentials are needed for M0. Hosting/domain configuration belongs with M3 public sharing. Exact Apple distribution requirements must be rechecked when that work is authorized.

## Cloud handoff — 26 October 2026

The owner authorized public upload to `rabingm/Job-Logger`. Added a cloud handoff and a ready-to-paste next implementation task; clarified that the original M0 kickoff is historical. No application features changed during handoff. Planned practical workflow/template/export changes remain unimplemented. Browser-local edits and credentials are not included in the source transfer.
