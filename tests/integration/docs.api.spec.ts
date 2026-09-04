import { describe, it, expect } from 'vitest';
import { openApiSpec } from '@/infrastructure/docs/openapi.spec';
import { GET as getDocsRoute } from '@/app/api/docs/route';

describe('OpenAPI 3.0 Specification Integrity', () => {
  it('debe tener versión OpenAPI 3.0.x y metadatos informativos requeridos', () => {
    expect(openApiSpec.openapi).toMatch(/^3\.0\.\d+$/);
    expect(openApiSpec.info.title).toBe('Trycore EVM Challenge API');
    expect(openApiSpec.info.version).toBe('1.0.0');
    expect(openApiSpec.paths).toBeDefined();
    expect(openApiSpec.components).toBeDefined();
  });

  it('debe contener exactamente las 8 operaciones REST divididas en Projects (5) y Activities (3)', () => {
    const paths = openApiSpec.paths;

    // Verificar las 8 operaciones
    const operations: { method: string; path: string; tag: string }[] = [];

    for (const [pathKey, pathItem] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          operations.push({
            method: method.toUpperCase(),
            path: pathKey,
            tag: (operation as any).tags[0],
          });
        }
      }
    }

    expect(operations).toHaveLength(8);

    const projectOps = operations.filter((op) => op.tag === 'Projects');
    const activityOps = operations.filter((op) => op.tag === 'Activities');

    expect(projectOps).toHaveLength(5);
    expect(activityOps).toHaveLength(3);

    // Verificación puntual de cada operación
    expect(projectOps).toEqual(
      expect.arrayContaining([
        { method: 'GET', path: '/api/projects', tag: 'Projects' },
        { method: 'POST', path: '/api/projects', tag: 'Projects' },
        { method: 'GET', path: '/api/projects/{id}', tag: 'Projects' },
        { method: 'PUT', path: '/api/projects/{id}', tag: 'Projects' },
        { method: 'DELETE', path: '/api/projects/{id}', tag: 'Projects' },
      ])
    );

    expect(activityOps).toEqual(
      expect.arrayContaining([
        { method: 'POST', path: '/api/projects/{id}/activities', tag: 'Activities' },
        { method: 'PUT', path: '/api/activities/{id}', tag: 'Activities' },
        { method: 'DELETE', path: '/api/activities/{id}', tag: 'Activities' },
      ])
    );
  });

  it('todos los $ref en paths deben apuntar a componentes existentes', () => {
    const specStr = JSON.stringify(openApiSpec);
    const refMatches = Array.from(specStr.matchAll(/"\$ref":"#\/components\/([^"]+)"/g));

    expect(refMatches.length).toBeGreaterThan(0);

    for (const match of refMatches) {
      const refPath = match[1]; // ej: "schemas/Project" o "responses/NotFound"
      const [section, name] = refPath.split('/');
      const sectionObj = (openApiSpec.components as any)[section];
      expect(
        sectionObj,
        `Sección components.${section} no existe para $ref: ${match[0]}`
      ).toBeDefined();
      expect(
        sectionObj[name],
        `Componente ${name} no existe en components.${section} para $ref: ${match[0]}`
      ).toBeDefined();
    }
  });

  it('debe documentar explícitamente los casos borde de EVM en los schemas', () => {
    const schemas = openApiSpec.components.schemas;

    // Caso 1: AC <= 0 -> CPI null
    expect(schemas.ActivityEvmMetrics.properties.cpi.description).toContain('null estricto');
    // Caso 2: Proyecto sin actividades -> agregados en 0/null
    expect(schemas.ProjectEvmConsolidated.allOf[0].properties.activitiesCount.description).toContain(
      'Si es 0, no falla y devuelve métricas en 0 y null'
    );
    // Caso 3: actualProgress = 0% es válido
    expect(schemas.Activity.properties.actualProgress.description).toContain(
      '0% es perfectamente válido'
    );
  });

  it('GET /api/docs debe responder con el objeto OpenAPI en JSON con status 200', async () => {
    const response = await getDocsRoute();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.openapi).toBe('3.0.3');
    expect(json.info.title).toBe('Trycore EVM Challenge API');
    expect(Object.keys(json.paths)).toHaveLength(4); // 4 paths REST que albergan las 8 operaciones
  });
});
