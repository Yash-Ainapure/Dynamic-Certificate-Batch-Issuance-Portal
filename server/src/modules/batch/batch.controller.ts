import { Request, Response } from 'express';
import { ok, fail } from '../../core/utils/response';
import { BatchService } from './batch.service';
import { IssuanceService } from '../issuance/issuance.service';

export const BatchController = {
  async upload(req: Request, res: Response) {
    try {
      const { projectId } = req.body as { projectId?: string };
      if (!projectId) {
        return res.status(400).json(fail('projectId is required'));
      }

      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json(fail('ZIP file is required'));
      }

      const isZip =
        file.mimetype === 'application/zip' ||
        file.mimetype === 'application/x-zip-compressed' ||
        file.originalname.toLowerCase().endsWith('.zip');
      if (!isZip) {
        return res.status(400).json(fail('Only .zip files are accepted'));
      }

      const { batch, summary } = await BatchService.validateAndPersist(projectId, file);

      res.status(201).json(ok({ batch, summary }));
    } catch (err: any) {
      console.error('Batch upload error at batch.controller.ts:', err);
      if (err?.message === 'Project not found') {
        return res.status(404).json(fail('Project not found'));
      }
      return res.status(500).json(fail('Failed to upload batch'));
    }
  },
  async list(req: Request, res: Response) {
    try {
      const { projectId, limit, cursor } = req.query as { projectId?: string; limit?: string; cursor?: string };
      if (!projectId) return res.status(400).json(fail('projectId is required'));
      const take = Math.min(Number(limit) || 20, 100);
      const result = await BatchService.list(projectId, take, cursor || undefined);
      return res.json(ok(result));
    } catch (err) {
      console.error('Batch list error:', err);
      return res.status(500).json(fail('Failed to list batches'));
    }
  },
  async get(req: Request, res: Response) {
    try {
      const { batchId } = req.params as { batchId: string };
      const batch = await BatchService.get(batchId);
      if (!batch) return res.status(404).json(fail('Batch not found'));
      return res.json(ok(batch));
    } catch (err) {
      console.error('Batch get error:', err);
      return res.status(500).json(fail('Failed to get batch'));
    }
  },
  async listCertificates(req: Request, res: Response) {
    try {
      const { batchId } = req.params as { batchId: string };
      const { status, limit, cursor } = req.query as { status?: string; limit?: string; cursor?: string };
      const take = Math.min(Number(limit) || 20, 100);
      const result = await BatchService.listCertificates(batchId, status as any, take, cursor || undefined);
      return res.json(ok(result));
    } catch (err) {
      console.error('List certificates error:', err);
      return res.status(500).json(fail('Failed to list certificates'));
    }
  },
  async retryFailed(req: Request, res: Response) {
    try {
      const { batchId } = req.params as { batchId: string };
      const result = await IssuanceService.retryFailed(batchId);
      return res.json(ok(result));
    } catch (err: any) {
      console.error('Retry failed error:', err);
      if (err?.message === 'BATCH_NOT_FOUND') return res.status(404).json(fail('Batch not found'));
      if (err?.message === 'BATCH_PROCESSING') return res.status(409).json(fail('Batch is currently processing'));
      return res.status(500).json(fail('Failed to retry failed certificates'));
    }
  },
};
