import { z } from 'zod';

const id = z.string().min(1);
const short = z.string().max(200);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, 'Use a valid date (YYYY-MM-DD)');
const roleSchema = z.object({ id, ownerId: id, employer: short, title: short, start: short, end: short });
const activitySchema = z.object({ id, ownerId: id, roleId: id.nullable(), text: z.string().trim().min(1).max(3000), metric: short, happenedOn: date, tags: z.array(short).max(20), archived: z.boolean() });
const profileSchema = z.object({ id, fullName: short, headline: short, email: z.union([z.literal(''), z.email()]), location: short, education: z.array(short), skills: z.array(short) });
const selectionSchema = z.object({ id, visible: z.boolean() });
const versionSchema = z.object({
  id, ownerId: id, name: z.string().trim().min(1).max(100), template: z.literal('clean'),
  headline: short.nullable(), summary: z.string().max(3000), hideContact: z.boolean(),
  items: z.array(z.object({ activityId: id, visible: z.boolean(), textOverride: z.string().max(3000).nullable() })),
  sections: z.object({ roles: z.array(selectionSchema), education: z.boolean(), skills: z.boolean() })
});
export const stateSchema = z.object({
  schemaVersion: z.literal(1), onboarded: z.boolean(), profile: profileSchema,
  roles: z.array(roleSchema), activities: z.array(activitySchema), versions: z.array(versionSchema),
  captureDraft: z.object({ text: z.string(), metric: z.string(), date: z.string(), tags: z.string(), roleId: z.string() })
});
export type State = z.infer<typeof stateSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type Version = z.infer<typeof versionSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Role = z.infer<typeof roleSchema>;
export type ResolvedResume = {
  schemaVersion: 1; template: 'clean'; fullName: string; headline: string; summary: string;
  contact: { email: string; location: string } | null;
  roles: (Omit<Role, 'ownerId'> & { achievements: { id: string; text: string; metric: string }[] })[];
  otherAchievements: { id: string; text: string; metric: string }[];
  education: string[]; skills: string[];
};

export function validateState(input: unknown): State {
  const state = stateSchema.parse(input);
  const unique = (values: string[]) => { if (new Set(values).size !== values.length) throw new Error('Duplicate identifiers'); };
  unique(state.activities.map(a => a.id)); unique(state.roles.map(r => r.id)); unique(state.versions.map(v => v.id));
  for (const role of state.roles) if (role.ownerId !== state.profile.id) throw new Error('Role ownership mismatch');
  for (const activity of state.activities) {
    if (activity.ownerId !== state.profile.id) throw new Error('Activity ownership mismatch');
    if (activity.roleId && !state.roles.some(r => r.id === activity.roleId)) throw new Error('Missing activity role');
  }
  for (const version of state.versions) {
    if (version.ownerId !== state.profile.id) throw new Error('Version ownership mismatch');
    unique(version.items.map(i => i.activityId)); unique(version.sections.roles.map(r => r.id));
    for (const item of version.items) if (!state.activities.some(a => a.id === item.activityId)) throw new Error('Missing activity');
    for (const role of version.sections.roles) if (!state.roles.some(r => r.id === role.id)) throw new Error('Missing role');
  }
  return state;
}

export function resolveVersion(input: State, versionId: string): ResolvedResume {
  const state = validateState(input);
  const version = state.versions.find(v => v.id === versionId);
  if (!version) throw new Error('Résumé not found');
  const selected = version.items.filter(i => i.visible).map(item => {
    const activity = state.activities.find(a => a.id === item.activityId)!;
    return { id: activity.id, roleId: activity.roleId, text: item.textOverride ?? activity.text, metric: activity.metric };
  });
  const stripRole = ({ roleId: _, ...achievement }: typeof selected[number]) => achievement;
  return {
    schemaVersion: 1, template: version.template, fullName: state.profile.fullName,
    headline: version.headline ?? state.profile.headline, summary: version.summary,
    contact: version.hideContact ? null : { email: state.profile.email, location: state.profile.location },
    roles: version.sections.roles.filter(r => r.visible).map(selection => {
      const { ownerId: _, ...role } = state.roles.find(r => r.id === selection.id)!;
      return { ...role, achievements: selected.filter(a => a.roleId === role.id).map(stripRole) };
    }),
    otherAchievements: selected.filter(a => a.roleId === null).map(stripRole),
    education: version.sections.education ? [...state.profile.education] : [],
    skills: version.sections.skills ? [...state.profile.skills] : []
  };
}

