import { NextRequest } from 'next/server';
import { ProjectService } from '@/core/services/project.service';
import { UpdateProjectSchema } from '@/core/dto/project.dto';
import { ApiResponse } from '@/infrastructure/http/api-response';

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const project = await ProjectService.getProjectById(params.id);

    if (!project) {
      return ApiResponse.notFound(`Proyecto con ID '${params.id}' no encontrado`);
    }

    return ApiResponse.success(project);
  } catch (_error) {
    return ApiResponse.internalError('Error al obtener el detalle del proyecto');
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (_error) {
    return ApiResponse.badRequest('El cuerpo de la solicitud no es un JSON válido');
  }

  const validation = UpdateProjectSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponse.validationError(validation.error);
  }

  try {
    const updated = await ProjectService.updateProject(params.id, validation.data);

    if (!updated) {
      return ApiResponse.notFound(`Proyecto con ID '${params.id}' no encontrado`);
    }

    return ApiResponse.success(updated);
  } catch (_error) {
    return ApiResponse.internalError('Error interno al actualizar el proyecto');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const deleted = await ProjectService.deleteProject(params.id);

    if (!deleted) {
      return ApiResponse.notFound(`Proyecto con ID '${params.id}' no encontrado`);
    }

    return ApiResponse.success({ message: 'Proyecto eliminado correctamente' });
  } catch (_error) {
    return ApiResponse.internalError('Error interno al eliminar el proyecto');
  }
}
