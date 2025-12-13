import { prisma } from '../../config/database';
import { CreateProjectDTO } from './project.interface';

export const ProjectService = {
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
