import { ActivityService } from '@/core/services/activity.service';
import { CreateActivitySchema, CreateActivityInput } from '@/core/dto/activity.dto';
import { ApiResponse } from '@/infrastructure/http/api-response';
import { createApiHandler } from '@/infrastructure/http/api-handler';

interface RouteParams {
  id: string;
}

export const POST = createApiHandler<CreateActivityInput, RouteParams>({
  schema: CreateActivitySchema,
  defaultErrorMessage: 'Error interno al crear la actividad',
  handler: async ({ body, params }) => {
    const activity = await ActivityService.createActivity(params.id, body);

    if (!activity) {
      return ApiResponse.notFound(`Proyecto con ID '${params.id}' no encontrado`);
    }

    return ApiResponse.created(activity);
  },
});
