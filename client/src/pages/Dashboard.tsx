import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRecentProjects } from '../utils/recent';
import Section from '../components/common/Section';
import Skeleton from '../components/common/Skeleton';
import { listProjects } from '../api/projects';
import type { Project } from '../types';

export default function Dashboard() {
  const recent = getRecentProjects();
  const [projects, setProjects] = useState<Project[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(cursor?: string) {
    setLoading(!cursor);
    try {
      const res = await listProjects({ limit: 12, cursor });
      setProjects((prev) => (cursor ? [...prev, ...res.items] : res.items));
      setNextCursor(res.nextCursor);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">Start a new project</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create a project, upload a template PDF, and choose QR placement.</p>
          <Link to="/projects/new" className="inline-block mt-4 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Create Project</Link>
        </div>
      </div>

      <Section title="Recent Projects">
        {recent.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">No recent projects. Create a new project to get started.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {recent.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="rounded border border-gray-200 dark:border-gray-800 p-3 hover:bg-gray-50 dark:hover:bg-gray-900">
                <div className="font-medium text-gray-900 dark:text-gray-100">{p.name || p.id}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Viewed {new Date(p.viewedAt).toLocaleString()}</div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="All Projects">
        {loading && projects.length === 0 ? (
          <div className="grid md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">No projects found.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="rounded border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Issuer: {p.issuer}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Created: {p.createdAt ? new Date(p.createdAt as any).toLocaleDateString() : ''}</div>
              </Link>
            ))}
          </div>
        )}
        {nextCursor && (
          <div className="mt-4">
            <button onClick={() => load(nextCursor)} className="text-sm text-blue-600 hover:underline">Load more</button>
          </div>
        )}
      </Section>

      <Section title="How it works">
        <ol className="mt-1 space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
          <li>Create a Project and place the QR by clicking on the PDF preview.</li>
          <li>Upload a ZIP with PDFs and an Excel mapping file; review the validation summary.</li>
          <li>Start issuance and track progress; open verification links for issued certificates.</li>
        </ol>
      </Section>
    </div>
  );
}
