import { prisma } from '@/infrastructure/db/prisma';
import {
  CreateActivityInput,
  UpdateActivityInput,
  ActivityWithEvmResponse,
} from '@/core/dto/activity.dto';
import { calculateActivityEvm } from '@/core/evm/evm.calculator';
import { serializeEvmResult } from '@/core/evm/evm.serializer';
import { Activity } from '@prisma/client';

export class ActivityService {
  /**
   * Transforma una entidad de actividad de Prisma enriqueciéndola con sus indicadores EVM calculados y serializados.
   */
  static enrichActivityWithEvm(activity: Activity): ActivityWithEvmResponse {
    const rawEvm = calculateActivityEvm({
      bac: activity.bac,
      plannedProgress: activity.plannedProgress,
      actualProgress: activity.actualProgress,
      actualCost: activity.actualCost,
    });

    const serializedEvm = serializeEvmResult(rawEvm);

    return {
      id: activity.id,
      projectId: activity.projectId,
      name: activity.name,
      bac: activity.bac,
      plannedProgress: activity.plannedProgress,
      actualProgress: activity.actualProgress,
      actualCost: activity.actualCost,
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
      ...serializedEvm,
    };
  }

  /**
   * Crea una nueva actividad asociada a un proyecto existente.
   */
  static async createActivity(
    projectId: string,
    data: CreateActivityInput
  ): Promise<ActivityWithEvmResponse | null> {
    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!projectExists) {
      return null;
    }

    const created = await prisma.activity.create({
      data: {
        name: data.name,
        projectId,
        bac: data.bac,
        plannedProgress: data.plannedProgress,
        actualProgress: data.actualProgress,
        actualCost: data.actualCost,
      },
    });

    return this.enrichActivityWithEvm(created);
  }

  /**
   * Actualiza una actividad existente y recalcula sus indicadores EVM.
   */
  static async updateActivity(
    id: string,
    data: UpdateActivityInput
  ): Promise<ActivityWithEvmResponse | null> {
    const existing = await prisma.activity.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bac !== undefined && { bac: data.bac }),
        ...(data.plannedProgress !== undefined && { plannedProgress: data.plannedProgress }),
        ...(data.actualProgress !== undefined && { actualProgress: data.actualProgress }),
        ...(data.actualCost !== undefined && { actualCost: data.actualCost }),
      },
    });

    return this.enrichActivityWithEvm(updated);
  }

  /**
   * Elimina una actividad por su ID.
   */
  static async deleteActivity(id: string): Promise<boolean> {
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
