import { prisma } from '../../config/database';

export const BatchService = {
  async validateAndCreate(projectId: string) {
    return prisma.batch.create({ data: { projectId } });
  },
};
