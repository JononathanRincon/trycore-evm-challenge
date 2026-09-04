import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectDetailResponse,
  ProjectListItemResponse,
} from '@/core/dto/project.dto';
import { calculateProjectEvm } from '@/core/evm/evm.calculator';
import { serializeConsolidatedEvm } from '@/core/evm/evm.serializer';
import { IProjectRepository } from '@/core/repositories/project.repository.interface';
import { PrismaProjectRepository } from '@/infrastructure/repositories/prisma-project.repository';
import { ActivityService } from './activity.service';

/**
 * Servicio de aplicación para la gestión de Proyectos y cálculo consolidado de EVM.
 * Sigue Clean Architecture dependiendo de la abstracción IProjectRepository.
 */
export class ProjectService {
  private projectRepo: IProjectRepository;
  private activityService: typeof ActivityService;

  constructor(
    projectRepo?: IProjectRepository,
    activityService?: typeof ActivityService
  ) {
    this.projectRepo = projectRepo ?? new PrismaProjectRepository();
    this.activityService = activityService ?? ActivityService;
  }

  /**
   * Lista todos los proyectos con métricas agregadas y de rendimiento para la vista general.
   */
  async getAllProjects(): Promise<ProjectListItemResponse[]> {
    const projects = await this.projectRepo.findAllWithActivities();

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
  async getProjectById(id: string): Promise<ProjectDetailResponse | null> {
    const project = await this.projectRepo.findByIdWithActivities(id);

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
      this.activityService.enrichActivityWithEvm(activity)
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
  async createProject(data: CreateProjectInput) {
    return this.projectRepo.create(data);
  }

  /**
   * Actualiza los datos de un proyecto.
   */
  async updateProject(id: string, data: UpdateProjectInput) {
    return this.projectRepo.update(id, data);
  }

  /**
   * Elimina un proyecto y todas sus actividades asociadas en cascada.
   */
  async deleteProject(id: string): Promise<boolean> {
    return this.projectRepo.delete(id);
  }

  // --- Métodos estáticos delegados para retrocompatibilidad total ---
  private static instance = new ProjectService();

  static getAllProjects() {
    return ProjectService.instance.getAllProjects();
  }

  static getProjectById(id: string) {
    return ProjectService.instance.getProjectById(id);
  }

  static createProject(data: CreateProjectInput) {
    return ProjectService.instance.createProject(data);
  }

  static updateProject(id: string, data: UpdateProjectInput) {
    return ProjectService.instance.updateProject(id, data);
  }

  static deleteProject(id: string) {
    return ProjectService.instance.deleteProject(id);
  }
}
