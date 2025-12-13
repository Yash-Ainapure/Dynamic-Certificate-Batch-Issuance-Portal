import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Batch, Certificate } from '../types';
import { getBatch, listCertificates, retryFailed, deleteBatch, downloadBatchZip } from '../api/batches';
import { getIssuanceStatus, startIssuance } from '../api/issuance';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { useToast } from '../components/common/toast';
import { buildVerifyUrl } from '../utils/url';
import Section from '../components/common/Section';

export default function BatchDetail() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [certs, setCerts] = useState<Certificate[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [polling, setPolling] = useState(false);
  const { show } = useToast();

  const isProcessing = useMemo(
    () => batch?.processingStatus === 'PROCESSING' || batch?.processingStatus === 'QUEUED',
    [batch]
  );

  const prevStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    async function init() {
      if (!batchId) return;
      try {
        const b = await getBatch(batchId);
        setBatch(b);
        await loadCerts('');
        if (b.processingStatus === 'PROCESSING' || b.processingStatus === 'QUEUED') {
          setPolling(true);
        }
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  useEffect(() => {
    if (!polling || !batchId) return;
    const id = setInterval(async () => {
      try {
        const s = await getIssuanceStatus(batchId);
        setBatch(s);
        const prev = prevStatusRef.current;
        prevStatusRef.current = s.processingStatus;
        if (s.processingStatus === 'COMPLETED' || s.processingStatus === 'FAILED') {
          setPolling(false);
          // refresh certificates list once issuance finishes
          await loadCerts('');
          show(
            s.processingStatus === 'COMPLETED' ? 'Issuance completed. Certificates updated.' : 'Issuance failed. Latest results loaded.',
            s.processingStatus === 'COMPLETED' ? 'success' : 'error'
          );
        } else if (prev && prev !== s.processingStatus) {
          // on any status transition while processing, refresh lightweight
          await loadCerts('');
        }
      } catch {
        // no-op
      }
    }, 2500);
    return () => clearInterval(id);
  }, [polling, batchId]);

  async function loadCerts(cursor?: string) {
    if (!batchId) return;
    const res = await listCertificates({ batchId, status: statusFilter || undefined, limit: 20, cursor });
    setCerts((prev) => (cursor ? [...prev, ...res.items] : res.items));
    setNextCursor(res.nextCursor);
  }

  async function handleStart() {
    if (!batchId) return;
    setStarting(true);
    try {
      await startIssuance(batchId);
      setPolling(true);
      show('Issuance started', 'success');
    } catch (e) {
      show((e as Error).message, 'error');
    } finally {
      setStarting(false);
    }
  }

  async function handleRetry() {
    if (!batchId) return;
    setRetrying(true);
    try {
      await retryFailed(batchId);
      setPolling(true);
      show('Retry triggered for failed certificates', 'success');
    } catch (e) {
      show((e as Error).message, 'error');
    } finally {
      setRetrying(false);
    }
  }

  async function handleDelete() {
    if (!batchId || !batch) return;
    const ok = window.confirm('Delete this batch and its files?');
    if (!ok) return;
    setDeleting(true);
    try {
      const deleted = await deleteBatch(batchId);
      if (deleted) {
        show('Batch deleted', 'success');
        navigate(`/projects/${batch.projectId}`);
      }
    } catch (e) {
      show((e as Error).message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function handleDownload() {
    if (!batchId) return;
    setDownloading(true);
    try {
      const blob = await downloadBatchZip(batchId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `certificates_batch_${batchId}.zip`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      show('Download started', 'success');
    } catch (e) {
      show((e as Error).message, 'error');
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    // refetch certificates when filter changes
    loadCerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  if (loading) return <div className="p-6 text-gray-500 dark:text-gray-400">Loading batch…</div>;
  if (!batch) return <div className="p-6 text-red-600 dark:text-red-400">Batch not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-gray-400 text-black ">Batch {batch.id}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Section>
          <div className="text-gray-800 dark:text-gray-200">Validation: <span className="font-medium">{batch.validationStatus}</span></div>
          <div className="text-gray-800 dark:text-gray-200">Processing: <span className="font-medium">{batch.processingStatus}</span></div>
          <div className="text-sm text-gray-700 dark:text-gray-300">Totals: {batch.totalRecords ?? 0} | Valid: {batch.validRecords ?? 0}</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">Processed: {batch.processedCount ?? 0} | Success: {batch.successCount ?? 0} | Failed: {batch.failedCount ?? 0}</div>
          <div className="pt-2">
            <ProgressBar value={((batch.processedCount ?? 0) / Math.max(1, batch.totalRecords ?? 0)) * 100} />
          </div>
        </Section>
        <Section>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleStart} disabled={starting || isProcessing || batch.validationStatus !== 'VALID'}>
              {starting ? 'Starting…' : 'Start Issuance'}
            </Button>
            <Button onClick={handleRetry} disabled={retrying || isProcessing || (batch.failedCount ?? 0) === 0} variant="secondary">
              {retrying ? 'Retrying…' : 'Retry Failed'}
            </Button>
            <Button onClick={handleDownload} disabled={downloading} variant="secondary">
              {downloading ? 'Preparing…' : 'Download ZIP'}
            </Button>
            <Button onClick={handleDelete} disabled={deleting} variant="danger">
              {deleting ? 'Deleting…' : 'Delete Batch'}
            </Button>
            {/* Status pill */}
            {batch.processingStatus === 'COMPLETED' && (
              <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 px-2 py-1 text-xs font-medium">Completed</span>
            )}
            {batch.processingStatus === 'FAILED' && (
              <span className="inline-flex items-center rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 px-2 py-1 text-xs font-medium">Failed</span>
            )}
            {(batch.processingStatus === 'PROCESSING' || batch.processingStatus === 'QUEUED') && (
              <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-1 text-xs font-medium">
                <span className="mr-1 h-3 w-3 inline-block border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
                {batch.processingStatus === 'QUEUED' ? 'Queued' : 'Processing…'}
              </span>
            )}
          </div>
          {isProcessing && <div className="text-sm text-gray-600 dark:text-gray-400">Polling for updates… Certificates will refresh automatically when done.</div>}
          {batch.validationStatus === 'INVALID' && (
            <div className="text-sm text-red-600 dark:text-red-400">This batch is INVALID. Fix issues and re-upload a new batch.</div>
          )}
        </Section>
      </div>

      {batch.validationStatus === 'INVALID' && (
        <Section title="Validation Summary" className="space-y-2">
          <div className="text-sm text-white">Status: <span className="text-red-600 dark:text-red-400">INVALID</span></div>
          <div className="text-sm text-white">Total: {batch.totalRecords ?? 0} | Valid: {batch.validRecords ?? 0}</div>
          <div className="text-sm text-white">Missing: {batch.missingFilesCount ?? 0} | Extra: {batch.extraFilesCount ?? 0} | Duplicate in ZIP: {batch.duplicateFilesCount ?? 0}</div>
          {Array.isArray(batch.validationErrors) && batch.validationErrors.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer select-none text-white">Show errors ({batch.validationErrors.length})</summary>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                {batch.validationErrors.slice(0, 100).map((e: any, idx: number) => (
                  <li key={idx} className="text-red-600 dark:text-red-400">
                    {e.message}{e.rowNumber ? ` (row ${e.rowNumber})` : ''}{e.fileName ? ` [${e.fileName}]` : ''}
                  </li>
                ))}
                {batch.validationErrors.length > 100 && (
                  <li className="text-gray-500 dark:text-gray-400">+{batch.validationErrors.length - 100} more…</li>
                )}
              </ul>
            </details>
          )}
        </Section>
      )}

      <Section title="Certificates" className="space-y-3">
        <div className="flex items-center gap-3">
          <select className="border p-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="ISSUED">Issued</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <div className="rounded border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
          <div className="grid grid-cols-5 text-sm font-medium bg-gray-50 dark:bg-gray-950 p-2 text-gray-900 dark:text-gray-100">
            <div>ID</div>
            <div>Excel Cert ID</div>
            <div>File</div>
            <div>Status</div>
            <div>Action</div>
          </div>
          {certs.map((c) => (
            <div key={c.id} className="grid grid-cols-5 items-center text-sm p-2 text-gray-800 dark:text-gray-200">
              <div className="truncate" title={c.id}>{c.id}</div>
              <div>{c.excelCertId}</div>
              <div className="truncate" title={c.fileName}>{c.fileName}</div>
              <div>{c.status}</div>
              <div>
                {c.status === 'ISSUED' ? (
                  <a className="text-blue-600 hover:underline" href={buildVerifyUrl(c.id)} target="_blank" rel="noreferrer">
                    Open verification
                  </a>
                ) : c.status === 'FAILED' ? (
                  <span title={c.validationError || ''} className="text-red-600 dark:text-red-400">View error</span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">—</span>
                )}
              </div>
            </div>
          ))}
          {certs.length === 0 && <div className="p-3 text-gray-500 dark:text-gray-400">No certificates.</div>}
        </div>
        {nextCursor && (
          <Button onClick={() => loadCerts(nextCursor)} variant="secondary">Load more</Button>
        )}
      </Section>
    </div>
  );
}
