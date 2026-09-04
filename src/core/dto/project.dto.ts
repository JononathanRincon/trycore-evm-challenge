import { z } from 'zod';
import { ProjectConsolidatedEvm } from '../evm/evm.types';
import { ActivityWithEvmResponseSchema } from './activity.dto';

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'El nombre del proyecto es obligatorio').max(150, 'Máximo 150 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

export interface ProjectDetailResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  activities: z.infer<typeof ActivityWithEvmResponseSchema>[];
  consolidatedEvm: ProjectConsolidatedEvm;
}

export interface ProjectListItemResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  activitiesCount: number;
  totalBac: number;
  totalEv: number;
  totalAc: number;
  cpi: number | null;
  spi: number | null;
  costInterpretation: string;
  scheduleInterpretation: string;
}
