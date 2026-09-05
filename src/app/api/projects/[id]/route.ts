import { ProjectService } from '@/core/services/project.service';
import { UpdateProjectSchema, UpdateProjectInput } from '@/core/dto/project.dto';
import { ApiResponse } from '@/infrastructure/http/api-response';
import { createApiHandler } from '@/infrastructure/http/api-handler';

interface RouteParams {
  id: string;
}

export const GET = createApiHandler<void, RouteParams>({
  defaultErrorMessage: 'Error al obtener el detalle del proyecto',
  handler: async ({ params }) => {
    const project = await ProjectService.getProjectById(params.id);

    if (!project) {
      return ApiResponse.notFound(`Proyecto con ID '${params.id}' no encontrado`);
    }

    return ApiResponse.success(project);
  },
});

export const PUT = createApiHandler<UpdateProjectInput, RouteParams>({
  schema: UpdateProjectSchema,
  defaultErrorMessage: 'Error interno al actualizar el proyecto',
  handler: async ({ body, params }) => {
    const updated = await ProjectService.updateProject(params.id, body);

    if (!updated) {
      return ApiResponse.notFound(`Proyecto con ID '${params.id}' no encontrado`);
    }

    return ApiResponse.success(updated);
  },
});

export const DELETE = createApiHandler<void, RouteParams>({
  defaultErrorMessage: 'Error interno al eliminar el proyecto',
  handler: async ({ params }) => {
    const deleted = await ProjectService.deleteProject(params.id);

    if (!deleted) {
      return ApiResponse.notFound(`Proyecto con ID '${params.id}' no encontrado`);
    }

    return ApiResponse.success({ message: 'Proyecto eliminado correctamente' });
  },
});
