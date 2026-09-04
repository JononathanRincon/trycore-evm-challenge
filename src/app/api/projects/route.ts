import { ProjectService } from '@/core/services/project.service';
import { CreateProjectSchema, CreateProjectInput } from '@/core/dto/project.dto';
import { ApiResponse } from '@/infrastructure/http/api-response';
import { createApiHandler } from '@/infrastructure/http/api-handler';

export const GET = createApiHandler({
  defaultErrorMessage: 'Error al obtener la lista de proyectos',
  handler: async () => {
    const projects = await ProjectService.getAllProjects();
    return ApiResponse.success(projects);
  },
});

export const POST = createApiHandler<CreateProjectInput>({
  schema: CreateProjectSchema,
  defaultErrorMessage: 'Error interno al crear el proyecto',
  handler: async ({ body }) => {
    const created = await ProjectService.createProject(body);
    return ApiResponse.created(created);
  },
});
