import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import { unwrap } from './helpers';
import type { Project } from '../types';

export async function createProject(data: FormData): Promise<Project> {
  const resp = await axiosClient.post(endpoints.projects, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<Project>(resp as any);
}

export async function getProject(id: string): Promise<Project> {
  const resp = await axiosClient.get(`${endpoints.projects}/${id}`);
  return unwrap<Project>(resp as any);
}

export async function listProjects(params: { limit?: number; cursor?: string }) {
  const resp = await axiosClient.get(`${endpoints.projects}`, { params });
  return unwrap<{ items: Project[]; nextCursor?: string }>(resp as any);
}

export async function deleteProject(id: string): Promise<{ queued?: boolean; deleted?: boolean }> {
  const resp = await axiosClient.delete(`${endpoints.projects}/${id}`);
  return unwrap<{ queued?: boolean; deleted?: boolean }>(resp as any);
}