export function duplicateVersion(version: Version, newId: string): Version {
  return versionSchema.parse({ ...JSON.parse(JSON.stringify(version)), id: newId, name: `${version.name.slice(0, 90)} · copy` });
}
export function createVersion(state: State, newId: string, name: string): Version {
  return versionSchema.parse({ id: newId, ownerId: state.profile.id, name, template: 'clean', headline: null, summary: '', hideContact: false,
    items: [], sections: { roles: state.roles.map(r => ({ id: r.id, visible: true })), education: true, skills: true } });
}
export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const result = [...items];
  const next = index + direction;
  if (index < 0 || index >= items.length || next < 0 || next >= items.length) return result;
  [result[index], result[next]] = [result[next], result[index]];
  return result;
}
// Pure domain rules for future backend use. These are NOT authentication or a public endpoint.
export type Publication = { snapshot: ResolvedResume; publishedAt: string };
export function createSnapshot(state: State, versionId: string, now = new Date()): Publication {
  return { snapshot: resolveVersion(state, versionId), publishedAt: now.toISOString() };
}
export function accessSnapshot(publication: Publication | null, policy: { published: boolean; expiresAt: string | null; hideContact: boolean }, now = new Date()): ResolvedResume | null {
  if (!publication || !policy.published) return null;
  if (policy.expiresAt && (!Number.isFinite(Date.parse(policy.expiresAt)) || Date.parse(policy.expiresAt) <= now.valueOf())) return null;
  const copy: ResolvedResume = JSON.parse(JSON.stringify(publication.snapshot));
  if (policy.hideContact) copy.contact = null;
  return copy;
}

export function demoState(): State {
  return validateState({ schemaVersion: 1, onboarded: false,
    profile: { id: 'demo-alex', fullName: 'Alex Morgan', headline: 'Operations specialist · Making good work repeatable', email: 'alex@example.com', location: 'Perth, Australia', education: ['Bachelor of Business · Example University · 2019'], skills: ['Process improvement', 'Project coordination', 'Stakeholder communication', 'Data analysis'] },
    roles: [{ id: 'role-1', ownerId: 'demo-alex', employer: 'Example Studio', title: 'Operations Specialist', start: '2022', end: 'Present' }, { id: 'role-2', ownerId: 'demo-alex', employer: 'Sample Works', title: 'Project Coordinator', start: '2019', end: '2022' }],
    activities: [
      { id: 'a1', roleId: 'role-1', text: 'Redesigned the team’s weekly reporting process, giving colleagues more time for customer work.', metric: '6 hours saved each week', tags: ['Operations', 'Impact'], happenedOn: '2026-10-20' },
      { id: 'a2', roleId: 'role-1', text: 'Created a welcoming onboarding guide and buddy system for new team members.', metric: '12 colleagues onboarded', tags: ['People'], happenedOn: '2026-10-14' },
      { id: 'a3', roleId: 'role-1', text: 'Coordinated a cross-functional launch, keeping milestones visible and stakeholders aligned.', metric: 'Delivered 2 weeks early', tags: ['Leadership', 'Projects'], happenedOn: '2026-10-02' },
      { id: 'a4', roleId: 'role-2', text: 'Built a shared project tracker that helped the team identify risks earlier.', metric: '8 projects coordinated', tags: ['Projects'], happenedOn: '2021-11-10' },
      { id: 'a5', roleId: 'role-2', text: 'Turned recurring customer feedback into a practical service improvement plan.', metric: '', tags: ['Customer experience'], happenedOn: '2021-08-18' }
    ].map(a => ({ ...a, ownerId: 'demo-alex', archived: false })),
    versions: [{ id: 'v1', ownerId: 'demo-alex', name: 'Operations & impact', template: 'clean', headline: null,
      summary: 'Thoughtful operations professional who brings structure to complex work. Experienced in improving everyday processes and helping teams deliver together.', hideContact: false,
      items: ['a1', 'a3', 'a4'].map(activityId => ({ activityId, visible: true, textOverride: null })),
      sections: { roles: [{ id: 'role-1', visible: true }, { id: 'role-2', visible: true }], education: true, skills: true } }],
    captureDraft: { text: '', metric: '', date: new Date().toLocaleDateString('en-CA'), tags: '', roleId: 'role-1' }
  });
}

export interface LocalStoragePort { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> }
export function createLocalRepository(storage: LocalStoragePort) {
  const key = 'resume-app.fictional-demo.v1';
  let queue = Promise.resolve();
  return {
    async load(): Promise<State> { const raw = await storage.getItem(key); return raw === null ? demoState() : validateState(JSON.parse(raw)); },
    save(state: State): Promise<void> {
      const serialized = JSON.stringify(validateState(state));
      const job = queue.catch(() => {}).then(() => storage.setItem(key, serialized));
      queue = job;
      return job;
    }
  };
}
