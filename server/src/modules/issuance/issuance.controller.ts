import { Request, Response } from 'express';
import { ok } from '../../core/utils/response';
import { IssuanceService } from './issuance.service';

export const IssuanceController = {
  async start(req: Request, res: Response) {
    const { batchId } = req.body as { batchId: string };
    const result = await IssuanceService.start(batchId);
    res.json(ok(result));
  },
  async status(req: Request, res: Response) {
    const result = await IssuanceService.status(req.params.batchId);
    res.json(ok(result));
  },
};
