import { NextRequest } from 'next/server';
import { ProjectService } from '@/core/services/project.service';
import { CreateProjectSchema } from '@/core/dto/project.dto';
import { ApiResponse } from '@/infrastructure/http/api-response';

export async function GET() {
  try {
    const projects = await ProjectService.getAllProjects();
    return ApiResponse.success(projects);
  } catch (_error) {
    return ApiResponse.internalError('Error al obtener la lista de proyectos');
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (_error) {
    return ApiResponse.badRequest('El cuerpo de la solicitud no es un JSON válido');
  }

  const validation = CreateProjectSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponse.validationError(validation.error);
  }

  try {
    const created = await ProjectService.createProject(validation.data);
    return ApiResponse.created(created);
  } catch (_error) {
    return ApiResponse.internalError('Error interno al crear el proyecto');
  }
}
