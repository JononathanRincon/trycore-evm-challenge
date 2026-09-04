import { describe, it, expect } from 'vitest';
import { ActivityService } from '@/core/services/activity.service';
import { IActivityRepository } from '@/core/repositories/activity.repository.interface';
import { CreateActivityInput, UpdateActivityInput } from '@/core/dto/activity.dto';
import { Activity } from '@prisma/client';

class InMemoryActivityRepository implements IActivityRepository {
  public activities: Activity[] = [];
  public existingProjects: Set<string> = new Set(['valid-project-id']);

  async projectExists(projectId: string): Promise<boolean> {
    return this.existingProjects.has(projectId);
  }

  async findById(id: string): Promise<Activity | null> {
    return this.activities.find((a) => a.id === id) || null;
  }

  async create(projectId: string, data: CreateActivityInput): Promise<Activity> {
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      projectId,
      name: data.name,
      bac: data.bac,
      plannedProgress: data.plannedProgress,
      actualProgress: data.actualProgress,
      actualCost: data.actualCost,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.activities.push(newActivity);
    return newActivity;
  }

  async update(id: string, data: UpdateActivityInput): Promise<Activity | null> {
    const activity = this.activities.find((a) => a.id === id);
    if (!activity) return null;
    if (data.name !== undefined) activity.name = data.name;
    if (data.bac !== undefined) activity.bac = data.bac;
    if (data.plannedProgress !== undefined) activity.plannedProgress = data.plannedProgress;
    if (data.actualProgress !== undefined) activity.actualProgress = data.actualProgress;
    if (data.actualCost !== undefined) activity.actualCost = data.actualCost;
    activity.updatedAt = new Date();
    return activity;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.activities.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.activities.splice(index, 1);
    return true;
  }
}

describe('Unit — ActivityService with In-Memory Repository (DIP)', () => {
  it('debe crear una actividad enriquecida con EVM si el proyecto existe', async () => {
    const repo = new InMemoryActivityRepository();
    const service = new ActivityService(repo);

    const result = await service.createActivity('valid-project-id', {
      name: 'Desarrollo API',
      bac: 10000,
      plannedProgress: 50,
      actualProgress: 40,
      actualCost: 6000,
    });

    expect(result).not.toBeNull();
    expect(result!.name).toBe('Desarrollo API');
    expect(result!.pv).toBe(5000);
    expect(result!.ev).toBe(4000);
    expect(result!.cv).toBe(-2000);
    expect(result!.sv).toBe(-1000);
    expect(result!.cpi).toBeCloseTo(0.6667, 4);
    expect(result!.spi).toBe(0.8);
    expect(result!.costInterpretation).toBe('Sobre presupuesto (sobrecosto)');
  });

  it('debe retornar null al intentar crear una actividad para un proyecto inexistente', async () => {
    const repo = new InMemoryActivityRepository();
    const service = new ActivityService(repo);

    const result = await service.createActivity('invalid-project-id', {
      name: 'Actividad Fantasma',
      bac: 5000,
      plannedProgress: 10,
      actualProgress: 0,
      actualCost: 0,
    });

    expect(result).toBeNull();
  });

  it('debe actualizar una actividad existente y recalcular métricas EVM', async () => {
    const repo = new InMemoryActivityRepository();
    repo.activities = [
      {
        id: 'act-1',
        projectId: 'valid-project-id',
        name: 'Fase Inicial',
        bac: 8000,
        plannedProgress: 100,
        actualProgress: 50,
        actualCost: 3000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const service = new ActivityService(repo);
    const updated = await service.updateActivity('act-1', {
      actualProgress: 100,
      actualCost: 7500,
    });

    expect(updated).not.toBeNull();
    expect(updated!.actualProgress).toBe(100);
    expect(updated!.ev).toBe(8000);
    expect(updated!.cv).toBe(500);
    expect(updated!.cpi).toBeCloseTo(1.0667, 4);
    expect(updated!.costInterpretation).toBe('Bajo presupuesto (eficiente en costos)');
  });
});
