import { Activity } from '@prisma/client';
import { CreateActivityInput, UpdateActivityInput } from '@/core/dto/activity.dto';

/**
 * Contrato de abstracción (Puerto) para la persistencia y consulta de actividades.
 * Desacopla la lógica de aplicación del ORM o base de datos subyacente.
 */
export interface IActivityRepository {
  /**
   * Verifica la existencia de un proyecto por ID.
   */
  projectExists(_projectId: string): Promise<boolean>;

  /**
   * Obtiene una actividad por su identificador único.
   */
  findById(_id: string): Promise<Activity | null>;

  /**
   * Crea una nueva actividad vinculada a un proyecto existente.
   */
  create(_projectId: string, _data: CreateActivityInput): Promise<Activity>;

  /**
   * Actualiza los datos de una actividad existente. Retorna null si no existe.
   */
  update(_id: string, _data: UpdateActivityInput): Promise<Activity | null>;

  /**
   * Elimina una actividad por su ID. Retorna true si fue eliminada, false si no existía.
   */
  delete(_id: string): Promise<boolean>;
}
