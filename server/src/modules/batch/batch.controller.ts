import { Request, Response } from 'express';
import { ok, fail } from '../../core/utils/response';
import { BatchService } from './batch.service';

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
};
