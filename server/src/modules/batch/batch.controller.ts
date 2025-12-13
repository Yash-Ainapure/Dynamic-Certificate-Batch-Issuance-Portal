import { Request, Response } from 'express';
import { ok } from '../../core/utils/response';
import { BatchService } from './batch.service';

export const BatchController = {
  async upload(req: Request, res: Response) {
    const { projectId } = req.body as { projectId: string };
    const _file = (req as any).file as Express.Multer.File | undefined;
    const batch = await BatchService.validateAndCreate(projectId);
    res.json(ok({ batch, summary: { totalRecords: 0, validRecords: 0 } }));
  },
};
