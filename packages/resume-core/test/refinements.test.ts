import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { createResumePdf } from '../src/pdf';
import { demoState, validateState, createLocalRepository, defaultCurrentRole, groupAchievements, toolOptions, parseTools, templates, resolveVersion, duplicateVersion, createSnapshot } from '../src/index';

test('v1 migration preserves drafts, role overrides, versions and all existing data without rewriting storage', async () => {
  const old: any = demoState(); old.schemaVersion = 1; delete old.defaultRoleId; delete old.profile.phone;
  old.activities.forEach((a: any) => delete a.tools); delete old.captureDraft.tools;
  old.captureDraft.text = 'Unfinished'; old.captureDraft.roleId = 'role-2'; old.captureDraft.metric = '12%';
  old.versions[0].items[0].textOverride = 'Tailored before upgrade';
  const raw = JSON.stringify(old); let writes = 0;
  const repository = createLocalRepository({ getItem: async () => raw, setItem: async () => { writes++; } });
  const result = await repository.load(); assert.equal(writes, 0); assert.equal(result.schemaVersion, 2);
  assert.deepEqual(result.captureDraft, { ...old.captureDraft, tools: '' });
  assert.deepEqual(result.versions, old.versions); assert.deepEqual(result.roles, old.roles);
  assert.deepEqual(result.activities, old.activities.map((a: any) => ({ ...a, tools: [] })));
  assert.deepEqual(result.profile, { ...old.profile, phone: '' });
  assert.equal(result.defaultRoleId, 'role-1'); assert.equal(JSON.stringify(old), raw);
  assert.deepEqual(validateState(result), result);
  await repository.save(result); assert.equal(writes, 1);
  assert.throws(() => validateState({ ...result, schemaVersion: 99 }));
  assert.throws(() => validateState({ ...old, activities: [{ ...old.activities[0], ownerId: 'someone-else' }] }));
});
test('multiple current roles keep one default with deterministic fallback and no-current handling', () => {
  const s = demoState(); s.roles[1].end = ''; s.defaultRoleId = 'role-2';
  assert.equal(defaultCurrentRole(s), 'role-2');
  s.roles[1].end = '2025'; assert.equal(validateState(s).defaultRoleId, 'role-1');
  s.roles[0].end = '2024'; assert.equal(validateState(s).defaultRoleId, null);
  s.roles[1].end = ' present '; assert.equal(validateState(s).defaultRoleId, 'role-2');
  s.defaultRoleId = 'missing'; assert.equal(validateState(s).defaultRoleId, 'role-2');
});
test('archive groups retain bank order within each role, including independent entries', () => {
  const s = demoState(); s.activities.forEach(a => a.archived = true); s.activities[1].roleId = null;
  const before = structuredClone(s);
  const groups = groupAchievements(s.activities, s.roles);
  assert.deepEqual(groups.map(g => g.activities.map(a => a.id)), [['a1', 'a3'], ['a4', 'a5'], ['a2']]);
  assert.equal(groups[0].label, 'Operations Specialist · Example Studio'); assert.deepEqual(s, before);
});
test('tools persist separately from tags and stay out of resolved data; phone follows contact privacy', async () => {
  const s = demoState(); s.activities[0].tools = parseTools('Excel, SQL, Excel, '); s.profile.phone = '+61 400 123 456';
  let raw = ''; const repo = createLocalRepository({ getItem: async () => raw, setItem: async (_, v) => { raw = v; } });
  await repo.save(s); const loaded = await repo.load(); assert.deepEqual(toolOptions(loaded), ['Excel', 'SQL']);
  assert.deepEqual(loaded.activities[0].tags, s.activities[0].tags);
  assert.equal(resolveVersion(loaded, 'v1').contact?.phone, s.profile.phone);
  assert.ok(!JSON.stringify(resolveVersion(loaded, 'v1')).includes('Excel'));
  loaded.versions[0].hideContact = true; assert.ok(!JSON.stringify(resolveVersion(loaded, 'v1')).includes(s.profile.phone));
});
test('all templates resolve identical foundation/content and preserve masters, copies and snapshots', () => {
  const s = demoState(); const snapshot = createSnapshot(s, 'v1'); const before = structuredClone(snapshot);
  const original = structuredClone(s); s.versions.push(duplicateVersion(s.versions[0], 'copy'));
  const { template: _, ...expected } = resolveVersion(s, 'v1');
  for (const template of Object.keys(templates) as (keyof typeof templates)[]) {
    s.versions[1].template = template;
    const { template: __, ...actual } = resolveVersion(s, 'copy'); assert.deepEqual(actual, expected);
  }
  assert.deepEqual(s.versions[0], original.versions[0]); assert.deepEqual(s.activities, original.activities); assert.deepEqual(snapshot, before);
});

// Poppler is required for PDF content verification; do not silently skip if it is absent.
test('exported PDFs contain selectable content, private-contact filtering and bounded multipage text', async () => {
  const dir = resolve('dist/pdf-review'); mkdirSync(dir, { recursive: true });
  for (const template of Object.keys(templates) as (keyof typeof templates)[]) {
    for (const long of [false, true]) {
      const s = demoState(); s.profile.phone = '+61 400 123 456'; s.versions[0].template = template;
      if (long) { s.versions[0].hideContact = true; s.versions[0].summary = 'Long summary for pagination. '.repeat(100); s.activities[0].text = 'Detailed achievement with measurable outcomes. '.repeat(60); s.profile.education = Array.from({ length: 35 }, (_, i) => `Course ${i} · Example University`); }
      const r = resolveVersion(s, 'v1'); const bytes = await createResumePdf(r);
      const file = resolve(dir, `${template}${long ? '-long' : ''}.pdf`); writeFileSync(file, bytes);
      const doc = await PDFDocument.load(bytes); assert.ok(long ? doc.getPageCount() > 1 : doc.getPageCount() === 1);
      const text = execFileSync('pdftotext', [file, '-'], { encoding: 'utf8' });
      assert.match(text, /Alex Morgan/); assert.match(text, /Project Coordinator/); assert.match(text, /8 projects coordinated/);
      assert.doesNotMatch(text, /Resume App|Fictional|localhost|https?:\/\/|Page \d/);
      assert.equal((text.match(/Alex Morgan/g) || []).length, 1);
      if (long) { assert.doesNotMatch(text, /alex@example.com|123 456|Perth/); assert.match(text, /Course 34/); }
      else assert.match(text, /\+61 400 123 456/);
      const bbox = execFileSync('pdftotext', ['-bbox', file, '-'], { encoding: 'utf8' });
      for (const match of bbox.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)"/g)) {
        assert.ok(+match[1] >= 31 && +match[2] >= 30 && +match[3] < 565 && +match[4] < 810, `Text outside margins: ${match[0]}`);
      }
    }
  }
  const r = resolveVersion(demoState(), 'v1'); r.fullName = 'Unsupported 🦄'; await assert.rejects(createResumePdf(r), /font does not support/);
});
