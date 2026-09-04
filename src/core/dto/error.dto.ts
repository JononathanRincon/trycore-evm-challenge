import { z } from 'zod';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: ValidationErrorDetail[];
  timestamp: string;
}

export const ApiErrorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
  timestamp: z.string(),
});
