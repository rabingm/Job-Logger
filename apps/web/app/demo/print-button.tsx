'use client';
import { useState } from 'react';
import type { ResolvedResume } from '@resume/core';
export function PrintButton({ resume }: { resume: ResolvedResume }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  return <><button className="button" disabled={busy} onClick={async () => {
    setBusy(true); setError('');
    try {
      const { createResumePdf } = await import('@resume/core/pdf');
      const bytes = await createResumePdf(resume);
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
      const link = document.createElement('a'); link.href = url; link.download = 'resume.pdf'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) { setError(e instanceof Error ? e.message : 'Export failed. Please retry.'); } finally { setBusy(false); }
  }}>{busy ? 'Preparing PDF…' : 'Download PDF'}</button>{error && <p role="alert">{error}</p>}</>;
}
