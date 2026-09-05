import { Project, Activity } from '@prisma/client';
import { CreateProjectInput, UpdateProjectInput } from '@/core/dto/project.dto';

export type ProjectWithActivities = Project & {
  activities: Activity[];
};

export interface FindProjectsParams {
  skip?: number;
  take?: number;
}

/**
 * Contrato de abstracción (Puerto) para la persistencia y consulta de proyectos.
 * Desacopla la lógica de aplicación del ORM o base de datos subyacente.
 */
export interface IProjectRepository {
  /**
   * Obtiene proyectos incluyendo sus actividades, con soporte opcional de paginación.
   */
  findAllWithActivities(_params?: FindProjectsParams): Promise<ProjectWithActivities[]>;

  /**
   * Retorna el conteo total de proyectos registrados.
   */
  count(): Promise<number>;

  /**
   * Obtiene un proyecto específico por ID con sus actividades ordenadas por fecha de creación.
   */
  findByIdWithActivities(_id: string): Promise<ProjectWithActivities | null>;

  /**
   * Crea un nuevo proyecto.
   */
  create(_data: CreateProjectInput): Promise<Project>;

  /**
   * Actualiza los datos de un proyecto existente. Retorna null si no existe.
   */
  update(_id: string, _data: UpdateProjectInput): Promise<Project | null>;

  /**
   * Elimina un proyecto por ID. Retorna true si fue eliminado, false si no existía.
   */
  delete(_id: string): Promise<boolean>;
}
