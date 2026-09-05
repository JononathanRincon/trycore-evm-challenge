import { describe, it, expect } from 'vitest';
import { ProjectService } from '@/core/services/project.service';
import {
  IProjectRepository,
  ProjectWithActivities,
  FindProjectsParams,
} from '@/core/repositories/project.repository.interface';
import { CreateProjectInput, UpdateProjectInput } from '@/core/dto/project.dto';

// Repositorio mock en memoria puro (sin dependencias externas ni Prisma)
class InMemoryProjectRepository implements IProjectRepository {
  public projects: ProjectWithActivities[] = [];

  async findAllWithActivities(params?: FindProjectsParams): Promise<ProjectWithActivities[]> {
    let list = this.projects;
    if (params?.skip !== undefined) {
      list = list.slice(params.skip);
    }
    if (params?.take !== undefined) {
      list = list.slice(0, params.take);
    }
    return list;
  }

  async count(): Promise<number> {
    return this.projects.length;
  }

  async findByIdWithActivities(id: string): Promise<ProjectWithActivities | null> {
    return this.projects.find((p) => p.id === id) || null;
  }

  async create(data: CreateProjectInput) {
    const newProject: ProjectWithActivities = {
      id: `proj-${Date.now()}`,
      name: data.name,
      description: data.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      activities: [],
    };
    this.projects.push(newProject);
    return newProject;
  }

  async update(id: string, data: UpdateProjectInput) {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return null;
    if (data.name !== undefined) project.name = data.name;
    if (data.description !== undefined) project.description = data.description;
    project.updatedAt = new Date();
    return project;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.projects.splice(index, 1);
    return true;
  }
}

describe('Unit — ProjectService with In-Memory Repository (DIP)', () => {
  it('debe listar proyectos calculando los indicadores EVM consolidados correctamente', async () => {
    const repo = new InMemoryProjectRepository();
    repo.projects = [
      {
        id: 'proj-1',
        name: 'Plataforma Cloud',
        description: 'Migración cloud',
        createdAt: new Date('2026-09-01T00:00:00Z'),
        updatedAt: new Date('2026-09-01T00:00:00Z'),
        activities: [
          {
            id: 'act-1',
            projectId: 'proj-1',
            name: 'Infraestructura',
            bac: 10000,
            plannedProgress: 50,
            actualProgress: 50,
            actualCost: 5000,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ];

    const service = new ProjectService(repo);
    const result = await service.getAllProjects();

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('proj-1');
    expect(result.items[0].totalBac).toBe(10000);
    expect(result.items[0].totalEv).toBe(5000);
    expect(result.items[0].totalAc).toBe(5000);
    expect(result.items[0].cpi).toBe(1.0);
    expect(result.items[0].spi).toBe(1.0);
    expect(result.items[0].costInterpretation).toBe('En presupuesto');
    expect(result.items[0].scheduleInterpretation).toBe('A tiempo');
    expect(result.meta.totalItems).toBe(1);
  });

  it('debe paginar proyectos correctamente según page y limit', async () => {
    const repo = new InMemoryProjectRepository();
    repo.projects = [
      {
        id: 'p-1',
        name: 'P1',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        activities: [],
      },
      {
        id: 'p-2',
        name: 'P2',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        activities: [],
      },
      {
        id: 'p-3',
        name: 'P3',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        activities: [],
      },
    ];

    const service = new ProjectService(repo);
    const result = await service.getAllProjects({ page: 2, limit: 1 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('p-2');
    expect(result.meta.totalItems).toBe(3);
    expect(result.meta.totalPages).toBe(3);
    expect(result.meta.currentPage).toBe(2);
    expect(result.meta.pageSize).toBe(1);
  });

  it('debe retornar null cuando se busca un proyecto inexistente por ID', async () => {
    const repo = new InMemoryProjectRepository();
    const service = new ProjectService(repo);

    const result = await service.getProjectById('non-existent');
    expect(result).toBeNull();
  });

  it('debe crear un nuevo proyecto correctamente a través del repositorio', async () => {
    const repo = new InMemoryProjectRepository();
    const service = new ProjectService(repo);

    const created = await service.createProject({
      name: 'Nuevo Proyecto EVM',
      description: 'Prueba de DIP',
    });

    expect(created.name).toBe('Nuevo Proyecto EVM');
    expect(repo.projects).toHaveLength(1);
  });

  it('debe eliminar un proyecto existente retornando true', async () => {
    const repo = new InMemoryProjectRepository();
    repo.projects = [
      {
        id: 'proj-del',
        name: 'Para Eliminar',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        activities: [],
      },
    ];

    const service = new ProjectService(repo);
    const deleted = await service.deleteProject('proj-del');

    expect(deleted).toBe(true);
    expect(repo.projects).toHaveLength(0);
  });
});
