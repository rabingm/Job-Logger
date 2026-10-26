import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoState, resolveVersion, duplicateVersion, createSnapshot, accessSnapshot, createVersion, moveItem, validateState, createLocalRepository } from '../src/index';

test('resolution is deterministic and overrides use null, not truthiness', () => {
  const state = demoState();
  state.versions[0].items[0].textOverride = '';
  assert.equal(resolveVersion(state, 'v1').roles[0].achievements[0].text, '');
  assert.deepEqual(resolveVersion(state, 'v1'), resolveVersion(state, 'v1'));
});
test('tailoring, hiding and duplication never change the bank or source version', () => {
  const state = demoState(); const before = structuredClone(state);
  const copy = duplicateVersion(state.versions[0], 'v2'); state.versions.push(copy);
  copy.items[0].textOverride = 'Tailored'; copy.items[1].visible = false; copy.sections.roles[1].visible = false;
  assert.deepEqual(state.activities, before.activities);
  assert.deepEqual(state.versions[0], before.versions[0]);
  assert.equal(resolveVersion(state, 'v2').roles[0].achievements[0].text, 'Tailored');
  assert.equal(resolveVersion(state, 'v2').roles.length, 1);
});
test('archive retains existing selections; new entries do not enter versions', () => {
  const state = demoState(); state.activities[0].archived = true;
  state.activities.push({ ...state.activities[0], id: 'new' });
  assert.equal(resolveVersion(state, 'v1').roles[0].achievements.length, 2);
  assert.equal(createVersion(state, 'empty', 'New version').items.length, 0);
});
test('snapshot survives master, profile, settings and returned-data mutations', () => {
  const state = demoState(); const snapshot = createSnapshot(state, 'v1'); const before = structuredClone(snapshot);
  state.activities[0].text = 'Changed'; state.profile.fullName = 'Changed'; state.versions[0].summary = 'Changed';
  const visible = accessSnapshot(snapshot, { published: true, expiresAt: null, hideContact: false })!;
  visible.roles[0].achievements[0].text = 'Mutated';
  assert.deepEqual(snapshot, before);
});
test('live access denies revocation, expiry, invalid dates and absent snapshots', () => {
  const publication = createSnapshot(demoState(), 'v1'); const now = new Date('2026-10-23T12:00:00Z');
  assert.equal(accessSnapshot(publication, { published: false, expiresAt: null, hideContact: false }, now), null);
  for (const expiresAt of ['2026-10-23T12:00:00Z', 'invalid', '2026-10-22']) assert.equal(accessSnapshot(publication, { published: true, expiresAt, hideContact: false }, now), null);
  assert.equal(accessSnapshot(null, { published: true, expiresAt: null, hideContact: false }), null);
  assert.ok(accessSnapshot(publication, { published: true, expiresAt: '2026-10-24', hideContact: false }, now));
  const hidden = accessSnapshot(publication, { published: true, expiresAt: null, hideContact: true });
  assert.equal(hidden?.contact, null); assert.ok(!JSON.stringify(hidden).includes('alex@example.com'));
});
test('cross-owner references, duplicate selections and invalid dates are rejected', () => {
  for (const mutate of [
    (s: ReturnType<typeof demoState>) => { s.activities[0].ownerId = 'other'; },
    (s: ReturnType<typeof demoState>) => { s.roles[0].ownerId = 'other'; },
    (s: ReturnType<typeof demoState>) => { s.versions[0].ownerId = 'other'; },
    (s: ReturnType<typeof demoState>) => { s.versions[0].items.push(s.versions[0].items[0]); },
    (s: ReturnType<typeof demoState>) => { s.activities[0].happenedOn = '2026-02-30'; },
    (s: ReturnType<typeof demoState>) => { s.activities[0].roleId = 'unknown'; }
  ]) { const state = demoState(); mutate(state); assert.throws(() => validateState(state)); }
});
test('accessible reorder has safe boundaries', () => {
  assert.deepEqual(moveItem(['a', 'b', 'c'], 1, -1), ['b', 'a', 'c']);
  assert.deepEqual(moveItem(['a', 'b'], 0, -1), ['a', 'b']);
});
test('repository serializes saves and round-trips drafts; corruption is not silently replaced', async () => {
  let raw: string | null = null;
  const repo = createLocalRepository({ getItem: async () => raw, setItem: async (_, value) => { await new Promise(r => setTimeout(r, 5)); raw = value; } });
  const first = demoState(); first.captureDraft.text = 'Draft one';
  const second = structuredClone(first); second.captureDraft.text = 'Draft two';
  await Promise.all([repo.save(first), repo.save(second)]);
  assert.equal((await repo.load()).captureDraft.text, 'Draft two');
  raw = '{bad'; await assert.rejects(repo.load());
});
test('failed save can be retried without poisoning the write queue', async () => {
  let fail = true; let stored = '';
  const repo = createLocalRepository({ getItem: async () => stored || null, setItem: async (_, value) => { if (fail) throw Error('Disk full'); stored = value; } });
  await assert.rejects(repo.save(demoState())); fail = false;
  await repo.save(demoState()); assert.equal((await repo.load()).versions.length, 1);
});
