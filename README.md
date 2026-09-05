# Trycore EVM — Earned Value Management Platform (v1.1.0)

Sistema fullstack para líderes de proyecto que permite registrar y gestionar actividades, calculando en tiempo real los indicadores de **Valor Ganado (Earned Value Management — EVM)** según el estándar PMI, ofreciendo visibilidad inmediata sobre la salud presupuestal y de cronograma.

Desarrollado como prueba técnica para el cargo de **Ingeniero de Desarrollo en Trycore Colombia**.

---

## 🌐 Enlaces del Proyecto en Producción

- **Dashboard Principal (Producción Vercel)**: [https://trycore-evm-challenge.vercel.app](https://trycore-evm-challenge.vercel.app)
- **Documentación Interactiva Swagger UI**: [https://trycore-evm-challenge.vercel.app/api-docs](https://trycore-evm-challenge.vercel.app/api-docs)
- **Endpoint Especificación OpenAPI 3.0 (JSON)**: [https://trycore-evm-challenge.vercel.app/api/docs](https://trycore-evm-challenge.vercel.app/api/docs)

---

## 🏛️ Arquitectura del Sistema (Clean Architecture & SOLID)

El proyecto implementa una arquitectura en capas estrictamente desacoplada:

1. **Capa de Dominio y Negocio Puro (`src/core/evm/`)**:
   - Motor matemático 100% puro para el cálculo de EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC) e interpretaciones semánticas.
   - Totalmente independiente de frameworks, ORMs o bases de datos.
2. **Capa de Aplicación y Servicios (`src/core/services/` & `src/core/repositories/`)**:
   - **Inversión de Dependencias (DIP)**: Contratos `IProjectRepository` e `IActivityRepository`.
   - Servicios de aplicación (`ProjectService`, `ActivityService`) con inyección de dependencias por constructor.
   - DTOs y esquemas de validación Zod (`project.dto.ts`, `activity.dto.ts`, `error.dto.ts`).
3. **Capa de Infraestructura y Persistencia (`src/infrastructure/`)**:
   - Implementaciones concretas de repositorios (`PrismaProjectRepository`, `PrismaActivityRepository`) con **Prisma ORM**.
   - Conexión a PostgreSQL serverless en **Supabase** (Transaction pooler en puerto 6543 y direct URL en 5432).
   - Envoltorio de handlers HTTP reutilizable (`createApiHandler`) con logging estructurado y manejo centralizado de excepciones.
   - Especificación OpenAPI 3.0 completa para los endpoints de la API.
4. **Capa de Interfaz de Usuario (`src/components/`, `src/hooks/` & `src/app/`)**:
   - **TanStack Query (React Query v5)**: Deduplicación de peticiones en cliente, caché optimista y revalidación automática post-mutaciones.
   - **React Hook Form + Zod Resolver**: Fuente única de verdad (*Single Source of Truth*) para validación de formularios.
   - **Accesibilidad (A11y)**: Componente modal `ConfirmDialog` accesible (roles ARIA, captura de tecla `Escape` y foco controlado), eliminando por completo llamadas nativas a `confirm()` y `alert()`.
   - Dashboard ejecutivo con KPIs consolidados, badges semafóricos, tabla responsiva y gráfico comparativo de barras agrupadas con **Recharts**.

---

## 📐 Indicadores EVM y Modelo Matemático

El sistema implementa el cálculo por actividad y consolidado por proyecto:

| Indicador | Nombre | Fórmula | Interpretación |
|---|---|---|---|
| **BAC** | Budget at Completion | Presupuesto total planificado | Base presupuestal |
| **PV** | Planned Value | `(% Planificado / 100) × BAC` | Valor planificado a la fecha |
| **EV** | Earned Value | `(% Real / 100) × BAC` | Valor ganado real |
| **AC** | Actual Cost | Costo real incurrido | Gasto ejecutado |
| **CV** | Cost Variance | `EV − AC` | Variación en costo (> 0 favorable) |
| **SV** | Schedule Variance | `EV − PV` | Variación en tiempo (> 0 adelantado) |
| **CPI** | Cost Performance Index | `EV / AC` *(o `null` si AC=0)* | > 1: Bajo presupuesto; < 1: Sobre presupuesto |
| **SPI** | Schedule Performance Index | `EV / PV` *(o `null` si PV=0)* | > 1: Adelantado; < 1: Atrasado |
| **EAC** | Estimate at Completion | `BAC / CPI` *(si CPI > 0)* | Estimación al finalizar |
| **VAC** | Variance at Completion | `BAC − EAC` | Variación presupuestal final |

> **Manejo riguroso de casos borde:** Si $AC = 0$, $CPI$ es `null` ("Sin costos registrados"). Si $PV = 0$, $SPI$ es `null` ("Sin avance planificado"). Se rechaza el uso de valores arbitrarios a `1.0` para evitar contradicciones matemáticas entre variaciones absolutas ($CV, SV$) e índices de desempeño ($CPI, SPI$).

---

## 📡 Endpoints de la API REST (OpenAPI 3.0)

| Método | Ruta | Descripción | Paginación / Parámetros |
|---|---|---|---|
| `GET` | `/api/projects` | Listar proyectos con conteo de actividades | `?page=1&limit=10` (opcional) |
| `POST` | `/api/projects` | Crear un nuevo proyecto | Body: `{ name, description? }` |
| `GET` | `/api/projects/:id` | Detalle del proyecto con actividades e indicadores EVM | Parámetro URL `id` (UUID) |
| `PUT` | `/api/projects/:id` | Actualizar metadata de un proyecto | Body: `{ name?, description? }` |
| `DELETE` | `/api/projects/:id` | Eliminar un proyecto y sus actividades en cascada | Parámetro URL `id` (UUID) |
| `POST` | `/api/projects/:id/activities` | Crear una actividad en un proyecto con cálculo EVM | Body con validación Zod |
| `PUT` | `/api/activities/:id` | Actualizar métricas o nombre de una actividad | Body con validación Zod parcial |
| `DELETE` | `/api/activities/:id` | Eliminar una actividad específica | Parámetro URL `id` (UUID) |
| `GET` | `/api/docs` | Especificación JSON OpenAPI 3.0 | — |

---

## 🧪 Pruebas Automatizadas y Calidad de Código

La plataforma cuenta con una suite integral ejecutada con **Vitest**:

```bash
# Ejecutar todas las pruebas unitarias y de integración (64 tests)
npm test

# Ejecutar pruebas con reporte de cobertura de código
npm run test:coverage

# Ejecutar verificación estricta de linter (ESLint)
npm run lint

# Verificar estilo de código con Prettier
npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css}"

# Formatear el código automáticamente
npm run format

# Compilar para producción (Next.js Build Check)
npm run build
```

### Resultados de Cobertura en Dominio EVM:
- **`src/core/evm/evm.calculator.ts`**: **100%** de cobertura en sentencias, ramas y funciones.
- **`src/core/evm/evm.constants.ts`**: **100%**.
- **`src/core/evm/evm.serializer.ts`**: **100%**.
- **`src/core/evm/evm.ui.helpers.ts`**: **100%**.
- **0 advertencias** y **0 errores** en ESLint.

---

## ⚙️ Integración Continua (CI Quality Gate)

El repositorio cuenta con un pipeline automatizado en **GitHub Actions** (`.github/workflows/ci.yml`) que valida:
1. `npm ci`: Instalación determinista de dependencias.
2. `npm run prisma:generate`: Generación de tipos del ORM.
3. `npx prettier --check`: Verificación de estilo de código.
4. `npm run lint`: Verificación estricta de reglas de TypeScript y ESLint.
5. `npm run test:coverage`: Ejecución de suite de 64 pruebas unitarias e integrales con umbrales de cobertura.
6. `npm run build`: Compilación de producción en Next.js.

---

## 🌿 Flujo Gitflow y Control de Versiones

El proyecto sigue estrictamente el modelo de ramificación Gitflow:
- **`main`**: Código en producción, estable y etiquetado con versiones semánticas (`v1.0.0`, `v1.1.0`).
- **`develop`**: Rama de integración donde convergen todas las características probadas.
- **`feature/*`**: Ramas de características independientes integradas exclusivamente mediante Pull Requests en GitHub con merge commits estándar (`--merge` / `--no-ff`).
  - `feature/data-models` (PR #1)
  - `feature/evm-engine` (PR #2)
  - `feature/api-routes-and-tests` (PR #3)
  - `feature/openapi-docs` (PR #4)
  - `feature/dashboard-ui` (PR #5)
  - `feature/repository-pattern` (PR #6 — Fase 1 de Mejoras)
  - `feature/api-handler-dry` (PR #7 — Fase 2 de Mejoras)
  - `feature/pagination-aggregates` (PR #8 — Fase 3 de Mejoras)
  - `feature/frontend-modernization` (PR #9 — Fase 4 de Mejoras)
  - `feature/ci-quality-gate` (PR #10 — Fase 5 de Mejoras)
- **`release/*`**: Ramas de estabilización y preparación de release (`release/1.0.0`, `release/1.1.0`).
