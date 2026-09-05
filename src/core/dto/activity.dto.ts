import { z } from 'zod';

export const CreateActivitySchema = z.object({
  name: z.string().min(1, 'El nombre de la actividad es obligatorio').max(150, 'El nombre no puede exceder 150 caracteres'),
  bac: z.number({ invalid_type_error: 'El presupuesto (BAC) es requerido' }).min(0, 'El BAC (presupuesto planificado) no puede ser negativo'),
  plannedProgress: z
    .number({ invalid_type_error: 'El porcentaje planificado es requerido' })
    .min(0, 'El porcentaje planificado debe ser mayor o igual a 0')
    .max(100, 'El porcentaje planificado no puede exceder 100'),
  actualProgress: z
    .number({ invalid_type_error: 'El porcentaje real completado es requerido' })
    .min(0, 'El porcentaje real completado debe ser mayor o igual a 0')
    .max(100, 'El porcentaje real completado no puede exceder 100'),
  actualCost: z.number({ invalid_type_error: 'El costo real (AC) es requerido' }).min(0, 'El costo real (AC) no puede ser negativo'),
});

export const UpdateActivitySchema = CreateActivitySchema.partial();

export const ActivityWithEvmResponseSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string(),
  bac: z.number(),
  plannedProgress: z.number(),
  actualProgress: z.number(),
  actualCost: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Indicadores EVM calculados al vuelo
  pv: z.number(),
  ev: z.number(),
  cv: z.number(),
  sv: z.number(),
  cpi: z.number().nullable(),
  spi: z.number().nullable(),
  eac: z.number().nullable(),
  vac: z.number().nullable(),
  costInterpretation: z.string(),
  scheduleInterpretation: z.string(),
});

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;
export type ActivityWithEvmResponse = z.infer<typeof ActivityWithEvmResponseSchema>;
