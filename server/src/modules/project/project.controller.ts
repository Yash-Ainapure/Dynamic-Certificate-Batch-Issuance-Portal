import { Request, Response } from 'express';
import { ProjectService } from './project.service';
import { ok, fail } from '../../core/utils/response';
import { uploadToS3 } from '../../core/utils/s3Uploader';

export const ProjectController = {
  async list(req: Request, res: Response) {
    try {
      const { limit, cursor } = req.query as { limit?: string; cursor?: string };
      const take = Math.min(Number(limit) || 20, 100);
      const result = await ProjectService.list(take, cursor || undefined);
      return res.json(ok(result));
    } catch (err) {
      console.error('Project list error at project.controller.ts:', err);
      return res.status(500).json(fail('Failed to list projects'));
    }
  },
  async create(req: Request, res: Response) {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json(fail("Template file is required"));
      }
      const templateUrl = await uploadToS3(file, "templates");
      const project = await ProjectService.create(req.body, templateUrl);
      res.json(ok(project));
    } catch (err: any) {
      console.error("Create project error at project.controller.ts:", err);

      if (err.message === "Invalid issueDate") {
        return res.status(400).json(fail("Invalid issueDate format"));
      }

      return res.status(500).json(fail("Failed to create project"));
    }
  },
  async get(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.json(fail('Invalid ID'));
      }
      const project = await ProjectService.get(id);
      if (!project) {
        return res.json(fail('Project not found'));
      }
      res.json(ok(project));
    } catch (err: any) {
      console.error("Get project error at project.controller.ts:", err);
      return res.status(500).json(fail("Failed to get project"));
    }
  },
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json(fail('Invalid ID'));
      const result = await ProjectService.delete(id);
      if (!result.deleted) return res.status(404).json(fail('Project not found'));
      return res.json(ok({ deleted: true }));
    } catch (err) {
      console.error('Delete project error at project.controller.ts:', err);
      return res.status(500).json(fail('Failed to delete project'));
    }
  },
};
