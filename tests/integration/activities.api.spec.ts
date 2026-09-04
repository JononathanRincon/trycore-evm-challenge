import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as createActivity } from '@/app/api/projects/[id]/activities/route';
import {
  PUT as updateActivity,
  DELETE as deleteActivity,
} from '@/app/api/activities/[id]/route';
import { prisma } from '@/infrastructure/db/prisma';

vi.mock('@/infrastructure/db/prisma', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
    },
    activity: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Integration — Activities Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/projects/:id/activities', () => {
    it('debe retornar 201 Created con la actividad y sus indicadores EVM calculados', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'proj-1' } as any);
      vi.mocked(prisma.activity.create).mockResolvedValue({
        id: 'act-1',
        projectId: 'proj-1',
        name: 'Desarrollo Frontend',
        bac: 10000,
        plannedProgress: 50,
        actualProgress: 40,
        actualCost: 6000,
        createdAt: new Date('2026-09-01T10:00:00.000Z'),
        updatedAt: new Date('2026-09-01T10:00:00.000Z'),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/projects/proj-1/activities', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Desarrollo Frontend',
          bac: 10000,
          plannedProgress: 50,
          actualProgress: 40,
          actualCost: 6000,
        }),
      });

      const response = await createActivity(req, { params: { id: 'proj-1' } });
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json.id).toBe('act-1');
      expect(json.pv).toBe(5000);
      expect(json.ev).toBe(4000);
      expect(json.cv).toBe(-2000);
      expect(json.sv).toBe(-1000);
      expect(json.cpi).toBeCloseTo(0.6667, 4);
      expect(json.spi).toBeCloseTo(0.8, 4);
      expect(json.eac).toBe(15000);
      expect(json.vac).toBe(-5000);
      expect(json.costInterpretation).toBe('Sobre presupuesto (sobrecosto)');
    });

    it('debe retornar 404 Not Found si el proyecto no existe al intentar crear actividad', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/projects/proj-missing/activities', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Actividad',
          bac: 1000,
          plannedProgress: 10,
          actualProgress: 10,
          actualCost: 100,
        }),
      });

      const response = await createActivity(req, { params: { id: 'proj-missing' } });
      expect(response.status).toBe(404);

      const json = await response.json();
      expect(json.statusCode).toBe(404);
      expect(json.message).toContain('no encontrado');
    });

    it('debe retornar 400 Bad Request si los datos violan las restricciones Zod (porcentajes > 100)', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects/proj-1/activities', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Actividad con error',
          bac: 1000,
          plannedProgress: 150, // Inválido (> 100)
          actualProgress: 10,
          actualCost: 100,
        }),
      });

      const response = await createActivity(req, { params: { id: 'proj-1' } });
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.statusCode).toBe(400);
      expect(json.details).toBeDefined();
      expect(json.details[0].field).toBe('plannedProgress');
    });

    it('debe retornar 500 Internal Server Error si ocurre un fallo no controlado en BD', async () => {
      vi.mocked(prisma.project.findUnique).mockRejectedValue(new Error('DB Connection dropped'));

      const req = new NextRequest('http://localhost:3000/api/projects/proj-1/activities', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Actividad',
          bac: 1000,
          plannedProgress: 10,
          actualProgress: 10,
          actualCost: 100,
        }),
      });

      const response = await createActivity(req, { params: { id: 'proj-1' } });
      expect(response.status).toBe(500);

      const json = await response.json();
      expect(json.statusCode).toBe(500);
      expect(json.error).toBe('Internal Server Error');
    });
  });

  describe('PUT /api/activities/:id', () => {
    it('debe retornar 200 OK con la actividad y sus indicadores recalculados', async () => {
      vi.mocked(prisma.activity.findUnique).mockResolvedValue({ id: 'act-1' } as any);
      vi.mocked(prisma.activity.update).mockResolvedValue({
        id: 'act-1',
        projectId: 'proj-1',
        name: 'Frontend Actualizado',
        bac: 10000,
        plannedProgress: 50,
        actualProgress: 50,
        actualCost: 4500, // Actualizado: ahora bajo presupuesto
        createdAt: new Date('2026-09-01T10:00:00.000Z'),
        updatedAt: new Date('2026-09-02T10:00:00.000Z'),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/activities/act-1', {
        method: 'PUT',
        body: JSON.stringify({ actualCost: 4500, actualProgress: 50 }),
      });

      const response = await updateActivity(req, { params: { id: 'act-1' } });
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.cpi).toBeCloseTo(5000 / 4500, 4); // > 1
      expect(json.costInterpretation).toBe('Bajo presupuesto (eficiente en costos)');
    });

    it('debe retornar 404 Not Found si la actividad a editar no existe', async () => {
      vi.mocked(prisma.activity.findUnique).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/activities/act-missing', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Nuevo nombre' }),
      });

      const response = await updateActivity(req, { params: { id: 'act-missing' } });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/activities/:id', () => {
    it('debe retornar 200 OK y confirmar eliminación de la actividad', async () => {
      vi.mocked(prisma.activity.findUnique).mockResolvedValue({ id: 'act-1' } as any);
      vi.mocked(prisma.activity.delete).mockResolvedValue({ id: 'act-1' } as any);

      const req = new NextRequest('http://localhost:3000/api/activities/act-1', {
        method: 'DELETE',
      });

      const response = await deleteActivity(req, { params: { id: 'act-1' } });
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.message).toBe('Actividad eliminada correctamente');
    });

    it('debe retornar 404 Not Found si la actividad a eliminar no existe', async () => {
      vi.mocked(prisma.activity.findUnique).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/activities/act-missing', {
        method: 'DELETE',
      });

      const response = await deleteActivity(req, { params: { id: 'act-missing' } });
      expect(response.status).toBe(404);
    });
  });
});
