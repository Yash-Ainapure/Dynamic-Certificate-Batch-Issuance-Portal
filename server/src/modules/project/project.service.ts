import { prisma } from '../../config/database';
import { CreateProjectDTO } from './project.interface';
import { deleteObjectByUrl } from '../../core/utils/s3Uploader';

export const ProjectService = {
  async list(take: number, cursor?: string) {
    const items = await prisma.project.findMany({
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true, issuer: true, issueDate: true, createdAt: true },
    });
    const hasMore = items.length > take;
    const pageItems = hasMore ? items.slice(0, take) : items;
    const nextCursor = hasMore ? items[take]?.id : undefined;
    return { items: pageItems, nextCursor };
  },
  async create(dto: CreateProjectDTO, templateUrl: string) {

    const issueDate = new Date(dto.issueDate);

    if (isNaN(issueDate.getTime())) {
      throw new Error("Invalid issueDate");
    }

    return prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        issuer: dto.issuer,
        issueDate,
        qrX: Number(dto.qrX),
        qrY: Number(dto.qrY),
        templateUrl,
      },
    });
  },
  async get(id: string) {
    return prisma.project.findUnique({ where: { id } });
  },
  async delete(id: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return { deleted: false };

    // Delete project template (best-effort)
    try { await deleteObjectByUrl(project.templateUrl); } catch {}

    // Find batches and certificates
    const batches = await prisma.batch.findMany({ where: { projectId: id }, select: { id: true, zipFileUrl: true } });
    for (const b of batches) {
      try { await deleteObjectByUrl(b.zipFileUrl || undefined); } catch {}
      const certs = await prisma.certificate.findMany({ where: { batchId: b.id }, select: { finalPdfUrl: true } });
      for (const c of certs) {
        try { await deleteObjectByUrl(c.finalPdfUrl || undefined); } catch {}
      }
    }

    // Delete rows in DB
    await prisma.certificate.deleteMany({ where: { batch: { projectId: id } } });
    await prisma.batch.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });
    return { deleted: true };
  },
};
