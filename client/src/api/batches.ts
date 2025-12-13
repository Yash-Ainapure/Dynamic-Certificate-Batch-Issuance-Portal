import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import { unwrap } from './helpers';
import type { Batch, Certificate } from '../types';

export async function uploadBatchZip(params: { projectId: string; zip: File }): Promise<{ batch: Batch; summary: any }> {
  const fd = new FormData();
  fd.append('projectId', params.projectId);
  fd.append('zip', params.zip);
  const resp = await axiosClient.post(`${endpoints.batches}/upload`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<{ batch: Batch; summary: any }>(resp as any);
}

export async function getBatches(params: { projectId: string; limit?: number; cursor?: string }) {
  const resp = await axiosClient.get(`${endpoints.batches}`, { params });
  return unwrap<{ items: Batch[]; nextCursor?: string }>(resp as any);
}

export async function getBatch(batchId: string): Promise<Batch> {
  const resp = await axiosClient.get(`${endpoints.batches}/${batchId}`);
  return unwrap<Batch>(resp as any);
}

export async function listCertificates(params: { batchId: string; status?: string; limit?: number; cursor?: string }) {
  const resp = await axiosClient.get(`${endpoints.batches}/${params.batchId}/certificates`, {
    params: { status: params.status, limit: params.limit, cursor: params.cursor },
  });
  return unwrap<{ items: Certificate[]; nextCursor?: string }>(resp as any);
}

export async function deleteBatch(batchId: string): Promise<boolean> {
  const resp = await axiosClient.delete(`${endpoints.batches}/${batchId}`);
  const data = unwrap<{ deleted: boolean }>(resp as any);
  return !!data.deleted;
}

export async function retryFailed(batchId: string) {
  const resp = await axiosClient.post(`${endpoints.batches}/${batchId}/retry-failed`);
  return unwrap<{ retried: true }>(resp as any);
}

export async function downloadBatchZip(batchId: string): Promise<Blob> {
  const resp = await axiosClient.get(`${endpoints.batches}/${batchId}/download`, {
    responseType: 'blob',
  });
  return resp.data as Blob;
}
