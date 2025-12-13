import React, { useState } from 'react';
import Button from '../../components/common/Button';
import PdfPreview from './PdfPreview';
import { createProject } from '../../api/projects';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/common/toast';
import { upsertRecentProject } from '../../utils/recent';

export default function CreateProjectForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [template, setTemplate] = useState<File | null>(null);
  const [picked, setPicked] = useState<{ x: number; y: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { show } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!template || !picked) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', description);
      fd.append('issuer', issuer);
      fd.append('issueDate', issueDate);
      fd.append('qrX', String(picked.x));
      fd.append('qrY', String(picked.y));
      fd.append('template', template);
      const project = await createProject(fd);
      show('Project created', 'success');
      upsertRecentProject({ id: project.id, name: project.name || name });
      navigate(`/projects/${project.id}`);
    } catch (err) {
      show((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-6 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-3">
        <input className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 w-full rounded" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 w-full rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 w-full rounded" placeholder="Issuer" value={issuer} onChange={(e) => setIssuer(e.target.value)} required />
        <input className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 w-full rounded" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
        <input className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 w-full rounded" type="file" accept="application/pdf" onChange={(e) => setTemplate(e.target.files?.[0] || null)} required />
        <Button type="submit" disabled={!template || !picked || submitting}>{submitting ? 'Creating…' : 'Create Project'}</Button>
        {!picked && <div className="text-sm text-gray-500">Pick a QR position on the preview to enable submit.</div>}
      </div>
      <div>
        <PdfPreview file={template} picked={picked || undefined} onPick={setPicked} />
      </div>
    </form>
  );
}
