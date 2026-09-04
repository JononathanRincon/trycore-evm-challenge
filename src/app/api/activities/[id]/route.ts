import { NextRequest } from 'next/server';
import { ActivityService } from '@/core/services/activity.service';
import { UpdateActivitySchema } from '@/core/dto/activity.dto';
import { ApiResponse } from '@/infrastructure/http/api-response';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (_error) {
    return ApiResponse.badRequest('El cuerpo de la solicitud no es un JSON válido');
  }

  const validation = UpdateActivitySchema.safeParse(body);
  if (!validation.success) {
    return ApiResponse.validationError(validation.error);
  }

  try {
    const updated = await ActivityService.updateActivity(params.id, validation.data);

    if (!updated) {
      return ApiResponse.notFound(`Actividad con ID '${params.id}' no encontrada`);
    }

    return ApiResponse.success(updated);
  } catch (_error) {
    return ApiResponse.internalError('Error interno al actualizar la actividad');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const deleted = await ActivityService.deleteActivity(params.id);

    if (!deleted) {
      return ApiResponse.notFound(`Actividad con ID '${params.id}' no encontrada`);
    }

    return ApiResponse.success({ message: 'Actividad eliminada correctamente' });
  } catch (_error) {
    return ApiResponse.internalError('Error interno al eliminar la actividad');
  }
}
