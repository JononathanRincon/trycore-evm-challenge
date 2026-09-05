import {
  CreateActivityInput,
  UpdateActivityInput,
  ActivityWithEvmResponse,
} from '@/core/dto/activity.dto';
import { calculateActivityEvm } from '@/core/evm/evm.calculator';
import { serializeEvmResult } from '@/core/evm/evm.serializer';
import { IActivityRepository } from '@/core/repositories/activity.repository.interface';
import { PrismaActivityRepository } from '@/infrastructure/repositories/prisma-activity.repository';
import { Activity } from '@prisma/client';

/**
 * Servicio de aplicación para la gestión de Actividades y derivación de indicadores EVM.
 * Sigue Clean Architecture dependiendo de la abstracción IActivityRepository.
 */
export class ActivityService {
  private activityRepo: IActivityRepository;

  constructor(activityRepo?: IActivityRepository) {
    this.activityRepo = activityRepo ?? new PrismaActivityRepository();
  }

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

  enrichActivityWithEvm(activity: Activity): ActivityWithEvmResponse {
    return ActivityService.enrichActivityWithEvm(activity);
  }

  /**
   * Crea una nueva actividad asociada a un proyecto existente.
   */
  async createActivity(
    projectId: string,
    data: CreateActivityInput
  ): Promise<ActivityWithEvmResponse | null> {
    const exists = await this.activityRepo.projectExists(projectId);
    if (!exists) {
      return null;
    }

    const created = await this.activityRepo.create(projectId, data);
    return ActivityService.enrichActivityWithEvm(created);
  }

  /**
   * Actualiza una actividad existente y recalcula sus indicadores EVM.
   */
  async updateActivity(
    id: string,
    data: UpdateActivityInput
  ): Promise<ActivityWithEvmResponse | null> {
    const updated = await this.activityRepo.update(id, data);
    if (!updated) {
      return null;
    }

    return ActivityService.enrichActivityWithEvm(updated);
  }

  /**
   * Elimina una actividad por su ID.
   */
  async deleteActivity(id: string): Promise<boolean> {
    return this.activityRepo.delete(id);
  }

  // --- Métodos estáticos delegados para retrocompatibilidad total ---
  private static instance = new ActivityService();

  static createActivity(projectId: string, data: CreateActivityInput) {
    return ActivityService.instance.createActivity(projectId, data);
  }

  static updateActivity(id: string, data: UpdateActivityInput) {
    return ActivityService.instance.updateActivity(id, data);
  }

  static deleteActivity(id: string) {
    return ActivityService.instance.deleteActivity(id);
  }
}
