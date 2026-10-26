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

## Practical refinements — cloud verification, 26 October 2026 (Australia/Perth)

Implemented on `feat/practical-resume-refinements` using Node 24.19.0 and pnpm 11.25.0.
The existing Expo/React Native app, Next sample and shared domain library are retained.

Delivered:
- Archived bank groups by role/employer, including an independent group; existing order is retained within groups.
- Multiple current roles, one default with deterministic fallback, capture overrides and reset-to-default after save.
- Optional tools with reusable choices, persistence, master editing and search; private tags/tools do not enter exports automatically.
- Optional phone in the existing Profile form and shared contact data; hide-contact removes phone from resolved content and PDF.
- Clean, Modern Split and Soft Accent selections per version in native/web previews and PDF. Stable profile, education and previous experience are reused.
- Local selectable-text A4 PDF generation, explicit pagination, embedded licensed font, web download and native share-sheet adapter. No photos, app branding, demo labels, browser headers/footers or page numbers in generated PDF content.
- Schema 1→2 migration at the same storage key, preserving existing drafts, selections, wording, roles and bank content. Loading does not write; successful saves persist the upgraded state. Failed validation uses the existing recovery flow.

Baseline rerun before implementation: all three TypeScript checks, 9 domain tests,
Next production build and Expo web/iOS/Android exports passed in this cloud instance.

Final verification commands and observed results:
- `pnpm typecheck`: core, Expo and Next passed.
- `pnpm test`: 15 passed, 0 failed/skipped, including migration preservation/idempotence/ownership, current-role fallback, grouping, tools persistence, phone privacy, template equivalence, version/master/snapshot isolation and actual PDF extraction/bounds checks.
- `NEXT_TELEMETRY_DISABLED=1 pnpm build:web`: production build passed.
- `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 pnpm --filter @resume/mobile exec expo export --platform all --max-workers 2`: web, iOS and Android JS exports passed.
- `pnpm peers check`: no peer issues. `EXPO_OFFLINE=1 pnpm --filter @resume/mobile exec expo install --check`: installed SDK compatibility map passed (offline check).
- `PREVIEW_URL=http://127.0.0.1:3001 node scripts/check-web.mjs`: SSR, noindex, contact absence and unpublished 404 passed against Next production server.
- `node scripts/check-browser.mjs`: Chromium downloads from all three Next templates and Expo profile/phone editing, capture/tools reload persistence, archive/restore grouping, second-current-role default selection, template switching and PDF download passed. All data was fictional in an isolated browser session.
- Actual generated single-page and long multipage PDFs were extracted with Poppler and inspected as rendered images. Clean, Soft Accent and Modern Split continuation layouts were checked; short blocks stay together, long paragraphs wrap across pages. Tests assert contact absence, retained content, one name header, multiple pages for long fixtures, and text within margins.

A browser check found tslib 1.x's ESM/CJS interop failure in Metro despite successful
JS export. `apps/mobile/metro.config.js` now resolves each caller's own tslib CJS
entry. The browser export flow was rerun successfully. PDF pagination was refined
after inspecting a split education entry; short entries now remain together.

Limitations: native OS share-sheet/file handling, signed native binaries, iPhone
keyboard/VoiceOver and physical device layout remain unverified. Embedded DejaVu
Sans covers common Latin/Greek/Cyrillic text, not every script/emoji; unsupported
characters fail export clearly. PDFs are selectable but have no tagged-PDF
accessibility structure. Browser and PDF typography/wrapping differ by design;
PDF layout is fixed A4. The embedded font/PDF engine increases bundle size.
Tools can be added deliberately to shared skills; per-version tool selection is
not implemented. Existing migrated draft role overrides are retained until save.
Next sample content remains separate from Expo edits. No authentication, backend,
AI, analytics, deployment or merge was performed. Stop for product review.

Committed review fixtures: `docs/review/refinements/` contains the three single-page
PDF templates and a long Modern Split PDF, all generated from fictional test data.
