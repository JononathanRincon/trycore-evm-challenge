import { ProjectService } from '@/core/services/project.service';
import {
  CreateProjectSchema,
  CreateProjectInput,
  PaginationQuerySchema,
} from '@/core/dto/project.dto';
import { ApiResponse } from '@/infrastructure/http/api-response';
import { createApiHandler } from '@/infrastructure/http/api-handler';

export const GET = createApiHandler({
  defaultErrorMessage: 'Error al obtener la lista de proyectos',
  handler: async ({ req }) => {
    let hasPagination = false;
    let page = 1;
    let limit = 10;

    if (req) {
      const url = new URL(req.url);
      const pageStr = url.searchParams.get('page');
      const limitStr = url.searchParams.get('limit');

      if (pageStr !== null || limitStr !== null) {
        hasPagination = true;
        const parsed = PaginationQuerySchema.safeParse({
          page: pageStr ?? 1,
          limit: limitStr ?? 10,
        });

        if (parsed.success) {
          page = parsed.data.page;
          limit = parsed.data.limit;
        }
      }
    }

    const paginated = await ProjectService.getAllProjects(
      hasPagination ? { page, limit } : undefined
    );

    if (hasPagination) {
      return ApiResponse.success(paginated);
    }

    return ApiResponse.success(paginated.items);
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
