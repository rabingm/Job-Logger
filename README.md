# Resume App — M0 local product review

For cloud continuation and the latest planning decisions, read [docs/CLOUD-HANDOFF.md](docs/CLOUD-HANDOFF.md) before the original kickoff prompt.

A real Expo / React Native app for capturing achievements and tailoring résumé versions, with a separate Next.js sample sharing page. All example people, employers and achievements are fictional. No cloud credentials are needed.

## Run

Use Node **24.3+ (24.x)** or **22.13+ (22.x)** and pnpm **11.25.0**. A lockfile is included. From this directory:

```sh
pnpm install --frozen-lockfile
pnpm mobile:web
```

Open http://localhost:8081 to review the **Expo app rendered on web**. In another terminal:

```sh
pnpm web
```

Open http://127.0.0.1:3000/demo for the **Next.js fictional sample**, with dark mode and Print / Save as PDF. The sample does not read the Expo app’s local edits.

For native development, run `pnpm mobile` and follow Expo’s device instructions for SDK 58. `pnpm --filter @resume/mobile ios` requires a compatible full Xcode installation and simulator. Native JS bundling passed here; neither a simulator nor an iPhone was available for runtime verification. A compatible Expo Go installation or development build must be confirmed on the review device.

### This Mac’s bundled tools

Node and pnpm were not on the shell PATH. These existing Codex tools were used without installing system-wide software:

```sh
export PATH="/Users/sandhyasharma/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/sandhyasharma/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH"
cd "/Users/sandhyasharma/Downloads/Codex Test/resume-app"
pnpm mobile:web
```

That PATH is machine-specific; use a normal Node/pnpm installation elsewhere. Local server/network commands may require the desktop sandbox’s approval.

## Product review — about five minutes

1. Choose **Explore fictional example**, or enter a name and start empty. The existing review browser contains one extra fictional test achievement and a copied version.
2. In **Log**, enter an achievement and optional metric. Reload before saving: unfinished input should return. Save it; search or filter the bank. Archive and restore it.
3. In **My résumés**, duplicate “Operations & impact” or create a new named version.
4. Tap an achievement on the résumé preview to edit that version’s wording. Add another from the bank. Hide/show, move up/down, or remove items. The original bank and copied-from version remain unchanged.
5. Use **Edit details** for the headline/summary; **Profile** for identity, roles, education and skills.
6. Open **Preview sharing** and hide contact. Nothing is published; there is no public URL, QR or analytics.
7. Open the separate Next.js sample and try its contact toggle and browser print action.

## Checks

```sh
pnpm typecheck
pnpm test
pnpm build:web
pnpm build:mobile
pnpm peers check
# With the Next.js server running:
node scripts/check-web.mjs
# Uses installed Expo compatibility metadata without requiring network:
cd apps/mobile
EXPO_OFFLINE=1 pnpm exec expo install --check
```

`build:mobile` exports web, iOS and Android JS bundles; it does **not** compile a native binary. `build:web` is a production Next.js build. The nine core tests include persistence failures, ownership validation, resolution, archive behavior, duplicate isolation, frozen snapshots and live access rules. Pure access-rule tests do not substitute for future database/RLS integration tests.

## Structure and local data

- `apps/mobile`: Expo Router app, native components, safe areas, keyboard-aware forms, AsyncStorage adapter.
- `apps/web`: Next.js App Router, `/demo` server rendering from the shared resolved shape, noindex, dark mode, print stylesheet, unavailable public routes.
- `packages/resume-core`: validated schema, fictional fixtures, resolution, version operations, snapshot/access rules and repository port.
- `docs/STATUS.md`: exact verification and limitations.
- `docs/DECISIONS.md`: M0 choices and future integration boundaries.
- `docs/reference`: unchanged original source notes.

Storage key: `resume-app.fictional-demo.v1`. Browser and native installs have separate data. Writes are serialized; saving failures offer retry and retain in-memory edits. Invalid stored data produces a retry screen instead of silently replacing it. This is local storage, without encryption, export, cloud backup or synchronization. Clearing app/browser storage deletes the workspace; use fictional data for review.

No environment variables are required; `.env.example` documents that boundary. Do not add privileged keys to Expo or `NEXT_PUBLIC_` variables. This milestone stops for product review before M1.

## Practical refinements (local product review)

Profile now includes optional phone. A role with a blank end date or `Present`
(case insensitive) is current; several roles can be current. Choose the default
on its Profile card. New capture starts with that role, allows a role/no-role
override, and returns to the default after saving. If the default ends, the first
remaining current role becomes default; with none, capture uses no role.

Archived achievements are grouped by role/employer, preserving bank order inside
each group. Tools used are optional comma-separated values with reusable choices;
they stay separate from tags and are not automatically added to résumé content.
Contact, education, skills and role history remain shared editable foundation data.
Choose Clean, Modern Split or Soft Accent in each résumé editor.

Use **Export PDF** in Expo or **Download PDF** in the Next sample. PDFs are generated
locally with selectable text and an embedded DejaVu Sans font (license in
`packages/resume-core/FONT-LICENSE.txt`). A4 pagination is controlled by the exporter;
it adds no app labels, URL/date headers, running titles or page numbers. The app
preview is responsive; PDF line wrapping is based on fixed A4 dimensions. Unsupported
font characters produce an actionable error instead of silently disappearing.
Native export writes a temporary file and opens the OS share sheet; that native
runtime path still requires device verification. Web downloads were tested in Chromium.

Existing storage remains at `resume-app.fictional-demo.v1`; its payload migrates
from schema 1 to schema 2 in memory without overwriting storage on load. All old
fields and draft role overrides are preserved. The next successful save persists
schema 2. Unknown/corrupt schemas show the existing recovery screen, not a reset.
Older app builds cannot read schema 2; back up storage before manually downgrading.

The test suite now uses Poppler (`pdftotext`, normally from `poppler-utils`) to
inspect actual PDF content and page bounds. `pnpm test` writes review PDFs to
`packages/resume-core/dist/pdf-review/`. With Next and Expo running:

```sh
PREVIEW_URL=http://127.0.0.1:3000 node scripts/check-web.mjs
PREVIEW_URL=http://127.0.0.1:3000 EXPO_URL=http://localhost:8081 node scripts/check-browser.mjs
```

The browser script uses `playwright-core` and a local Chromium executable at
`/usr/bin/chromium`; override `CHROMIUM_PATH` for other systems. It writes screenshots
and downloaded PDFs to the same ignored review directory. No real personal data is
used in these checks.
