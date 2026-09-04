# Plan de Implementación — Prueba Técnica Trycore Colombia (Fullstack EVM)

Implementación de una plataforma fullstack para la gestión de proyectos y cálculo automatizado de indicadores de **Valor Ganado (Earned Value Management - EVM)**, cumpliendo con todos los requerimientos especificados en el documento oficial *"Desafío técnico — Ingeniero de Desarrollo Trycore Colombia"* y el prompt maestro con metodología RTF + CIDI.

Repositorio: https://github.com/JononathanRincon/trycore-evm-challenge.git

---

## Validación de Requerimientos vs. Documento PDF

Se realizó una auditoría completa del documento `Ingeniero de Desarrollo — Trycore Colombia (1).pdf` para asegurar el cumplimiento del 100% de los puntos:

| Requerimiento del PDF | Estado en la Propuesta | Detalle de Implementación |
|---|---|---|
| **CRUD de Proyectos y Actividades** | ✅ Cumplido | API REST para crear, editar, listar y eliminar proyectos y actividades. |
| **Campos obligatorios de Actividad** | ✅ Cumplido | Nombre, BAC, % planificado, % real completado, Costo real (AC). |
| **Cálculo de 8 Indicadores EVM** | ✅ Cumplido | PV, EV, CV, SV, CPI, SPI, EAC, VAC calculados por actividad y consolidados por proyecto. |
| **Interpretación textual de CPI y SPI** | ✅ Cumplido | Respuestas del API y UI con texto explícito ("Bajo presupuesto", "Sobre presupuesto", "Adelantado", "Atrasado", "En presupuesto", "A tiempo"). |
| **Manejo de Casos Borde EVM** | ✅ Cumplido | Tests dedicados para: AC = 0 (evitar división por cero en CPI), PV = 0 (en SPI), proyectos sin actividades (agregados en cero/null), avance real = 0% (EV = 0 con CV y SV calculables). |
| **Dashboard Frontend con Tiempo Real** | ✅ Cumplido | Dashboard en Next.js con tabla interactiva, formulario modal/drawer para actividades, tarjetas de indicadores consolidados. |
| **Semáforo visual de estado** | ✅ Cumplido | Badges dinámicos con código de color (Verde/Amarillo/Rojo) según umbrales de CPI y SPI. |
| **Gráfica comparativa PV / EV / AC** | ✅ Cumplido | Gráfica de barras/líneas agrupadas por actividad usando **Recharts**. |
| **Cero Code Smells & Linter** | ✅ Cumplido | ESLint + Prettier configurados, sin código muerto, constantes semánticas (sin números mágicos), funciones con responsabilidad única. |
| **Arquitectura en Capas** | ✅ Cumplido | Separación estricta: `app/api/*` (Controllers/Routes) → `services/*` (Lógica de negocio pura EVM) → `repositories/*` / Prisma (Acceso a datos). Cero lógica de negocio en controladores. |
| **Pruebas Unitarias ≥ 80% Cobertura** | ✅ Cumplido | Vitest configurado con tests numéricos exactos para la capa de negocio (`evm-calculator.service.ts`). |
| **Pruebas de Integración de Endpoints** | ✅ Cumplido | Tests de integración validando contratos JSON, status codes y manejo de errores. |
| **Documentación OpenAPI en `/api-docs`** | ✅ Cumplido | Swagger UI interactivo servido en `/api-docs` con schemas OpenAPI 3.0 para todas las entidades y endpoints. |
| **Gitflow Estricto** | ✅ Cumplido | Ramas `main`, `develop`, ramas `feature/*` por cada funcionalidad integradas vía merge/PR, rama `release/*` previa a `main`, commits imperativos y descriptivos. |
| **Entregable: `README.md`** | ✅ Cumplido | Instrucciones claras de instalación, variables de entorno, migración y seed de base de datos. |
| **Entregable: `AI_PROCESS.md`** | ✅ Cumplido | Documento exhaustivo con herramientas usadas, prompts cronológicos textuales, aprendizaje/validación manual de EVM, 2 decisiones divergentes de la IA, decisión independiente de arquitectura y reflexión honesta. |
| **Entregable: Demo para Video (10 min)** | ✅ Cumplido | Script de seed con 1 proyecto y 3+ actividades representativas (una saludable, una atrasada/sobrecoste y una recién iniciada) listo para la grabación. |

---

## Skills utilizadas del directorio `.agents`

> ⚠️ Esta carpeta (`C:\Users\Galiatech\Documents\PruebaTecnica\.agents`) es local y **no se sube al repositorio** — protegida vía `.gitignore` desde el primer commit.

