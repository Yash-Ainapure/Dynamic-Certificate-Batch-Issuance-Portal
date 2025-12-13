import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import { unwrap } from './helpers';
import type { Batch } from '../types';

export async function startIssuance(batchId: string) {
  const resp = await axiosClient.post(`${endpoints.issuance}/batches/${batchId}/start`);
  return unwrap<{ started: true }>(resp as any);
}

export async function getIssuanceStatus(batchId: string): Promise<Batch> {
  const resp = await axiosClient.get(`${endpoints.issuance}/batches/${batchId}/status`);
  return unwrap<Batch>(resp as any);
}
