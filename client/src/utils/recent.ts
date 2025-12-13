export type RecentProject = { id: string; name: string; viewedAt: number };

const KEY = 'aicerts.recentProjects';
const MAX = 8;

export function getRecentProjects(): RecentProject[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as RecentProject[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function upsertRecentProject(p: { id: string; name: string }) {
  const now = Date.now();
  const list = getRecentProjects().filter((x) => x.id !== p.id);
  list.unshift({ id: p.id, name: p.name, viewedAt: now });
  const trimmed = list.slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
}
