import { prisma } from '@/infrastructure/db/prisma';
import { IActivityRepository } from '@/core/repositories/activity.repository.interface';
import {
  CreateActivityInput,
  UpdateActivityInput,
} from '@/core/dto/activity.dto';
import { Activity } from '@prisma/client';

/**
 * Adaptador de infraestructura que implementa IActivityRepository utilizando Prisma ORM.
 */
export class PrismaActivityRepository implements IActivityRepository {
  async projectExists(projectId: string): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    return Boolean(project);
  }

  async findById(id: string): Promise<Activity | null> {
    return prisma.activity.findUnique({
      where: { id },
    });
  }

  async create(
    projectId: string,
    data: CreateActivityInput
  ): Promise<Activity> {
    return prisma.activity.create({
      data: {
        name: data.name,
        projectId,
        bac: data.bac,
        plannedProgress: data.plannedProgress,
        actualProgress: data.actualProgress,
        actualCost: data.actualCost,
      },
    });
  }

  async update(
    id: string,
    data: UpdateActivityInput
  ): Promise<Activity | null> {
    const existing = await prisma.activity.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    return prisma.activity.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bac !== undefined && { bac: data.bac }),
        ...(data.plannedProgress !== undefined && {
          plannedProgress: data.plannedProgress,
        }),
        ...(data.actualProgress !== undefined && {
          actualProgress: data.actualProgress,
        }),
        ...(data.actualCost !== undefined && { actualCost: data.actualCost }),
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    const existing = await prisma.activity.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.activity.delete({
      where: { id },
    });

    return true;
  }
}
