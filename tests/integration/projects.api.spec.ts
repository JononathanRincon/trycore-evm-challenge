import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getProjects, POST as createProject } from '@/app/api/projects/route';
import {
  GET as getProjectById,
  PUT as updateProject,
  DELETE as deleteProject,
} from '@/app/api/projects/[id]/route';
import { prisma } from '@/infrastructure/db/prisma';

vi.mock('@/infrastructure/db/prisma', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    activity: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Integration — /api/projects Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('debe retornar 200 OK con la lista de proyectos y métricas calculadas', async () => {
      const mockProjects = [
        {
          id: 'proj-1',
          name: 'Proyecto Alpha',
          description: 'Descripción test',
          createdAt: new Date('2026-09-01T10:00:00.000Z'),
          updatedAt: new Date('2026-09-01T10:00:00.000Z'),
          activities: [
            {
              id: 'act-1',
              projectId: 'proj-1',
              name: 'Diseño',
              bac: 10000,
              plannedProgress: 50,
              actualProgress: 40,
              actualCost: 6000,
              createdAt: new Date('2026-09-01T10:00:00.000Z'),
              updatedAt: new Date('2026-09-01T10:00:00.000Z'),
            },
          ],
        },
      ];

      vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);

      const response = await getProjects();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json).toHaveLength(1);
      expect(json[0].id).toBe('proj-1');
      expect(json[0].totalBac).toBe(10000);
      expect(json[0].totalEv).toBe(4000);
      expect(json[0].totalAc).toBe(6000);
      expect(json[0].cpi).toBeCloseTo(0.6667, 4);
      expect(json[0].costInterpretation).toBe('Sobre presupuesto (sobrecosto)');
    });
  });

  describe('POST /api/projects', () => {
    it('debe retornar 201 Created al enviar datos válidos', async () => {
      const newProject = {
        id: 'proj-2',
        name: 'Nuevo Proyecto ERP',
        description: 'Implementación ERP',
        createdAt: new Date('2026-09-01T10:00:00.000Z'),
        updatedAt: new Date('2026-09-01T10:00:00.000Z'),
      };

      vi.mocked(prisma.project.create).mockResolvedValue(newProject as any);

      const req = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Nuevo Proyecto ERP', description: 'Implementación ERP' }),
      });

      const response = await createProject(req);
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json.name).toBe('Nuevo Proyecto ERP');
    });

    it('debe retornar 400 Bad Request cuando el nombre es inválido (vacío)', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      });

      const response = await createProject(req);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.statusCode).toBe(400);
      expect(json.error).toBe('Bad Request');
      expect(json.details).toBeDefined();
      expect(json.details[0].field).toBe('name');
    });

    it('debe retornar 400 Bad Request cuando el cuerpo no es un JSON válido', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: '{ malformed json',
      });

      const response = await createProject(req);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.message).toBe('El cuerpo de la solicitud no es un JSON válido');
    });
  });

  describe('GET /api/projects/:id', () => {
    it('debe retornar 200 OK con el proyecto y el detalle enriquecido de EVM', async () => {
      const mockProject = {
        id: 'proj-1',
        name: 'Proyecto Alpha',
        description: 'Detalle',
        createdAt: new Date('2026-09-01T10:00:00.000Z'),
        updatedAt: new Date('2026-09-01T10:00:00.000Z'),
        activities: [
          {
            id: 'act-1',
            projectId: 'proj-1',
            name: 'Diseño',
            bac: 10000,
            plannedProgress: 50,
            actualProgress: 40,
            actualCost: 6000,
            createdAt: new Date('2026-09-01T10:00:00.000Z'),
            updatedAt: new Date('2026-09-01T10:00:00.000Z'),
          },
        ],
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);

      const req = new NextRequest('http://localhost:3000/api/projects/proj-1');
      const response = await getProjectById(req, { params: { id: 'proj-1' } });
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.id).toBe('proj-1');
      expect(json.activities).toHaveLength(1);
      expect(json.activities[0].cpi).toBeCloseTo(0.6667, 4);
      expect(json.consolidatedEvm.totalBac).toBe(10000);
      expect(json.consolidatedEvm.costInterpretation).toBe('Sobre presupuesto (sobrecosto)');
    });

    it('debe retornar 404 Not Found si el proyecto no existe', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/projects/non-existent');
      const response = await getProjectById(req, { params: { id: 'non-existent' } });
      expect(response.status).toBe(404);

      const json = await response.json();
      expect(json.statusCode).toBe(404);
      expect(json.error).toBe('Not Found');
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('debe retornar 200 OK con el proyecto actualizado', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'proj-1' } as any);
      vi.mocked(prisma.project.update).mockResolvedValue({
        id: 'proj-1',
        name: 'Nombre Actualizado',
        description: 'Nueva desc',
        updatedAt: new Date(),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/projects/proj-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Nombre Actualizado' }),
      });

      const response = await updateProject(req, { params: { id: 'proj-1' } });
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.name).toBe('Nombre Actualizado');
    });

    it('debe retornar 404 Not Found si el proyecto a actualizar no existe', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/projects/proj-missing', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Nuevo nombre' }),
      });

      const response = await updateProject(req, { params: { id: 'proj-missing' } });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('debe retornar 200 OK y confirmar eliminación', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'proj-1' } as any);
      vi.mocked(prisma.project.delete).mockResolvedValue({ id: 'proj-1' } as any);

      const req = new NextRequest('http://localhost:3000/api/projects/proj-1', {
        method: 'DELETE',
      });

      const response = await deleteProject(req, { params: { id: 'proj-1' } });
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.message).toBe('Proyecto eliminado correctamente');
    });

    it('debe retornar 404 Not Found si el proyecto a eliminar no existe', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/projects/proj-missing', {
        method: 'DELETE',
      });

      const response = await deleteProject(req, { params: { id: 'proj-missing' } });
      expect(response.status).toBe(404);
    });
  });
});
