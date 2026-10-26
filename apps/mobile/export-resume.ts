import { Platform } from 'react-native';
import type { ResolvedResume } from '@resume/core';
import { createResumePdf } from '@resume/core/pdf';

export async function exportResume(resume: ResolvedResume) {
  const bytes = await createResumePdf(resume);
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
    const link = document.createElement('a'); link.href = url; link.download = 'resume.pdf';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } else {
    const { File, Paths } = await import('expo-file-system');
    const { isAvailableAsync, shareAsync } = await import('expo-sharing');
    if (!await isAvailableAsync()) throw Error('PDF sharing is unavailable on this device.');
    const file = new File(Paths.cache, `resume-${Date.now()}.pdf`);
    try { file.write(bytes); await shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' }); }
    finally { if (file.exists) file.delete(); }
  }
}
