import { Request, Response } from 'express';
import { ok, fail } from '../../core/utils/response';
import { IssuanceService } from './issuance.service';
import { runInBackground } from '../../core/utils/asyncRunner';

export const IssuanceController = {
  async start(req: Request, res: Response) {
    try {
      const batchId = req.params.batchId;
      if (!batchId) return res.status(400).json(fail('batchId is required'));
      // Do not block the request; queue processing and return immediately
      runInBackground(() => IssuanceService.start(batchId), `issuance:start:${batchId}`);
      res.json(ok({ queued: true }));
    } catch (err: any) {
      console.error('Issuance start error:', err);
      if (err?.message === 'BATCH_NOT_FOUND') return res.status(404).json(fail('Batch not found'));
      if (err?.message === 'BATCH_NOT_VALID') return res.status(400).json(fail('Batch is not VALID'));
      if (err?.message === 'ALREADY_STARTED') return res.status(409).json(fail('Batch already started'));
      res.status(500).json(fail('Failed to start processing'));
    }
  },
  async status(req: Request, res: Response) {
    try {
      const batchId = req.params.batchId;
      if (!batchId) return res.status(400).json(fail('batchId is required'));
      const result = await IssuanceService.status(batchId);
      if (!result) return res.status(404).json(fail('Batch not found'));
      res.json(ok(result));
    } catch (err) {
      console.error('Issuance status error:', err);
      res.status(500).json(fail('Failed to get status'));
    }
  },
};
