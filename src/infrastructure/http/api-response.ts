import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiErrorResponse, ValidationErrorDetail } from '@/core/dto/error.dto';

export class ApiResponse {
  static success<T>(data: T, status: number = 200): NextResponse<T> {
    return NextResponse.json(data, { status });
  }

  static created<T>(data: T): NextResponse<T> {
    return NextResponse.json(data, { status: 201 });
  }

  static badRequest(
    message: string = 'Solicitud incorrecta',
    details?: ValidationErrorDetail[]
  ): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        statusCode: 400,
        error: 'Bad Request',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  static validationError(error: ZodError): NextResponse<ApiErrorResponse> {
    const details: ValidationErrorDetail[] = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return this.badRequest('Error de validación en los datos enviados', details);
  }

  static notFound(message: string = 'Recurso no encontrado'): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        statusCode: 404,
        error: 'Not Found',
        message,
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  static internalError(
    message: string = 'Error interno del servidor'
  ): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        statusCode: 500,
        error: 'Internal Server Error',
        message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
