import { prisma } from '@/infrastructure/db/prisma';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectDetailResponse,
  ProjectListItemResponse,
} from '@/core/dto/project.dto';
import { calculateProjectEvm } from '@/core/evm/evm.calculator';
import { serializeConsolidatedEvm } from '@/core/evm/evm.serializer';
import { ActivityService } from './activity.service';

export class ProjectService {
  /**
   * Lista todos los proyectos con métricas agregadas y de rendimiento para la vista general.
   */
  static async getAllProjects(): Promise<ProjectListItemResponse[]> {
    const projects = await prisma.project.findMany({
      include: {
        activities: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects.map((project) => {
      const activityInputs = project.activities.map((a) => ({
        bac: a.bac,
        plannedProgress: a.plannedProgress,
        actualProgress: a.actualProgress,
        actualCost: a.actualCost,
      }));

      const rawConsolidated = calculateProjectEvm(activityInputs);
      const serialized = serializeConsolidatedEvm(rawConsolidated);

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        activitiesCount: project.activities.length,
        totalBac: serialized.totalBac,
        totalEv: serialized.totalEv,
        totalAc: serialized.totalAc,
        cpi: serialized.cpi,
        spi: serialized.spi,
        costInterpretation: serialized.costInterpretation,
        scheduleInterpretation: serialized.scheduleInterpretation,
      };
    });
  }

  /**
   * Obtiene el detalle de un proyecto por ID con todas sus actividades enriquecidas con EVM
   * y los indicadores consolidados agregados de forma segura.
   */
  static async getProjectById(id: string): Promise<ProjectDetailResponse | null> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    const activityInputs = project.activities.map((a) => ({
      bac: a.bac,
      plannedProgress: a.plannedProgress,
      actualProgress: a.actualProgress,
      actualCost: a.actualCost,
    }));

    const rawConsolidated = calculateProjectEvm(activityInputs);
    const consolidatedEvm = serializeConsolidatedEvm(rawConsolidated);

    const activities = project.activities.map((activity) =>
      ActivityService.enrichActivityWithEvm(activity)
    );

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      activities,
      consolidatedEvm,
    };
  }

  /**
   * Crea un nuevo proyecto.
   */
  static async createProject(data: CreateProjectInput) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  /**
   * Actualiza los datos de un proyecto.
   */
  static async updateProject(id: string, data: UpdateProjectInput) {
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

  /**
   * Elimina un proyecto y todas sus actividades asociadas en cascada.
   */
  static async deleteProject(id: string): Promise<boolean> {
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
