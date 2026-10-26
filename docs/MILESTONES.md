# Milestones

## M0 — Runnable local product prototype (first build assignment)

Inspect installed tools. Scaffold workspace, Expo app, Next.js app and shared types. Implement a coherent local flow using fictional demo data: onboarding/profile, quick log and bank, version list, single-template editor, and share preview. Support actual add/edit/hide/reorder/duplicate interactions and local persistence. Do not fake cloud publication, authentication, AI or analytics. Build a sample web résumé rendering the shared shape. Include empty/error states and basic accessibility. Record how to run everything; perform available type checks, logic tests and builds. If an iOS simulator or device cannot run, report that separately from web validation. Reviewable result: user can try the flow locally without cloud credentials.

## M1 — Real auth and data

Add migrations, ownership constraints and tested RLS; replace the demo adapter with Supabase for authenticated use. Implement Apple/email sign-in, profile/roles/education/skills and real log CRUD. Test two-account isolation and cross-owner relation rejection. Verify one-tap save, retry behavior and local input recovery. Real device check when signing/tooling permits.

## M2 — Complete résumé editing

Persist versions, selections/order and overrides. Add duplication and all basic sections. Test override isolation, deterministic resolution, archive behavior and empty sections. Validate five existing achievements to tailored résumé in two minutes with a person, not just an automated test.

## M3 — Real publication and sharing

Publish immutable snapshots; implement server access checks, public links/QR, live privacy controls, expiry, revoke, noindex, metadata, approximate view counts and print stylesheet. Test that draft/master changes cannot modify the public snapshot, and revoked/expired content cannot be served from app caches. Test public pages without login on phone-sized screens.

## M4 — Pilot

Prepare TestFlight for roughly 10 testers after account configuration. Measure completion, capture time, tailoring time and repeat logging. Fix confusing interactions. Prepare account deletion and retention behavior before collecting pilot data. No fabricated usability results.

## M5 — AI and second template

Implement optional rewrite/shorten and job-ad ranking through authenticated backend functions; preserve facts, user approval and rate limits. Add Modern template using identical resolved content. Keep manual workflow fully functional.

## M6 — Release readiness

Verify current distribution requirements, privacy policy and disclosures, deletion, screenshots and review notes. Validate release build on a real iPhone. Obtain authorization before public deployment or store submission.