- **`ui-ux-pro-max` + `frontend-design` + `ui-styling` + `web-design-guidelines`** → jerarquía visual y tokens de color para los semáforos de CPI/SPI (verde para favorable, rojo para desfavorable, neutro para "en presupuesto"/"sin datos"); tabla de actividades accesible con tipografía monoespaciada para valores financieros; estilización limpia de Recharts.
- **`vercel-react-best-practices` + `vercel-composition-patterns`** → separación de componentes de servidor (carga inicial) y de cliente (interactividad: gráficos, modales, feedback en tiempo real) en Next.js App Router; arquitectura desacoplada para evitar re-renderizados innecesarios.
- **`supabase-postgres-best-practices`** → modelado en Prisma con buenas prácticas relacionales: claves foráneas indexadas (`projectId`), `onDelete: Cascade`, tipos `Float` de precisión para BAC/porcentajes/AC.
- **`deploy-to-vercel` + `writing-guidelines`** → configuración del despliegue serverless y documentación técnica clara en `README.md` y `AI_PROCESS.md`.

---

## Decisiones de Arquitectura Justificadas

> **DECISIÓN 1 (Stack tecnológico):** Se adopta **Next.js 14+ (App Router, TypeScript) + Prisma ORM + Tailwind CSS + Recharts + Vitest**.
> *Justificación:* Permite un monorepo cohesivo con backend API y frontend en un solo proyecto tipado de punta a punta, sin sacrificar la separación arquitectónica en capas (Controllers → Services → Data Access), y facilita el despliegue serverless continuo en Vercel con PostgreSQL (Neon / Vercel Postgres). Es una desviación del stack sugerido por Trycore (Java/Spring o Python/FastAPI + Angular/React), documentada explícitamente en `AI_PROCESS.md`.

> **DECISIÓN 2 (Aislamiento del motor de cálculo EVM):** El cálculo de EVM se implementa como un módulo de funciones puras (`src/core/evm/`), completamente agnóstico de bases de datos, frameworks o peticiones HTTP.
> *Justificación:* Garantiza testeabilidad al 100% sin necesidad de mocks de base de datos o simulación de contextos HTTP, cumpliendo el principio de responsabilidad única (SRP) y asegurando que las reglas del PMI estén encapsuladas en un núcleo matemático limpio.

> **DECISIÓN 3 (Null estricto en CPI/SPI, sin fallback a 1.0):** Cuando AC=0 o PV=0, CPI y SPI quedan como `null` (no calculable), sin importar el valor de EV — nunca se fuerza un valor por defecto como 1.0.
> *Justificación:* Un fallback a 1.0 contradice matemáticamente a CV y SV en el mismo caso borde (ej. PV=0 con EV>0 da SV positivo "adelantado", pero un SPI forzado a 1.0 diría "a tiempo" — indicadores contradictorios sobre el mismo dato). Esta es una de las dos decisiones divergentes frente a una sugerencia inicial de la IA, documentada en `AI_PROCESS.md` con el ejemplo numérico que evidencia la inconsistencia.

---

## Estructura de Carpetas Propuesta

```text
PruebaTecnica/
├── .agents/                      # Skills locales — NO se sube al repo (.gitignore)
├── .github/                      # Templates de PR si aplica
├── prisma/
│   ├── schema.prisma             # Modelos Project y Activity
│   ├── migrations/               # Historial de migraciones
│   └── seed.ts                   # Semilla con 1 proyecto y 3 actividades para demo
├── public/                       # Assets estáticos
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (dashboard)/          # Vistas de la aplicación
│   │   │   ├── page.tsx          # Dashboard principal de proyectos
│   │   │   └── projects/[id]/    # Detalle de proyecto, actividades y gráficos
│   │   ├── api/                  # API REST (Controllers delgados)
│   │   │   ├── projects/
│   │   │   │   ├── route.ts      # GET (listar), POST (crear)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts  # GET (detalle con EVM), PUT (editar), DELETE
│   │   │   │       └── activities/
│   │   │   │           └── route.ts # POST (crear actividad en proyecto)
│   │   │   ├── activities/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts  # PUT (editar actividad), DELETE (eliminar)
│   │   │   └── docs/
│   │   │       └── route.ts      # Endpoint que sirve el JSON de OpenAPI
│   │   ├── api-docs/             # Página con Swagger UI interactivo
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/               # Componentes de UI
│   │   ├── dashboard/            # Indicadores consolidados, métricas EVM, badges
│   │   ├── activities/           # Tabla de actividades, modales crear/editar
│   │   ├── charts/                # Gráfica comparativa PV/EV/AC (Recharts)
│   │   └── ui/                   # Botones, inputs, tarjetas, badges
│   ├── core/                     # Capa de Dominio y Lógica de Negocio
│   │   ├── evm/
│   │   │   ├── evm.types.ts      # Tipos e interfaces de entrada/salida EVM
│   │   │   ├── evm.constants.ts  # Constantes (umbrales de interpretación, etc.)
│   │   │   └── evm.calculator.ts # Funciones matemáticas puras (actividad y consolidado)
│   │   └── services/             # Servicios de orquestación de negocio
│   │       ├── project.service.ts
│   │       └── activity.service.ts
│   ├── infrastructure/           # Capa de Datos y Clientes Externos
│   │   ├── db/
│   │   │   └── prisma.ts         # Singleton de cliente Prisma
│   │   └── docs/
│   │       └── openapi.spec.ts   # Definición OpenAPI 3.0 tipada
│   └── types/                    # Tipos compartidos
├── tests/                        # Suite de Pruebas
│   ├── unit/
│   │   └── evm.calculator.spec.ts # Pruebas unitarias de fórmulas y casos borde
│   └── integration/
│       ├── projects.api.spec.ts  # Pruebas de integración de endpoints
│       └── activities.api.spec.ts
├── .env.example
├── .eslintrc.json
├── .gitignore                    # Incluye .agents/, node_modules/, .next/, .env
├── .prettierrc
├── vitest.config.ts
├── package.json
├── tsconfig.json
├── README.md                     # Instrucciones de ejecución y documentación
└── AI_PROCESS.md                 # Registro transparente del proceso asistido por IA
```

