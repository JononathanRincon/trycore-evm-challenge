import {
  CPI_INTERPRETATION,
  SPI_INTERPRETATION,
} from '@/core/evm/evm.constants';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Trycore EVM Challenge API',
    version: '1.0.0',
    description:
      'API REST para la gestión integral de proyectos y cálculo automatizado de Valor Ganado (Earned Value Management - EVM). Permite la administración de proyectos y sus actividades asociadas, derivando indicadores matemáticos clave (PV, EV, AC, CV, SV, CPI, SPI, EAC, VAC) en tiempo real bajo las mejores prácticas del PMI y rigor numérico IEEE 754.',
    contact: {
      name: 'Jonatan Rincón',
      url: 'https://github.com/JononathanRincon/trycore-evm-challenge',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Servidor actual',
    },
  ],
  tags: [
    {
      name: 'Projects',
      description:
        'Operaciones de administración de proyectos y consolidación de métricas EVM a nivel portafolio.',
    },
    {
      name: 'Activities',
      description:
        'Operaciones sobre actividades de proyectos, con cálculo granular de avance y rendimiento en costos/cronograma.',
    },
  ],
  paths: {
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'Listar proyectos con EVM consolidado',
        description:
          'Retorna el catálogo completo de proyectos registrados. Cada elemento incluye metadatos básicos, conteo de actividades y el consolidado acumulado de presupuesto (BAC), valor ganado (EV), costo real (AC) e índices de desempeño (CPI, SPI). Si un proyecto no tiene actividades, sus agregados retornan 0 y los índices null sin generar excepción.',
        operationId: 'getAllProjects',
        responses: {
          '200': {
            description: 'Lista de proyectos obtenida exitosamente.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ProjectListItemResponse',
                  },
                },
                example: [
                  {
                    id: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
                    name: 'Implementación ERP Corporativo Trycore',
                    description:
                      'Proyecto demo de despliegue de módulos financiero, logístico y de recursos humanos con cálculo de indicadores EVM.',
                    createdAt: '2026-09-04T13:52:36.222Z',
                    updatedAt: '2026-09-04T13:52:36.222Z',
                    activitiesCount: 3,
                    totalBac: 30000,
                    totalEv: 9000,
                    totalAc: 12500,
                    cpi: 0.72,
                    spi: 0.6207,
                    costInterpretation: CPI_INTERPRETATION.OVER_BUDGET,
                    scheduleInterpretation: SPI_INTERPRETATION.BEHIND,
                  },
                ],
              },
            },
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Crear un nuevo proyecto',
        description:
          'Registra un nuevo proyecto en el sistema. Inicialmente no posee actividades asociadas.',
        operationId: 'createProject',
        requestBody: {
          required: true,
          description: 'Datos necesarios para la apertura del proyecto.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateProjectInput',
              },
              example: {
                name: 'Implementación ERP Corporativo Trycore',
                description:
                  'Proyecto demo de despliegue de módulos financiero, logístico y de recursos humanos con cálculo de indicadores EVM.',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Proyecto creado exitosamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Project',
                },
                example: {
                  id: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
                  name: 'Implementación ERP Corporativo Trycore',
                  description:
                    'Proyecto demo de despliegue de módulos financiero, logístico y de recursos humanos con cálculo de indicadores EVM.',
                  createdAt: '2026-09-04T13:52:36.222Z',
                  updatedAt: '2026-09-04T13:52:36.222Z',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Obtener detalle de proyecto con EVM',
        description:
          'Retorna el detalle exhaustivo de un proyecto por su identificador UUID, incluyendo su colección de actividades con sus respectivos indicadores EVM calculados al vuelo y la consolidación matemática total del proyecto.',
        operationId: 'getProjectById',
        parameters: [
          {
            $ref: '#/components/parameters/ProjectIdPathParam',
          },
        ],
        responses: {
          '200': {
            description: 'Detalle del proyecto y métricas EVM obtenido exitosamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProjectDetailResponse',
                },
                example: {
                  id: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
                  name: 'Implementación ERP Corporativo Trycore',
                  description:
                    'Proyecto demo de despliegue de módulos financiero, logístico y de recursos humanos con cálculo de indicadores EVM.',
                  createdAt: '2026-09-04T13:52:36.222Z',
                  updatedAt: '2026-09-04T13:52:36.222Z',
                  activities: [
                    {
                      id: '0a0deaec-ca5e-4328-9eaf-5570a74ac5c4',
                      projectId: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
                      name: 'Diseño y Prototipado de Arquitectura',
                      bac: 10000,
                      plannedProgress: 50,
                      actualProgress: 40,
                      actualCost: 6000,
                      createdAt: '2026-09-04T13:52:36.222Z',
                      updatedAt: '2026-09-04T13:52:36.222Z',
                      pv: 5000,
                      ev: 4000,
                      cv: -2000,
                      sv: -1000,
                      cpi: 0.6667,
                      spi: 0.8,
                      eac: 15000,
                      vac: -5000,
                      costInterpretation: CPI_INTERPRETATION.OVER_BUDGET,
                      scheduleInterpretation: SPI_INTERPRETATION.BEHIND,
                    },
                    {
                      id: '23a9e881-92f9-4803-bd97-f8bc27160dab',
                      projectId: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
                      name: 'Configuración y Migración de Base de Datos',
                      bac: 5000,
                      plannedProgress: 100,
                      actualProgress: 100,
                      actualCost: 4500,
                      createdAt: '2026-09-04T13:52:36.222Z',
                      updatedAt: '2026-09-04T13:52:36.222Z',
                      pv: 5000,
                      ev: 5000,
                      cv: 500,
                      sv: 0,
                      cpi: 1.1111,
                      spi: 1.0,
                      eac: 4500,
                      vac: 500,
                      costInterpretation: CPI_INTERPRETATION.UNDER_BUDGET,
                      scheduleInterpretation: SPI_INTERPRETATION.ON_TIME,
                    },
                    {
                      id: '8206d606-c6c4-4a85-818b-b87d9c7a4e23',
                      projectId: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
                      name: 'Desarrollo de Módulo de Facturación Electrónica',
                      bac: 15000,
                      plannedProgress: 30,
                      actualProgress: 0,
                      actualCost: 2000,
                      createdAt: '2026-09-04T13:52:36.222Z',
                      updatedAt: '2026-09-04T13:52:36.222Z',
                      pv: 4500,
                      ev: 0,
                      cv: -2000,
                      sv: -4500,
                      cpi: 0,
                      spi: 0,
                      eac: null,
                      vac: null,
                      costInterpretation: CPI_INTERPRETATION.OVER_BUDGET,
                      scheduleInterpretation: SPI_INTERPRETATION.BEHIND,
                    },
                  ],
                  consolidatedEvm: {
                    totalBac: 30000,
                    totalPv: 14500,
                    totalEv: 9000,
                    totalAc: 12500,
                    activitiesCount: 3,
                    pv: 14500,
                    ev: 9000,
                    cv: -3500,
                    sv: -5500,
                    cpi: 0.72,
                    spi: 0.6207,
                    eac: 41666.6667,
                    vac: -11666.6667,
                    costInterpretation: CPI_INTERPRETATION.OVER_BUDGET,
                    scheduleInterpretation: SPI_INTERPRETATION.BEHIND,
                  },
                },
              },
            },
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      put: {
        tags: ['Projects'],
        summary: 'Actualizar metadatos de un proyecto',
        description:
          'Permite modificar el nombre y/o la descripción de un proyecto existente. No altera de manera directa las actividades.',
        operationId: 'updateProject',
        parameters: [
          {
            $ref: '#/components/parameters/ProjectIdPathParam',
          },
        ],
        requestBody: {
          required: true,
          description: 'Campos actualizables del proyecto.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateProjectInput',
              },
              example: {
                name: 'Implementación ERP Corporativo Trycore - Fase 1',
                description:
                  'Despliegue inicial de módulos financiero y logístico con alcance ajustado.',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Proyecto actualizado exitosamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Project',
                },
                example: {
                  id: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
                  name: 'Implementación ERP Corporativo Trycore - Fase 1',
                  description:
                    'Despliegue inicial de módulos financiero y logístico con alcance ajustado.',
                  createdAt: '2026-09-04T13:52:36.222Z',
                  updatedAt: '2026-09-04T14:00:00.000Z',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Eliminar un proyecto en cascada',
        description:
          'Elimina permanentemente un proyecto y todas sus actividades subordinadas en cascada.',
        operationId: 'deleteProject',
        parameters: [
          {
            $ref: '#/components/parameters/ProjectIdPathParam',
          },
        ],
        responses: {
          '200': {
            description: 'Proyecto y actividades eliminados exitosamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessMessageResponse',
                },
                example: {
                  message: 'Proyecto y sus actividades asociadas eliminados exitosamente',
                },
              },
            },
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/projects/{id}/activities': {
      post: {
        tags: ['Activities'],
        summary: 'Crear una actividad en un proyecto',
        description:
          'Registra una nueva actividad asociada al proyecto indicado en el path. Calcula al vuelo y retorna sus indicadores EVM individuales.',
        operationId: 'createActivity',
        parameters: [
          {
            $ref: '#/components/parameters/ProjectIdPathParam',
          },
        ],
        requestBody: {
          required: true,
          description: 'Datos de la actividad con presupuesto y porcentajes de avance.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateActivityInput',
              },
              example: {
                name: 'Diseño y Prototipado de Arquitectura',
                bac: 10000,
                plannedProgress: 50,
                actualProgress: 40,
                actualCost: 6000,
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Actividad creada con indicadores EVM calculados.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ActivityWithEvmResponse',
                },
                example: {
                  id: '0a0deaec-ca5e-4328-9eaf-5570a74ac5c4',
                  projectId: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
                  name: 'Diseño y Prototipado de Arquitectura',
                  bac: 10000,
                  plannedProgress: 50,
                  actualProgress: 40,
                  actualCost: 6000,
                  createdAt: '2026-09-04T13:52:36.222Z',
                  updatedAt: '2026-09-04T13:52:36.222Z',
                  pv: 5000,
                  ev: 4000,
                  cv: -2000,
                  sv: -1000,
                  cpi: 0.6667,
                  spi: 0.8,
                  eac: 15000,
                  vac: -5000,
                  costInterpretation: CPI_INTERPRETATION.OVER_BUDGET,
                  scheduleInterpretation: SPI_INTERPRETATION.BEHIND,
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/activities/{id}': {
      put: {
        tags: ['Activities'],
        summary: 'Actualizar actividad y recalcular EVM',
        description:
          'Actualiza de forma parcial o total los datos de una actividad. El servicio realiza un merge seguro con los valores persistidos antes de invocar el motor de cálculo EVM para garantizar consistencia matemática.',
        operationId: 'updateActivity',
        parameters: [
          {
            $ref: '#/components/parameters/ActivityIdPathParam',
          },
        ],
        requestBody: {
          required: true,
          description: 'Campos de la actividad a actualizar.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateActivityInput',
              },
              example: {
                actualProgress: 60,
                actualCost: 7500,
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Actividad actualizada con EVM recalculado.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ActivityWithEvmResponse',
                },
                example: {
                  id: '0a0deaec-ca5e-4328-9eaf-5570a74ac5c4',
                  projectId: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
                  name: 'Diseño y Prototipado de Arquitectura',
                  bac: 10000,
                  plannedProgress: 50,
                  actualProgress: 60,
                  actualCost: 7500,
                  createdAt: '2026-09-04T13:52:36.222Z',
                  updatedAt: '2026-09-04T14:30:00.000Z',
                  pv: 5000,
                  ev: 6000,
                  cv: -1500,
                  sv: 1000,
                  cpi: 0.8,
                  spi: 1.2,
                  eac: 12500,
                  vac: -2500,
                  costInterpretation: CPI_INTERPRETATION.OVER_BUDGET,
                  scheduleInterpretation: SPI_INTERPRETATION.AHEAD,
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      delete: {
        tags: ['Activities'],
        summary: 'Eliminar una actividad',
        description:
          'Elimina permanentemente una actividad individual por su identificador UUID.',
        operationId: 'deleteActivity',
        parameters: [
          {
            $ref: '#/components/parameters/ActivityIdPathParam',
          },
        ],
        responses: {
          '200': {
            description: 'Actividad eliminada exitosamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessMessageResponse',
                },
                example: {
                  message: 'Actividad eliminada exitosamente',
                },
              },
            },
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
  },
  components: {
    parameters: {
      ProjectIdPathParam: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Identificador único UUID del proyecto',
        schema: {
          type: 'string',
          format: 'uuid',
          example: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
        },
      },
      ActivityIdPathParam: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Identificador único UUID de la actividad',
        schema: {
          type: 'string',
          format: 'uuid',
          example: '0a0deaec-ca5e-4328-9eaf-5570a74ac5c4',
        },
      },
    },
    responses: {
      ValidationError: {
        description:
          'Error de validación en la solicitud (400 Bad Request). Los datos no cumplen con las reglas de negocio (ej. BAC negativo, porcentaje fuera de rango 0-100 o JSON malformado).',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              statusCode: 400,
              error: 'Bad Request',
              message: 'Error de validación en los datos enviados',
              details: [
                {
                  field: 'bac',
                  message: 'El BAC (presupuesto planificado) no puede ser negativo',
                },
                {
                  field: 'actualProgress',
                  message: 'El porcentaje real completado no puede exceder 100',
                },
              ],
              timestamp: '2026-09-04T13:52:36.222Z',
            },
          },
        },
      },
      NotFound: {
        description:
          'Recurso no encontrado (404 Not Found). El UUID solicitado no corresponde a ningún proyecto o actividad existente.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              statusCode: 404,
              error: 'Not Found',
              message: 'Proyecto no encontrado',
              timestamp: '2026-09-04T13:52:36.222Z',
            },
          },
        },
      },
      InternalServerError: {
        description:
          'Error interno del servidor (500 Internal Server Error). Falla no controlada al comunicarse con la base de datos u otro servicio.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              statusCode: 500,
              error: 'Internal Server Error',
              message: 'Error interno del servidor al procesar la solicitud',
              timestamp: '2026-09-04T13:52:36.222Z',
            },
          },
        },
      },
    },
    schemas: {
      Project: {
        type: 'object',
        required: ['id', 'name', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Identificador único del proyecto.',
            example: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
          },
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 150,
            description: 'Nombre descriptivo del proyecto.',
            example: 'Implementación ERP Corporativo Trycore',
          },
          description: {
            type: 'string',
            nullable: true,
            maxLength: 500,
            description: 'Descripción detallada u objetivo del proyecto.',
            example:
              'Proyecto demo de despliegue de módulos financiero, logístico y de recursos humanos con cálculo de indicadores EVM.',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha y hora ISO 8601 de creación.',
            example: '2026-09-04T13:52:36.222Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha y hora ISO 8601 de última actualización.',
            example: '2026-09-04T13:52:36.222Z',
          },
        },
      },
      CreateProjectInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 150,
            description: 'Nombre del proyecto.',
            example: 'Implementación ERP Corporativo Trycore',
          },
          description: {
            type: 'string',
            maxLength: 500,
            description: 'Descripción opcional del proyecto.',
            example:
              'Proyecto demo de despliegue de módulos financiero, logístico y de recursos humanos con cálculo de indicadores EVM.',
          },
        },
      },
      UpdateProjectInput: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 150,
            description: 'Nombre actualizado del proyecto.',
            example: 'Implementación ERP Corporativo Trycore - Fase 1',
          },
          description: {
            type: 'string',
            maxLength: 500,
            description: 'Descripción actualizada del proyecto.',
            example:
              'Despliegue inicial de módulos financiero y logístico con alcance ajustado.',
          },
        },
      },
      ProjectListItemResponse: {
        type: 'object',
        required: [
          'id',
          'name',
          'description',
          'createdAt',
          'updatedAt',
          'activitiesCount',
          'totalBac',
          'totalEv',
          'totalAc',
          'cpi',
          'spi',
          'costInterpretation',
          'scheduleInterpretation',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
          },
          name: {
            type: 'string',
            example: 'Implementación ERP Corporativo Trycore',
          },
          description: {
            type: 'string',
            nullable: true,
            example:
              'Proyecto demo de despliegue de módulos financiero, logístico y de recursos humanos con cálculo de indicadores EVM.',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-04T13:52:36.222Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-04T13:52:36.222Z',
          },
          activitiesCount: {
            type: 'integer',
            description: 'Cantidad de actividades vinculadas.',
            example: 3,
          },
          totalBac: {
            type: 'number',
            description: 'Suma de presupuestos planificados (BAC).',
            example: 30000,
          },
          totalEv: {
            type: 'number',
            description: 'Suma de valor ganado acumulado (EV).',
            example: 9000,
          },
          totalAc: {
            type: 'number',
            description: 'Suma de costos reales erogados (AC).',
            example: 12500,
          },
          cpi: {
            type: 'number',
            nullable: true,
            description:
              'Índice de desempeño de costos (EV / AC). Retorna null estricto si AC <= 0.',
            example: 0.72,
          },
          spi: {
            type: 'number',
            nullable: true,
            description:
              'Índice de desempeño de cronograma (EV / PV). Retorna null estricto si PV <= 0.',
            example: 0.6207,
          },
          costInterpretation: {
            type: 'string',
            description: 'Diagnóstico cualitativo de costos.',
            example: CPI_INTERPRETATION.OVER_BUDGET,
          },
          scheduleInterpretation: {
            type: 'string',
            description: 'Diagnóstico cualitativo de avance.',
            example: SPI_INTERPRETATION.BEHIND,
          },
        },
      },
      ProjectDetailResponse: {
        type: 'object',
        required: [
          'id',
          'name',
          'description',
          'createdAt',
          'updatedAt',
          'activities',
          'consolidatedEvm',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
          },
          name: {
            type: 'string',
            example: 'Implementación ERP Corporativo Trycore',
          },
          description: {
            type: 'string',
            nullable: true,
            example:
              'Proyecto demo de despliegue de módulos financiero, logístico y de recursos humanos con cálculo de indicadores EVM.',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-04T13:52:36.222Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-04T13:52:36.222Z',
          },
          activities: {
            type: 'array',
            description: 'Listado de actividades con métricas individuales calculadas.',
            items: {
              $ref: '#/components/schemas/ActivityWithEvmResponse',
            },
          },
          consolidatedEvm: {
            $ref: '#/components/schemas/ProjectEvmConsolidated',
          },
        },
      },
      Activity: {
        type: 'object',
        required: [
          'id',
          'projectId',
          'name',
          'bac',
          'plannedProgress',
          'actualProgress',
          'actualCost',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '0a0deaec-ca5e-4328-9eaf-5570a74ac5c4',
          },
          projectId: {
            type: 'string',
            format: 'uuid',
            example: 'c85c708f-4e0c-41d3-a984-0ecd5df388ee',
          },
          name: {
            type: 'string',
            example: 'Diseño y Prototipado de Arquitectura',
          },
          bac: {
            type: 'number',
            minimum: 0,
            description: 'Presupuesto total planificado (Budget at Completion).',
            example: 10000,
          },
          plannedProgress: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Porcentaje planificado a la fecha (0 a 100).',
            example: 50,
          },
          actualProgress: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description:
              'Porcentaje de avance real completado (0 a 100). Nota: Un valor de 0% es perfectamente válido.',
            example: 40,
          },
          actualCost: {
            type: 'number',
            minimum: 0,
            description: 'Costo real financiero ejecutado hasta la fecha (AC).',
            example: 6000,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-04T13:52:36.222Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-04T13:52:36.222Z',
          },
        },
      },
      CreateActivityInput: {
        type: 'object',
        required: ['name', 'bac', 'plannedProgress', 'actualProgress', 'actualCost'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 150,
            description: 'Nombre de la actividad.',
            example: 'Diseño y Prototipado de Arquitectura',
          },
          bac: {
            type: 'number',
            minimum: 0,
            description: 'Presupuesto total asignado. No puede ser negativo.',
            example: 10000,
          },
          plannedProgress: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Porcentaje de avance programado (0 a 100).',
            example: 50,
          },
          actualProgress: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description:
              'Porcentaje real de ejecución (0 a 100). 0% es válido y representa actividad sin iniciar.',
            example: 40,
          },
          actualCost: {
            type: 'number',
            minimum: 0,
            description: 'Costo financiero real erogado (AC). No puede ser negativo.',
            example: 6000,
          },
        },
      },
      UpdateActivityInput: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 150,
            description: 'Nombre de la actividad.',
            example: 'Diseño y Prototipado de Arquitectura',
          },
          bac: {
            type: 'number',
            minimum: 0,
            description: 'Presupuesto planificado.',
            example: 10000,
          },
          plannedProgress: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Porcentaje planificado.',
            example: 60,
          },
          actualProgress: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Porcentaje real completado.',
            example: 60,
          },
          actualCost: {
            type: 'number',
            minimum: 0,
            description: 'Costo real acumulado.',
            example: 7500,
          },
        },
      },
      ActivityEvmMetrics: {
        type: 'object',
        required: [
          'pv',
          'ev',
          'cv',
          'sv',
          'cpi',
          'spi',
          'eac',
          'vac',
          'costInterpretation',
          'scheduleInterpretation',
        ],
        properties: {
          pv: {
            type: 'number',
            description:
              'Valor Planificado (Planned Value): (plannedProgress / 100) * BAC.',
            example: 5000,
          },
          ev: {
            type: 'number',
            description:
              'Valor Ganado (Earned Value): (actualProgress / 100) * BAC. Si actualProgress = 0, EV = 0.',
            example: 4000,
          },
          cv: {
            type: 'number',
            description:
              'Variación del Costo (Cost Variance): EV - AC. Negativo indica sobrecosto.',
            example: -2000,
          },
          sv: {
            type: 'number',
            description:
              'Variación del Cronograma (Schedule Variance): EV - PV. Negativo indica retraso.',
            example: -1000,
          },
          cpi: {
            type: 'number',
            nullable: true,
            description:
              'Índice de Desempeño del Costo (Cost Performance Index): EV / AC. Retorna null estricto si AC <= 0. Si AC > 0 y EV = 0, retorna 0 (no null).',
            example: 0.6667,
          },
          spi: {
            type: 'number',
            nullable: true,
            description:
              'Índice de Desempeño del Cronograma (Schedule Performance Index): EV / PV. Retorna null estricto si PV <= 0.',
            example: 0.8,
          },
          eac: {
            type: 'number',
            nullable: true,
            description:
              'Estimación al Finalizar (Estimate at Completion): BAC / CPI. Retorna null si cpi es null o cpi <= 0 (evita división por cero).',
            example: 15000,
          },
          vac: {
            type: 'number',
            nullable: true,
            description:
              'Variación al Finalizar (Variance at Completion): BAC - EAC. Retorna null si eac es null.',
            example: -5000,
          },
          costInterpretation: {
            type: 'string',
            enum: [
              CPI_INTERPRETATION.NO_COSTS,
              CPI_INTERPRETATION.UNDER_BUDGET,
              CPI_INTERPRETATION.OVER_BUDGET,
              CPI_INTERPRETATION.ON_BUDGET,
            ],
            description: 'Interpretación semántica del índice de costo CPI.',
            example: CPI_INTERPRETATION.OVER_BUDGET,
          },
          scheduleInterpretation: {
            type: 'string',
            enum: [
              SPI_INTERPRETATION.NO_SCHEDULE,
              SPI_INTERPRETATION.AHEAD,
              SPI_INTERPRETATION.BEHIND,
              SPI_INTERPRETATION.ON_TIME,
            ],
            description: 'Interpretación semántica del índice de cronograma SPI.',
            example: SPI_INTERPRETATION.BEHIND,
          },
        },
      },
      ActivityWithEvmResponse: {
        allOf: [
          {
            $ref: '#/components/schemas/Activity',
          },
          {
            $ref: '#/components/schemas/ActivityEvmMetrics',
          },
        ],
      },
      ProjectEvmConsolidated: {
        allOf: [
          {
            type: 'object',
            required: ['totalBac', 'totalPv', 'totalEv', 'totalAc', 'activitiesCount'],
            properties: {
              totalBac: {
                type: 'number',
                description: 'Presupuesto total consolidado de todas las actividades.',
                example: 30000,
              },
              totalPv: {
                type: 'number',
                description: 'Valor planificado consolidado.',
                example: 14500,
              },
              totalEv: {
                type: 'number',
                description: 'Valor ganado consolidado.',
                example: 9000,
              },
              totalAc: {
                type: 'number',
                description: 'Costo real consolidado.',
                example: 12500,
              },
              activitiesCount: {
                type: 'integer',
                description:
                  'Cantidad total de actividades que componen la agregación. Si es 0, no falla y devuelve métricas en 0 y null.',
                example: 3,
              },
            },
          },
          {
            $ref: '#/components/schemas/ActivityEvmMetrics',
          },
        ],
      },
      ValidationErrorDetail: {
        type: 'object',
        required: ['field', 'message'],
        properties: {
          field: {
            type: 'string',
            description: 'Nombre del campo inválido.',
            example: 'bac',
          },
          message: {
            type: 'string',
            description: 'Descripción específica de la regla infringida.',
            example: 'El BAC (presupuesto planificado) no puede ser negativo',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['statusCode', 'error', 'message', 'timestamp'],
        properties: {
          statusCode: {
            type: 'integer',
            description: 'Código de estado HTTP del error.',
            example: 400,
          },
          error: {
            type: 'string',
            description: 'Nombre estándar del error HTTP.',
            example: 'Bad Request',
          },
          message: {
            type: 'string',
            description: 'Mensaje descriptivo del motivo del error.',
            example: 'Error de validación en los datos enviados',
          },
          details: {
            type: 'array',
            description: 'Lista detallada de validaciones fallidas cuando aplica.',
            items: {
              $ref: '#/components/schemas/ValidationErrorDetail',
            },
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Marca de tiempo ISO 8601 en que ocurrió el error.',
            example: '2026-09-04T13:52:36.222Z',
          },
        },
      },
      SuccessMessageResponse: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            example: 'Operación completada exitosamente',
          },
        },
      },
    },
  },
};
