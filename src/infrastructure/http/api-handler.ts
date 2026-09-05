import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { ApiResponse } from './api-response';

export interface HandlerContext<TBody = unknown, TParams = Record<string, string>> {
  req?: NextRequest;
  body: TBody;
  params: TParams;
}

export interface ApiHandlerOptions<TBody, TParams> {
  schema?: ZodSchema<TBody>;
  defaultErrorMessage?: string;
  handler: (_ctx: HandlerContext<TBody, TParams>) => Promise<NextResponse>;
}

/**
 * Función de orden superior (Higher-Order Function) que estandariza la ejecución de API Route Handlers.
 *
 * Responsabilidades:
 * 1. Parsea y valida el cuerpo JSON mediante Zod Schemas retornando HTTP 400 estandarizado.
 * 2. Extrae parámetros de ruta tipados de forma segura.
 * 3. Captura cualquier excepción no controlada del servicio o base de datos y la registra en logs estructurados.
 * 4. Retorna HTTP 500 unificado eliminando bloques try/catch repetitivos en cada controlador.
 */
export function createApiHandler<TBody = void, TParams = Record<string, string>>(
  options: ApiHandlerOptions<TBody, TParams>
) {
  return async (req?: NextRequest, routeContext?: { params: TParams }): Promise<NextResponse> => {
    let body: TBody = undefined as unknown as TBody;

    if (options.schema) {
      if (!req) {
        return ApiResponse.badRequest('El cuerpo de la solicitud no es un JSON válido');
      }

      try {
        const rawBody = await req.json();
        const validation = options.schema.safeParse(rawBody);
        if (!validation.success) {
          return ApiResponse.validationError(validation.error);
        }
        body = validation.data;
      } catch (_error) {
        return ApiResponse.badRequest('El cuerpo de la solicitud no es un JSON válido');
      }
    }

    try {
      const params = routeContext?.params || ({} as TParams);
      return await options.handler({ req, body, params });
    } catch (error) {
      console.error('[API_UNHANDLED_ERROR]', {
        url: req?.url,
        method: req?.method,
        errorMessage: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      return ApiResponse.internalError(options.defaultErrorMessage || 'Error interno del servidor');
    }
  };
}
