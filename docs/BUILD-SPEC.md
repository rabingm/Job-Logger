# Build specification v0.2 — 23 October 2026

## Purpose and scope

Capture achievements at work, then compose tailored résumés quickly and share them as a link or QR code. Longer-term professional and employer discovery is out of scope. The original user asked for iOS first and described a MacBook Air from 2021; exact chip, OS and Xcode availability are unverified.

Target audience assumption: general working professionals, until the owner chooses a narrower group. Branding is undecided; use Resume App as a placeholder. No original editor image was supplied, only its textual description. Do not claim to reproduce an unseen reference.

Principles: content separate from presentation; blocks instead of a free canvas; edit from the résumé preview; hiding affects one version; AI suggestions require acceptance. Keep a print/save-as-PDF escape hatch, although links are the primary format.

## Navigation and screens

Main tabs: Log, My résumés, Profile. Settings may be entered from Profile.

1. Sign in and onboarding: Apple and email for production. Capture name, headline, current role and three achievements with skippable optional fields. Local demo bypass is explicitly labelled and excluded from production authentication.
2. Log: one text field, optional metric, date, tags and role. One tap to save after typing. Aim for under 30 seconds. Preserve unfinished input locally on interruption or failure; full offline synchronization is not in v1. Optional weekly local reminder later.
3. Activity bank within Log: search text, filter tags and roles, edit master wording, archive/unarchive. Archived entries disappear from suggestions, but do not silently vanish from existing versions.
4. My résumés: named versions, create from bank, duplicate an existing version. An empty bank gets a clear capture entry point.
5. Editor: live résumé layout, version selector, tap text to open a focused edit sheet suitable for the phone keyboard, hide/show controls and reorder controls. Provide accessible Move up/down as well as drag if implemented. Add from bank with plus controls. Style and Share belong here. Default wording edits affect this version only; changing the original is a separate explicit action. Reword/Shorten appears when the AI capability exists, not as a broken control.
6. Profile: identity/contact, roles, education, skills; account/settings entry point. Include in-app account deletion in production readiness.
7. Share: preview, publish/update shared résumé, copy link, QR, views, hide contact, expiry and revoke. Before publication there is no usable public link. Explain that anyone with the link can view it.

Start with a polished Clean single-column template; add Modern (header band and skills sidebar) after usability validation. Both use the same resolved data. Provide accessible contrast, dynamic text sizing and touch targets. Calm professional visual design, readable typography and restrained accent color; do not copy VisualCV branding.

## Data and behavior

Start from the source model and extend it as follows; the builder should refine exact SQL types and indexes in migrations.

- profiles: id matching auth user, full_name, headline, public_email, location, unique slug, created_at/updated_at.
- roles: id, user_id, employer, title, start_date, nullable end_date, sort_order.
- activities: id, user_id, nullable role_id, text, nullable metric, happened_on, tags, archived, timestamps. The master achievement bank.
- education: id, user_id, institution, qualification, dates and sort_order.
- skills: id, user_id, name and sort_order. Do not infer public skills from private tags automatically.
- versions: id, user_id, name, slug unique within owner, template_id, headline_override, summary, hide_contact, expires_at, is_published, allow_indexing default false, timestamps.
- version_items: id, version_id, activity_id, sort_order, visible, nullable text_override; unique version/activity pair. Null means master wording; do not use truthiness to resolve overrides.
- version section configuration: version-specific role, education and skill selections/order/visibility. Use a validated schema or relational join tables; define the choice before coding. Roles may appear even without selected achievements.
- publications: current immutable resolved snapshot for a version, schema_version and published_at. Updating publication atomically replaces the active snapshot. Snapshot includes profile, roles, education, skills, selected achievements and template choice.
- view_events: id, version_id, viewed_at, optional referrer and country. Minimal analytics; no fingerprinting or visitor identity. Avoid storing referrer query strings that may contain personal data. Country optional; omit until there is a justified implementation.

resolveVersion() is a pure shared function returning validated render-ready data. Drafts can resolve the latest master content unless overridden. Duplication copies selections and overrides without sharing mutable version settings. Publication freezes the resolved result until the owner explicitly updates it. New log entries are not silently added to any version.

Hide contact, expiry and revocation are live access controls checked on every public request, including when a snapshot exists. Hide contact must remove contact data from rendered HTML/JSON, not only CSS. Revocation blocks future access to the URL but cannot recall copies already downloaded. Re-publishing may reactivate the same route; a future rotate-link feature is separate.

## Security and sharing

Use Supabase Auth and row-level security on every user table. Enforce ownership on cross-table references, not merely the top-level version. A user must never attach another user's activity or role using guessed IDs. Test access with at least two users and an anonymous caller. Avoid broadly exposing snapshots through public database policies.

Public route: /{profile_slug}/{version_slug}; prevent collisions with reserved application routes. Server endpoint returns only the allowed snapshot for a published, unexpired version. Return 404 or 410 on missing/revoked/expired content. Use a cache strategy that cannot keep serving revoked or expired résumés; test it explicitly. Server-only privileged keys must never reach browser or Expo bundles. Protect publication and analytics endpoints against abuse.

Default noindex and exclude from sitemap; indexing is opt-in. Noindex is not privacy protection. Public rendering is mobile-first and server-rendered, with dark mode. Link preview metadata/images must not expose hidden contact data; external preview caches cannot necessarily be recalled. Count approximate views, exclude owner previews and known crawlers where possible, and never label counts unique people. Keep analytics retention configurable and document deletion behavior.

Print stylesheet provides Print / Save as PDF with clean pagination; do not label it a direct Download PDF unless a PDF download is actually implemented. Public views require no login.

## Technical plan

Expo + React Native + TypeScript + Expo Router for mobile. Next.js for public pages. Supabase Postgres/Auth; Storage only when assets actually require it. Shared resume-core package for types, validation, resolution and publication rules. Supabase Edge Function for later AI requests. Use a development build for real-device integration; confirm installed tooling and current supported versions rather than inheriting old SDK numbers.

Local demo repository adapter should be replaceable by Supabase, not a second divergent product. Clearly separate fictional demo storage and real account data. Preserve draft input locally; handle network retry without duplicate saves.

## AI after core validation

Reword/shorten: submit one achievement, optionally a job ad, return three alternatives. Job matching ranks the user's activities with short reasons. User approves additions and wording. Show original beside suggestions; never invent facts, preserve numbers and units, reject malformed outputs and handle failure. Keep credentials server-side, authenticate callers and rate-limit per user. Treat pasted job ads as untrusted content. Do not automatically publish AI output.

## Out of scope

Professional network, employer accounts, messaging, payments, Android release, free canvas, cover letters, uploaded résumé parsing, evidence uploads and expandable project portfolios. These can be revisited after the logging/tailoring workflow is validated.

## Overall acceptance

A new user can create an account, log five activities, build a tailored version from existing content in under two minutes, publish it, share a working unauthenticated link/QR and see approximate views. Editing or archiving master content never silently changes an already published snapshot. Revocation, expiry, hidden contact and account isolation work in the real backend, not only in mocks.
