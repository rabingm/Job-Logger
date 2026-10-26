import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { ResolvedResume } from './index';
import { pdfFont } from './pdf-font';

/** Entirely local, selectable-text A4 export. No browser printing or remote font fetches. */
export async function createResumePdf(resume: ResolvedResume): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(pdfFont, { subset: true });
  const supported = new Set(font.getCharacterSet());
  const width = 595.28, height = 841.89, margin = 42;
  const split = resume.template !== 'clean';
  const pages: ReturnType<typeof doc.addPage>[] = [];
  const pageAt = (index: number) => {
    while (pages.length <= index) {
      const p = doc.addPage([width, height]);
      if (resume.template === 'soft-accent') p.drawRectangle({ x: margin - 10, y: margin, width: 165, height: height - 2 * margin, color: rgb(.87, .93, .91) });
      if (resume.template === 'modern-split') p.drawLine({ start: { x: 207, y: margin }, end: { x: 207, y: height - margin }, thickness: .6, color: rgb(.8, .85, .83) });
      pages.push(p);
    }
    return pages[index];
  };
  const normalized = (text: string) => {
    const value = text.replace(/\t/g, ' ').replace(/[\r\u0000-\u0008\u000b-\u001f]/g, '').normalize('NFC');
    for (const c of value) if (c !== '\n' && !supported.has(c.codePointAt(0)!)) throw Error('PDF font does not support a character in this résumé. Please use supported text before exporting.');
    return value;
  };
  function column(x: number, w: number, initialY: number) {
    let index = 0, y = initialY;
    const room = (needed: number) => { if (y - needed < margin) { index++; y = height - margin; } };
    const text = (value: string, size = 10.5, heading = false) => {
      if (!value.trim()) return;
      const lines: string[] = [];
      for (const paragraph of normalized(value).split('\n')) {
        let line = '';
        for (const word of paragraph.split(/\s+/)) {
          const candidate = line ? line + ' ' + word : word;
          if (font.widthOfTextAtSize(candidate, size) <= w) { line = candidate; continue; }
          if (line) lines.push(line);
          line = '';
          for (const char of word) {
            if (font.widthOfTextAtSize(line + char, size) > w && line) { lines.push(line); line = ''; }
            line += char;
          }
        }
        lines.push(line);
      }
      const leading = size * 1.5;
      room(heading ? leading * Math.min(lines.length + 2, 5) : leading * (lines.length <= 10 ? lines.length : 2));
      for (const line of lines) { room(leading); pageAt(index).drawText(line, { x, y: y - size, size, font, color: rgb(.09, .20, .18) }); y -= leading; }
      y -= heading ? 6 : 9;
    };
    return { text, y: () => y };
  }
  // The name is included once, as résumé content; continuation pages have no running headers.
  const header = column(split ? 225 : margin, split ? 328 : width - 2 * margin, height - margin);
  header.text(resume.fullName, 24, true); header.text(resume.headline, 12);
  const bodyY = header.y() - 10;
  const foundation = column(margin, split ? 145 : width - 2 * margin, split ? height - margin : bodyY);
  if (resume.contact) foundation.text([resume.contact.email, resume.contact.phone, resume.contact.location].filter(Boolean).join('\n'));
  if (resume.skills.length) { foundation.text('SKILLS', 11, true); resume.skills.forEach(v => foundation.text(v)); }
  if (resume.education.length) { foundation.text('EDUCATION', 11, true); resume.education.forEach(v => foundation.text(v)); }
  const main = split ? column(225, 328, bodyY) : foundation;
  if (resume.summary) { main.text('PROFILE', 11, true); main.text(resume.summary); }
  if (resume.roles.length) main.text('EXPERIENCE', 11, true);
  const achievement = (a: ResolvedResume['otherAchievements'][number]) => { main.text(a.text ? '• ' + a.text : ''); if (a.metric) main.text(a.metric); };
  for (const role of resume.roles) {
    main.text(role.title, 12, true);
    main.text([role.employer, [role.start, role.end || 'Present'].filter(Boolean).join(' — ')].filter(Boolean).join(' · '));
    role.achievements.forEach(achievement);
  }
  if (resume.otherAchievements.length) { main.text('SELECTED ACHIEVEMENTS', 11, true); resume.otherAchievements.forEach(achievement); }
  if (!pages.length) pageAt(0);
  return doc.save();
}
