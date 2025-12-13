import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Section from '../components/common/Section';
import Button from '../components/common/Button';
import { buildApiUrl } from '../utils/url';

export default function VerifyPage() {
  const { certId } = useParams<{ certId: string }>();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!certId) return;
      setLoading(true);
      try {
        // Ask server but do not auto-follow redirect; if it's a redirect to the PDF, we treat as verified.
        const resp = await fetch(buildApiUrl(`/verify/${certId}`), {
          method: 'GET',
          redirect: 'manual',
        });
        if (cancelled) return;
        // In manual mode, successful redirect becomes 'opaqueredirect' in many browsers. Treat it as verified.
        if (resp.ok || resp.type === 'opaqueredirect') {
          setVerified(true);
          setErrorMsg(null);
        } else {
          setVerified(false);
          setErrorMsg(`Server responded ${resp.status}`);
        }
      } catch (e: any) {
        if (cancelled) return;
        setVerified(false);
        setErrorMsg(e?.message || 'Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [certId]);

  const viewerUrl = certId ? buildApiUrl(`/verify/${certId}`) : '';

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Certificate Verification</h1>

      {loading && (
        <Section>
          <div className="text-gray-700 dark:text-gray-300">Verifying certificate…</div>
        </Section>
      )}

      {!loading && verified === true && (
        <>
          <Section>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
              This certificate is verified.
            </div>
          </Section>
          <Section>
            <div className="aspect-[1/1.3] w-full">
              <iframe title="Certificate PDF" src={viewerUrl} className="w-full h-full border border-gray-200 dark:border-gray-800 rounded" />
            </div>
            <div className="pt-3">
              <a href={viewerUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary">Open/Download PDF</Button>
              </a>
            </div>
          </Section>
        </>
      )}

      {!loading && verified === false && (
        <Section>
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-medium">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
            This is not a verified certificate.
          </div>
          {errorMsg && <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{errorMsg}</div>}
        </Section>
      )}
    </div>
  );
}
