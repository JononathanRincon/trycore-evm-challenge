import { prisma } from '@/infrastructure/db/prisma';
import {
  IProjectRepository,
  ProjectWithActivities,
} from '@/core/repositories/project.repository.interface';
import { CreateProjectInput, UpdateProjectInput } from '@/core/dto/project.dto';
import { Project } from '@prisma/client';

/**
 * Adaptador de infraestructura que implementa IProjectRepository utilizando Prisma ORM.
 */
export class PrismaProjectRepository implements IProjectRepository {
  async findAllWithActivities(): Promise<ProjectWithActivities[]> {
    return prisma.project.findMany({
      include: {
        activities: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByIdWithActivities(id: string): Promise<ProjectWithActivities | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async create(data: CreateProjectInput): Promise<Project> {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async update(id: string, data: UpdateProjectInput): Promise<Project | null> {
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    return prisma.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.project.delete({
      where: { id },
    });

    return true;
  }
}
