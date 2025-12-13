import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProject, deleteProject } from '../api/projects';
import { getBatches, uploadBatchZip, deleteBatch } from '../api/batches';
import type { Batch, Project } from '../types';
import Button from '../components/common/Button';
import { useToast } from '../components/common/toast';
import Section from '../components/common/Section';
import Skeleton from '../components/common/Skeleton';
import { upsertRecentProject } from '../utils/recent';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSummary, setLastSummary] = useState<any | null>(null);
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [deletingBatchId, setDeletingBatchId] = useState<string | null>(null);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const { show } = useToast();

  useEffect(() => {
    if (!id) return;
    getProject(id)
      .then((p) => {
        setProject(p);
        if (p?.id) upsertRecentProject({ id: p.id, name: p.name || '' });
      })
      .catch((e) => show((e as Error).message, 'error'));
    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadBatches(cursor?: string) {
    if (!id) return;
    if (!cursor) setLoadingBatches(true);
    try {
      const res = await getBatches({ projectId: id, limit: 20, cursor });
      setBatches((prev) => (cursor ? [...prev, ...res.items] : res.items));
      setNextCursor(res.nextCursor);
    } catch (e) {
      show((e as Error).message, 'error');
    } finally {
      setLoadingBatches(false);
    }
  }

  async function handleDeleteProject() {
    if (!id) return;
    const ok = window.confirm('Delete this project and all its batches and files? This cannot be undone.');
    if (!ok) return;
    setDeletingProject(true);
    try {
      await deleteProject(id);
      // Backend now queues the deletion; inform the user and navigate away
      show('Project deletion queued', 'success');
      navigate('/');
    } catch (e) {
      show((e as Error).message, 'error');
    } finally {
      setDeletingProject(false);
    }
  }

  async function handleDeleteBatch(batchId: string) {
    const ok = window.confirm('Delete this batch and its files?');
    if (!ok) return;
    setDeletingBatchId(batchId);
    try {
      await deleteBatch(batchId);
      // Optimistically remove from UI; deletion runs in background
      setBatches((prev) => prev.filter((b) => b.id !== batchId));
      show('Batch deletion queued', 'success');
    } catch (e) {
      show((e as Error).message, 'error');
    } finally {
      setDeletingBatchId(null);
    }
  }

  async function handleUpload() {
    if (!id || !zipFile) return;
    setLoading(true);
    try {
      const { batch, summary } = await uploadBatchZip({ projectId: id, zip: zipFile });
      // Prepend newest batch
      setBatches((prev) => [batch, ...prev]);
      setZipFile(null);
      setLastSummary(summary);
      setCreatedBatchId(batch.id);
      show(`Batch uploaded (${summary.validationStatus})`, summary.validationStatus === 'VALID' ? 'success' : 'info');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Project Details</h1>
      {project ? (
        <Section>
          <div className="font-medium text-gray-900 dark:text-gray-100">{project.name}</div>
          <div className="text-sm text-white">{project.description}</div>
          <div className="text-sm text-white">Issuer: {project.issuer}</div>
          <div className="text-sm text-white">Issue Date: {project.issueDate}</div>
          <div className="text-sm text-white">QR: ({project.qrX}, {project.qrY})</div>
          <div className="pt-3">
            <Button onClick={handleDeleteProject} variant="danger" disabled={deletingProject}>
              {deletingProject ? 'Deleting…' : 'Delete Project'}
            </Button>
          </div>
        </Section>
      ) : (
        <Section>
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Section>
      )}

      <Section title="Upload Batch ZIP" className="space-y-3">
        <input className='text-white' type="file" accept=".zip" onChange={(e) => setZipFile(e.target.files?.[0] || null)} />
        <div>
          <Button disabled={!zipFile || loading} onClick={handleUpload}>
            {loading ? 'Uploading...' : 'Upload ZIP'}
          </Button>
        </div>
        {lastSummary && (
          <Section title="Validation Summary">
            <div className="text-sm">Status: <span className={lastSummary.validationStatus === 'VALID' ? 'text-green-600' : 'text-red-600'}>{lastSummary.validationStatus}</span></div>
            <div className="text-sm">Total: {lastSummary.totalRecords} | Valid: {lastSummary.validRecords}</div>
            <div className="text-sm">Missing: {lastSummary.missingFilesCount} | Extra: {lastSummary.extraFilesCount} | Duplicate in ZIP: {lastSummary.duplicateFilesCount}</div>
            {Array.isArray(lastSummary.errors) && lastSummary.errors.length > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer select-none">Show errors ({lastSummary.errors.length})</summary>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  {lastSummary.errors.slice(0, 50).map((e: any, idx: number) => (
                    <li key={idx} className="text-red-600 dark:text-red-400">
                      {e.message}{e.rowNumber ? ` (row ${e.rowNumber})` : ''}{e.fileName ? ` [${e.fileName}]` : ''}
                    </li>
                  ))}
                  {lastSummary.errors.length > 50 && <li className="text-gray-500 dark:text-gray-400">+{lastSummary.errors.length - 50} more…</li>}
                </ul>
              </details>
            )}
            {createdBatchId && (
              <div className="pt-2">
                <Link className="text-blue-600 hover:underline" to={`/batches/${createdBatchId}`}>Open created batch →</Link>
              </div>
            )}
          </Section>
        )}
      </Section>

      <Section title="Batches" className="space-y-3">
        {loadingBatches && batches.length === 0 ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {batches.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded p-3 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                <Link to={`/batches/${b.id}`} className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">Batch {b.id}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Validation: {b.validationStatus} | Processing: {b.processingStatus}</div>
                </Link>
                <div className="pl-3">
                  <Button
                    variant="danger"
                    disabled={deletingBatchId === b.id}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteBatch(b.id); }}
                  >
                    {deletingBatchId === b.id ? 'Deleting…' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))}
            {batches.length === 0 && !loadingBatches && <div className="text-gray-500 dark:text-gray-400">No batches yet.</div>}
          </div>
        )}
        {nextCursor && (
          <Button onClick={() => loadBatches(nextCursor)} variant="secondary">Load more</Button>
        )}
      </Section>
    </div>
  );
}