---

## Modelo de Datos (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Project {
  id          String     @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  activities  Activity[]

  @@map("projects")
}

model Activity {
  id                 String   @id @default(uuid())
  name               String
  projectId          String
  project            Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  bac                Float    // Presupuesto total planificado (Budget at Completion)
  plannedProgress    Float    // Porcentaje de avance planificado (0 a 100)
  actualProgress     Float    // Porcentaje de avance real (0 a 100)
  actualCost         Float    // Costo real incurrido hasta la fecha (AC)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@map("activities")
}
```

*Nota sobre campos calculados:* Los indicadores EVM **no se almacenan en la base de datos** porque son métricas derivadas dinámicas que cambian con cada avance o corte. Almacenarlos violaría la normalización y generaría inconsistencias. Se computan al vuelo en la capa de servicio puro.

*Validación pendiente (Zod):* `plannedProgress` y `actualProgress` acotados a rango 0–100; `bac` y `actualCost` no negativos.

---

## Contrato de Fórmulas y Casos Borde EVM (Null Estricto)

### Fórmulas por Actividad

| Indicador | Fórmula |
|---|---|
| PV | `(plannedProgress / 100) × BAC` |
| EV | `(actualProgress / 100) × BAC` |
| CV | `EV − AC` |
| SV | `EV − PV` |
| CPI | `null` si `AC ≤ 0`; si no, `EV / AC` |
| SPI | `null` si `PV ≤ 0`; si no, `EV / PV` |
| EAC | `null` si CPI es `null` o `≤ 0`; si no, `BAC / CPI` |
| VAC | `null` si EAC es `null`; si no, `BAC − EAC` |

### Fórmulas Consolidadas del Proyecto

Se aplican los mismos totales agregados (`ΣBAC`, `ΣPV`, `ΣEV`, `ΣAC`) con la misma regla de `null` estricto cuando `ΣAC ≤ 0` o `ΣPV ≤ 0`.

### Interpretaciones Textuales

**Costo (CPI):**
- `null` → "Sin costos registrados"
- `> 1.0` → "Bajo presupuesto (eficiente en costos)"
- `< 1.0` → "Sobre presupuesto (sobrecosto)"
- `= 1.0` → "En presupuesto"

**Cronograma (SPI):**
- `null` → "Sin avance planificado"
- `> 1.0` → "Adelantado en cronograma"
- `< 1.0` → "Atrasado en cronograma"
- `= 1.0` → "A tiempo"

### Casos borde obligatorios en tests (Fase 3)

- AC = 0 con EV = 0
- AC = 0 con EV > 0
- PV = 0 con EV = 0
- PV = 0 con EV > 0
- Proyecto sin actividades (lista vacía → agregados en 0 o null, sin excepciones)
- Avance real = 0%

---

## Fases de Ejecución Guiadas (Gitflow)

Cada fase requiere confirmación antes de pasar a la siguiente.

### Fase 0 — Setup del Repositorio y Gitflow Inicial
- Verificar si el remoto `https://github.com/JononathanRincon/trycore-evm-challenge.git` ya tiene commits (para decidir si se necesita `--allow-unrelated-histories`).
- Inicializar git con ramas `main` y `develop`, conectar `origin`.
- Inicializar proyecto Next.js 14+ con TypeScript, Tailwind CSS, ESLint, Prettier.
- Configurar `.gitignore` (incluye `.agents/`, `node_modules/`, `.next/`, `.env`, `.env.local`) **antes** del primer `git add`.
- Crear esqueletos de `README.md` y `AI_PROCESS.md`.
- Primer commit en `develop`: `Initialize project structure with Next.js, TypeScript and Prisma`.
- Push de `main` y `develop` al remoto.
- **Hito de parada:** confirmar estructura de carpetas y que `.agents/` no quedó trackeada (`git status`).

