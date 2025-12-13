import { prisma } from '../../config/database';
import { CreateProjectDTO } from './project.interface';

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
};
