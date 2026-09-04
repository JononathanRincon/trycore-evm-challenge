import { NextRequest } from 'next/server';
import { ActivityService } from '@/core/services/activity.service';
import { CreateActivitySchema } from '@/core/dto/activity.dto';
import { ApiResponse } from '@/infrastructure/http/api-response';

interface RouteParams {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (_error) {
    return ApiResponse.badRequest('El cuerpo de la solicitud no es un JSON válido');
  }

  const validation = CreateActivitySchema.safeParse(body);
  if (!validation.success) {
    return ApiResponse.validationError(validation.error);
  }

  try {
    const activity = await ActivityService.createActivity(params.id, validation.data);

    if (!activity) {
      return ApiResponse.notFound(`Proyecto con ID '${params.id}' no encontrado`);
    }

    return ApiResponse.created(activity);
  } catch (_error) {
    return ApiResponse.internalError('Error interno al crear la actividad');
  }
}