### Fase 1 — Diseño de Datos y Arquitectura
- Rama `feature/data-models`.
- Configurar Prisma (`schema.prisma`), cliente singleton y script de seed.
- Definir contratos REST y DTOs con validación Zod (incluir rangos 0–100 y no negativos).
- Merge a `develop`.
- **Hito de parada:** revisión y aprobación del modelo y contratos antes de migraciones.

### Fase 2 — Servicio de Cálculo EVM Puro
- Rama `feature/evm-engine`.
- Implementar `evm.calculator.ts` con constantes descriptivas, cálculo por actividad y consolidado, null estricto en CPI/SPI (Decisión 3).
- Merge a `develop`.
- **Hito de parada:** confirmación del servicio y fórmulas con el ejemplo numérico de verificación manual.

### Fase 3 — Tests Unitarios e Integración + API Routes
- Rama `feature/api-routes-and-tests`.
- Suite Vitest con cobertura >80% sobre la capa de negocio (meta >95%), cubriendo todos los casos borde listados arriba.
- API routes delgadas (controllers que solo orquestan hacia `project.service` y `activity.service`).
- Tests de integración por endpoint (200, 201, 400, 404 y forma del JSON).
- Merge a `develop`.
- **Hito de parada:** `npm test` pasa con un solo comando.

### Fase 4 — Documentación OpenAPI
- Rama `feature/openapi-docs`.
- Especificación OpenAPI 3.0 completa (requests, responses, errores) servida en Swagger UI en `/api-docs`.
- Merge a `develop`.
- **Hito de parada:** confirmación de `/api-docs` visible.

### Fase 5 — Frontend Dashboard & Visualización EVM
- Rama `feature/frontend-dashboard`.
- Vista de proyectos, detalle de proyecto, tabla de actividades con CRUD, modales de creación/edición.
- Tarjetas de indicadores consolidados con badges de semáforo (CPI/SPI).
- Gráfica comparativa PV/EV/AC con Recharts.
- Merge a `develop`.
- **Hito de parada:** revisión de experiencia visual y consistencia de los indicadores en tiempo real.

### Fase 6 — Auditoría Gitflow y Preparación de Release
- Rama `release/v1.0.0` desde `develop`.
- Auditoría de historial de commits (imperativos, descriptivos, sin `fix`/`wip`).
- Verificación de linter limpio y ausencia de code smells.
- Merge de `release/v1.0.0` a `main`, tag `v1.0.0`, sincronización con `develop`.
- **Hito de parada:** confirmación del historial Gitflow completo.

### Fase 7 — Documentación Final y Despliegue en Vercel
- Finalizar `README.md` (instalación, variables de entorno, seed).
- Finalizar `AI_PROCESS.md` (prompts cronológicos textuales, decisiones divergentes, decisión de arquitectura independiente, reflexión honesta).
- Configurar despliegue en Vercel con PostgreSQL (Neon/Vercel Postgres).
- **Hito de parada:** entrega lista para grabación del video.

---

## Plan de Verificación

### Pruebas Automatizadas
- `npm test` — unitarias + integración en Vitest.
- `npm run test:coverage` — cobertura del motor EVM >80% (meta >95%).
- `npm run lint` — cero advertencias/errores de ESLint/Prettier.

### Verificación Manual de EVM (caso testigo para `AI_PROCESS.md`)

Actividad: BAC = $10,000, % planificado = 50%, % real = 40%, AC = $6,000.

| Indicador | Cálculo | Resultado |
|---|---|---|
| PV | 0.50 × 10,000 | $5,000 |
| EV | 0.40 × 10,000 | $4,000 |
| CV | 4,000 − 6,000 | −$2,000 (sobrecosto) |
| SV | 4,000 − 5,000 | −$1,000 (atraso) |
| CPI | 4,000 / 6,000 | 0.67 (< 1.0 → "Sobre presupuesto") |
| SPI | 4,000 / 5,000 | 0.80 (< 1.0 → "Atrasado") |
| EAC | 10,000 / 0.67 | $15,000 |
| VAC | 10,000 − 15,000 | −$5,000 |

El motor debe coincidir exactamente con estos valores; los tests unitarios lo certifican.
