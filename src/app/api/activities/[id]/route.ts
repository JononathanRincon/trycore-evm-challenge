import { ActivityService } from '@/core/services/activity.service';
import {
  UpdateActivitySchema,
  UpdateActivityInput,
} from '@/core/dto/activity.dto';
import { ApiResponse } from '@/infrastructure/http/api-response';
import { createApiHandler } from '@/infrastructure/http/api-handler';

interface RouteParams {
  id: string;
}

export const PUT = createApiHandler<UpdateActivityInput, RouteParams>({
  schema: UpdateActivitySchema,
  defaultErrorMessage: 'Error interno al actualizar la actividad',
  handler: async ({ body, params }) => {
    const updated = await ActivityService.updateActivity(params.id, body);

    if (!updated) {
      return ApiResponse.notFound(
        `Actividad con ID '${params.id}' no encontrada`
      );
    }

    return ApiResponse.success(updated);
  },
});

export const DELETE = createApiHandler<void, RouteParams>({
  defaultErrorMessage: 'Error interno al eliminar la actividad',
  handler: async ({ params }) => {
    const deleted = await ActivityService.deleteActivity(params.id);

    if (!deleted) {
      return ApiResponse.notFound(
        `Actividad con ID '${params.id}' no encontrada`
      );
    }

    return ApiResponse.success({
      message: 'Actividad eliminada correctamente',
    });
  },
});
