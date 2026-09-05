# Registro de Proceso Asistido por Inteligencia Artificial (AI_PROCESS.md)

Este documento registra de forma transparente, honesta y cronológica el proceso de desarrollo asistido por Inteligencia Artificial para la prueba técnica de **Ingeniero de Desarrollo — Trycore Colombia**.

---

## 1. Herramientas de IA Utilizadas y Justificación

- **Google Antigravity (Gemini 3.8)**: Utilizado como entorno de agente de ingeniería de software con capacidad de ejecución de comandos, lectura de especificaciones (incluyendo el análisis del PDF de la prueba) y refactorización orientada a pruebas.
  - *¿Por qué se eligió?*: Soporta ejecución multi-herramienta en tiempo real, integración directa con el workspace local, capacidad de análisis de documentos y generación de arquitectura guiada por artefactos de diseño.

---

## 2. Registro Cronológico de Prompts Textuales

> [!IMPORTANT]
> Todos los prompts se registran de forma textual e íntegra, sin resúmenes ni parafraseos.

### Prompt 1 (Inicio de Sesión y Prompt Maestro RTF + CIDI):
```markdown
# Prompt maestro para agente de código (Antigravity) — Prueba técnica Trycore Colombia

> Esquema usado: **RTF + CIDI** (recomendado para SDD/arquitectura de software: define rol, tarea y formato, y separa contexto/instrucción/detalles/input). Justificación: el problema requiere tanto una decisión de arquitectura fundamentada como una ejecución guiada por fases con restricciones estrictas (Gitflow, cobertura de tests, OpenAPI).
>
> Cómo usarlo: pégalo completo en Antigravity como primer mensaje de la sesión. Está pensado para ejecutarse en **fases** (ver sección "Instrucción"): pide al agente que se detenga a confirmar contigo al final de cada fase antes de seguir, así controlas la calidad y puedes ir llenando el AI_PROCESS.md con los prompts reales que uses en cada paso.

---

## ROL

Actúa como un **arquitecto de software y desarrollador fullstack senior**, especializado en TypeScript/Next.js, diseño de APIs REST, y en escribir código production-ready con pruebas exhaustivas. No optimices por velocidad de entrega a costa de claridad: prioriza código legible, capas bien separadas y decisiones justificables. Cuando propongas algo, explica el "por qué" en una línea antes de escribir el código, para que yo pueda registrar esa decisión en mi documento de proceso.

## TAREA

Construir una aplicación fullstack de gestión de proyectos con cálculo automático de indicadores de **Valor Ganado (EVM — Earned Value Management)**, cumpliendo estándares estrictos de testing, arquitectura limpia, Gitflow y documentación OpenAPI. Es una prueba técnica de selección — el código debe demostrar comprensión real de EVM, no solo "que compile".

## FORMATO DE ENTREGA

- Repositorio Git con historial de commits siguiendo Gitflow (no se entrega como ZIP).
- Código organizado en capas (routes/controllers → services → repositorios/data access), sin lógica de negocio en los controladores.
- Tests unitarios + de integración ejecutables con un solo comando.
- Documentación OpenAPI accesible en `/api-docs`.
- `README.md` con instrucciones de instalación, variables de entorno y script de inicialización de base de datos.

---

## CONTEXTO (CIDI)

Es una prueba técnica para el cargo de Ingeniero de Desarrollo en Trycore Colombia. Evalúan más el **razonamiento y el proceso** que el código en sí (video + `AI_PROCESS.md` pesan más que el repo). Fecha límite: sábado 5 de septiembre, 1:00 p.m.

**Stack elegido (desviación justificada del stack sugerido por Trycore, que pedía Java/Spring o Python/FastAPI + Angular/React):**
- **Next.js 14+ (App Router, TypeScript)** fullstack — API routes como backend, mismo proyecto para frontend.
- **Prisma ORM** + **PostgreSQL** (Neon o Vercel Postgres, ambos con tier gratuito serverless).
- **Tailwind CSS** + componentes del design system existente (skills `ui-ux-pro-max`, `design-system`).
- **Recharts** para la gráfica comparativa PV/EV/AC.
- **Vitest** (o Jest) para unit tests, **Supertest** o `next-test-api-route-handler` para tests de integración de las API routes.
- Despliegue en **Vercel** (skill `deploy-to-vercel`), siguiendo las buenas prácticas de `vercel-react-best-practices`.

Razón de la desviación (para que yo la use tal cual en el AI_PROCESS.md): permite un monorepo fullstack, despliegue nativo y gratuito en Vercel, y coherencia con las skills/infraestructura que ya tengo montada, sin sacrificar separación de capas ni testabilidad.

**Dominio del problema — Valor Ganado (EVM):**

Cada actividad de un proyecto registra:
- Nombre
- BAC (Budget at Completion) — presupuesto total planificado
- % planificado a la fecha de corte
- % completado real
- AC (Actual Cost) — costo real incurrido

Indicadores a calcular por actividad y consolidados por proyecto:

| Indicador | Fórmula |
|---|---|
| PV — Planned Value | % planificado × BAC |
| EV — Earned Value | % completado × BAC |
| CV — Cost Variance | EV − AC |
| SV — Schedule Variance | EV − PV |
| CPI — Cost Performance Index | EV / AC |
| SPI — Schedule Performance Index | EV / PV |
| EAC — Estimate at Completion | BAC / CPI |
| VAC — Variance at Completion | BAC − EAC |

Interpretación requerida: CPI > 1 = bajo presupuesto (eficiente en costos); CPI < 1 = sobre presupuesto. SPI > 1 = adelantado; SPI < 1 = atrasado. El API debe devolver esta interpretación en texto, no solo el número crudo.

**Casos borde obligatorios** (deben tener test dedicado, no solo cobertura incidental):
- AC = 0 (división por cero en CPI)
- Proyecto sin actividades (agregados consolidados en cero o null, no debe explotar)
- Avance real = 0% (EV = 0, CV y SV deben seguir siendo calculables)

---

## INSTRUCCIÓN — ejecuta por fases, confirma conmigo al final de cada una

**Fase 0 — Setup del repositorio (Gitflow desde el inicio):**
Crea el repo con ramas `main` y `develop`. Configura linter (ESLint + Prettier), `.gitignore`, estructura de carpetas del monorepo Next.js, y esqueletos de `README.md` y `AI_PROCESS.md`. Primer commit descriptivo en imperativo (ej. `Initialize project structure with Next.js and Prisma`). No avances a Fase 1 sin confirmar conmigo la estructura de carpetas.

**Fase 1 — Diseño de datos y arquitectura:**
Propón el modelo de datos (Project, Activity) en Prisma schema, y el contrato de la API REST (endpoints, verbos, request/response shape) para crear/editar/eliminar proyectos y actividades. Preséntamelo antes de generar migraciones — quiero revisar el modelo primero. Justifica en una línea cualquier decisión de modelado que no sea obvia (ej. dónde vive el cálculo EVM: como servicio puro, no en el modelo ni en el controlador).

**Fase 2 — Servicio de cálculo EVM (aislado y puro):**
Implementa el servicio de cálculo EVM como funciones puras, sin dependencias de Next.js ni de la base de datos, para que sean 100% testeables sin mocks pesados. Sin números mágicos: usa constantes nombradas. Cubre los tres casos borde arriba mencionados explícitamente en el diseño de las funciones (no dejes que None/undefined explote silenciosamente).

**Fase 3 — Tests unitarios primero, luego API routes:**
Escribe los tests unitarios del servicio EVM ANTES o en paralelo a exponerlo vía API (TDD si es posible). Cobertura mínima 80% sobre la capa de negocio. Luego implementa los endpoints REST (controllers delgados que solo orquestan: reciben input, llaman al service, devuelven response). Cada endpoint necesita al menos un test de integración que valide el contrato de respuesta (status codes, shape del JSON, errores).

**Fase 4 — Documentación OpenAPI:**
Genera la especificación OpenAPI de todos los endpoints (descripción, request/response schemas, códigos de error posibles) y sírvela en `/api-docs`.

**Fase 5 — Frontend (dashboard):**
Construye el dashboard usando el design system existente: formulario para crear/editar actividades, tabla con indicadores calculados por actividad, sección de indicadores consolidados del proyecto, indicador visual (semáforo o badge) de estado de CPI/SPI, y una gráfica (Recharts) que compare PV, EV y AC por actividad. Prioriza claridad sobre diseño elaborado — que cualquiera entienda de un vistazo si el proyecto va bien o mal.

**Fase 6 — Gitflow completo:**
Verifica que cada funcionalidad se haya desarrollado en su propia rama `feature/*`, integrada a `develop` vía Pull Request (aunque sea con un solo colaborador). Antes de la entrega, crea una rama `release/*` desde `develop` y mergea a `main`. Revisa que ningún mensaje de commit sea genérico (`fix`, `wip`, `cambios`) — todos en imperativo y descriptivos.

**Fase 7 — Deploy a Vercel:**
Despliega la aplicación en Vercel siguiendo las buenas prácticas del skill `vercel-react-best-practices`, conecta la base de datos Postgres (Neon/Vercel Postgres), y documenta en el README las variables de entorno necesarias y el script de inicialización/seed de la base de datos.

---

## DETALLES Y RESTRICCIONES (no negociables)

- **Cero code smells:** sin bloques comentados, sin variables sin usar, sin strings/números mágicos, nombres descriptivos, funciones con una sola responsabilidad, lógica repetida más de dos veces debe abstraerse.
- **Lógica de negocio fuera de los controladores**, siempre en la capa de servicio.
- **Cobertura mínima 80%** sobre la capa de negocio (el cálculo EVM), no sobre el proyecto completo.
- Los tests no pueden limitarse a verificar "que la función retorna algo" — deben validar los valores numéricos exactos esperados para cada caso, incluyendo los tres casos borde.
- Cada vez que tomes una decisión de arquitectura no trivial o te apartes de una sugerencia obvia, indícamelo explícitamente en tu respuesta con una línea tipo `DECISIÓN: ...` — las voy a usar textualmente para mi `AI_PROCESS.md`.
- No implementes autenticación/autorización salvo que yo lo pida — no está en el alcance del enunciado.

## INPUT

leer el pdf Ingeniero de Desarrollo — Trycore Colombia (1) y validad que se cumpla cada punto que se menciona en el documento sino agregarlo 

---

### Nota para ti (no para el agente)

Recuerda ir copiando **textualmente y en orden cronológico** cada prompt que le envíes al agente (incluyendo este) dentro de `AI_PROCESS.md` — es un requisito explícito de la prueba, y ya viste que penalizan los resúmenes o paráfrasis. También anota ahí, apenas ocurran: las dos decisiones donde no sigas lo que sugiera el agente, cómo verificaste que los cálculos EVM son correctos (con un ejemplo numérico a mano, no solo "el test pasó"), y la decisión de arquitectura que tomaste tú de forma independiente (por ejemplo, el cambio de stack a Next.js que ya quedó justificado arriba).
```

### Prompt 2 (Instrucciones de Seguridad de Repositorio, Remoto y Corrección Matemática de EVM):
```markdown
Antes de escribir código, haz lo siguiente:

1. Analiza las skills/agentes disponibles en la carpeta local
   C:\Users\Galiatech\Documents\PruebaTecnica\.agents
   Revisa qué capacidades, reglas o configuraciones contiene esa carpeta y
   dime brevemente qué encontraste y cómo lo vas a aprovechar para este
   proyecto, antes de continuar con el desarrollo.

2. IMPORTANTE — esa carpeta NO debe subirse al repositorio bajo ninguna
   circunstancia. Agrega la siguiente línea al .gitignore desde el primer
   commit (Fase 0), antes de hacer cualquier "git add":

   .agents/

   Verifica con `git status` que la carpeta no aparezca como trackeada
   antes de cada commit. Si ya se llegó a trackear por error, indícamelo
   explícitamente para removerla del historial (git rm --cached) — no lo
   hagas de forma silenciosa.

3. El repositorio remoto ya existe, úsalo como origin:
   https://github.com/JononathanRincon/trycore-evm-challenge.git

   Conecta el repo local a este remoto, confirma que las ramas main y
   develop queden reflejadas ahí, y haz push de cada fase a develop
   (o a la rama feature/* correspondiente) apenas la completes — no
   dejes commits solo en local.

4. Corrección de la lógica EVM (reemplaza cualquier versión previa del
   cálculo de CPI/SPI que hayas propuesto con fallback a 1.0):

   No fuerces ningún valor por defecto cuando el denominador es 0. CPI y
   SPI deben quedar como `null` (no calculable) cuando AC=0 o PV=0
   respectivamente, sin importar el valor de EV — esto evita que CPI/SPI
   contradigan a CV/SV en el mismo caso borde (ej. PV=0 con EV>0 da
   SV positivo "adelantado", pero un CPI/SPI forzado a 1.0 diría
   "a tiempo" — son inconsistentes entre sí).

   // core/evm/evm.calculator.ts
   const PERCENT_DIVISOR = 100;

   export function calculateActivityEvm(input: ActivityEvmInput): EvmResult {
     const { bac, plannedProgress, actualProgress, actualCost } = input;

     const pv = (plannedProgress / PERCENT_DIVISOR) * bac;
     const ev = (actualProgress / PERCENT_DIVISOR) * bac;
     const cv = ev - actualCost;
     const sv = ev - pv;

     const cpi = actualCost > 0 ? ev / actualCost : null;
     const spi = pv > 0 ? ev / pv : null;

     const eac = cpi !== null && cpi > 0 ? bac / cpi : null;
     const vac = eac !== null ? bac - eac : null;

     return {
       pv, ev, cv, sv, cpi, spi, eac, vac,
       costInterpretation: interpretCpi(cpi),
       scheduleInterpretation: interpretSpi(spi),
     };
   }

   function interpretCpi(cpi: number | null): string {
     if (cpi === null) return 'Sin costos registrados';
     if (cpi > 1) return 'Bajo presupuesto (eficiente en costos)';
     if (cpi < 1) return 'Sobre presupuesto (sobrecosto)';
     return 'En presupuesto';
   }

   function interpretSpi(spi: number | null): string {
     if (spi === null) return 'Sin avance planificado';
     if (spi > 1) return 'Adelantado en cronograma';
     if (spi < 1) return 'Atrasado en cronograma';
     return 'A tiempo';
   }

   Aplica la misma regla (null explícito, sin fallback a 1.0) en el cálculo
   consolidado por proyecto sobre los totales de AC y PV. Los tests
   unitarios de la Fase 3 deben cubrir explícitamente: AC=0 con EV=0,
   AC=0 con EV>0, PV=0 con EV=0, PV=0 con EV>0, y proyecto sin actividades.

Confirma que entendiste estos tres puntos antes de continuar con el
desarrollo de la fase en curso.
```

### Prompt 3 (Aprobación y Validación de .gitignore y Remoto):
```markdown
Confirmado. Procede con la Fase 0. Verifica que el .gitignore incluya también node_modules, .next y .env, y revisa si el remoto ya tiene commits antes de hacer push.
```

### Prompt 4 (Confirmación de Arquitectura de calculateProjectEvm y Paso a Fase 1):
```markdown
Aprobado. Antes de Fase 1: confirma que calculateProjectEvm (agregación consolidada) vive en core/evm/evm.calculator.ts y no en project.service.ts, crea .env.example, y muéstrame los 3 prompts ya transcritos en AI_PROCESS.md. Luego procede con el schema de Prisma y los contratos REST en feature/data-models.
```

### Prompt 5 (Aclaraciones previas a merge de Fase 1):
```markdown
No apruebo aún el merge. Antes: (1) reemplaza el Prompt 1 del AI_PROCESS.md por el texto completo y literal, sin resumir ni usar placeholders — pégalo entero aunque sea largo. (2) Decide y documenta: Float con toBeCloseTo en tests, o Decimal de Prisma para bac/actualCost — dime cuál eliges y por qué. (3) Confirma que el redondeo a 4 decimales ocurre solo al serializar la respuesta, no dentro de evm.calculator.ts. (4) Define el shape estándar de error de validación 400. Con eso resuelto, procede con el commit en feature/data-models y merge a develop.
```

### Prompt 6 (Exigencia estricta de Pull Requests en GitHub para integración):
```markdown
Apruebo el modelo, la decisión de Float, el redondeo en la capa de serialización y el shape de error. Antes de Fase 2: a partir de ahora, cada feature branch debe integrarse a develop mediante un Pull Request real en GitHub, no con git merge local — aunque trabajes solo, así lo exige el enunciado. Documenta en AI_PROCESS.md que la Fase 1 se mergeó localmente por un error de proceso, y que se corrige desde la Fase 2 en adelante. Con eso, procede con feature/evm-engine y esta vez ciérrala con PR.
```

### Prompt 7 (Adopción de PLAN.md canónico y solicitud de comparación):
```markdown
Te adjunto el documento plan-implementacion-trycore-evmv2, este es el plan de implementación CANÓNICO y
vigente del proyecto. Reemplaza cualquier versión anterior del plan que tengas
en memoria o hayas generado antes en esta conversación por este documento.

Acciones inmediatas:

1. Guarda este contenido tal cual en la raíz del repositorio como PLAN.md
   (créalo si no existe, sobrescríbelo si ya existe una versión distinta).
   Este archivo debe mantenerse sincronizado con las decisiones reales del
   proyecto de aquí en adelante, es la única fuente de verdad del plan,
   no la regeneres desde cero en el chat cuando te pida revisarlo.

2. Compara este plan-implementacion-trycore-evmv2 contra el estado actual real del código y del
   repositorio (ramas, PRs, archivos ya creados) y dime explícitamente:
   - Qué partes del plan ya están implementadas y coinciden.
   - Si hay alguna discrepancia entre lo que dice el plan y lo que
     realmente existe en el código (por ejemplo, si el modelo de datos,
     el manejo de errores, o la lógica de CPI/SPI difieren de lo aquí
     documentado).

3. A partir de ahora, cualquier decisión nueva que tomes (de arquitectura,
   de manejo de casos borde, de proceso Git, etc.) debe:
   - Quedar reflejada como una actualización de PLAN.md (no solo mencionada
     en el chat).
   - Quedar registrada también en AI_PROCESS.md si califica como una de
     las decisiones que el enunciado de Trycore exige documentar.

4. Antes de proponer avanzar a la siguiente fase, cita explícitamente qué
   sección de plan-implementacion-trycore-evmv2 estás ejecutando (por ejemplo: "Fase 3, caso borde 4")
   para que yo pueda verificar contra el documento sin tener que confiar
   en un resumen tuyo hecho de memoria.

Confírmame que recibiste el plan-implementacion-trycore-evmv2, que lo guardaste en el repo, y dame el
resultado de la comparación del punto 2 antes de continuar con cualquier
desarrollo nuevo.
```

### Prompt 8 (Inicio de Fase 3: Pruebas unitarias primero antes de API routes):
```markdown
Confirmado el PLAN.md citado. Autorizo crear feature/api-routes-and-tests, pero divide el trabajo: primero implementa y corre la suite de tests unitarios (los 7 casos citados) y muéstrame el resultado de npm test antes de escribir ninguna API route. Cuando esos tests pasen, seguimos con los endpoints y sus tests de integración.
```

### Prompt 9 (Aprobación de tests y solicitud de diseño de servicios):
```markdown
Aprobado -> cobertura y lint verificados limpios desde cero. Procede con project.service.ts, activity.service.ts, las API routes y sus tests de integración. Recuerda seguir dividiendo el trabajo: muéstrame primero los services y su diseño antes de escribir las routes, y cita la sección de PLAN.md que estés ejecutando en cada paso.
```

### Prompt 10 (Aprobación de diseño de servicios y solicitud de código de rutas):
```markdown
Aprobado el diseño de servicios y la garantía de integridad en updateActivity. Procede con las API Routes. Cuando las tengas, muéstrame el código completo de createActivity (servicio) y al menos una route completa (por ejemplo POST /api/projects/:id/activities) para verificar el manejo de errores y que los controllers queden delgados
```

### Prompt 11 (Separación de bloques try/catch en controllers: 400 exclusivo para JSON parse y 500 para fallos no controlados):
```markdown
Aprobado el patrón de controller y service. Antes de los tests de integración: separa el try/catch para que solo el parseo de request.json() dé 400; cualquier error no controlado del service (ej. fallo de conexión a BD) debe devolver 500, no 400. Aplica esta corrección a todas las routes ya escritas, no solo a esta, y luego procede con la suite de tests de integración.
```

### Prompt 12 (Requisito de test de validación 400 en PUT /api/activities/:id previo a PR #3):
```markdown
Aprobado — el log real confirma los 36 tests y la separación 400/500. Antes de crear el PR: agrega un test de integración para PUT /api/activities/:id que confirme 400 Bad Request cuando se envía un valor inválido (ej. actualCost negativo o plannedProgress > 100), ya que ese caso no aparece en el log actual aunque sí existe para la creación. Con ese test agregado, procede a crear el PR #3.
```

### Prompt 13 (Aprobación de merge de PR #3 y confirmación de endpoints para OpenAPI):
```markdown
Aprobado el merge del PR #3. PLAN.md — Fase 4 citada correctamente.

Autorizo crear la rama feature/openapi-docs y proceder con:
1. Especificación OpenAPI 3.0 tipada en src/infrastructure/docs/openapi.spec.ts
2. Endpoint JSON en src/app/api/docs/route.ts
3. Página Swagger UI en src/app/api-docs/page.tsx con swagger-ui-react,
   cargado como Client Component (ssr: false) siguiendo el patrón de
   composición de vercel-react-best-practices para este caso puntual.
Antes de generar migraciones o escribir código: confírmame el listado
completo de los 7 endpoints que vas a documentar en el spec OpenAPI
(método + ruta + tag), para revisar que ninguno quede fuera antes de
que escribas el archivo completo.

Cuando termines, muéstrame el spec OpenAPI completo (no un resumen) antes
de integrarlo a develop.
```

### Prompt 14 (Aprobación de 8 operaciones para OpenAPI y ejecución de Fase 4):
```markdown
Confirmado: incluimos las 8 operaciones completas en el spec OpenAPI, no 7.
DECISIÓN: el contrato documentado debe reflejar el 100% de la superficie real
de la API — un spec que omite DELETE /api/activities/{id} es documentación
incompleta. Regístralo así en AI_PROCESS.md.

Procede con Fase 4 completa:

1. Crea la rama feature/openapi-docs desde develop.

2. Genera el spec OpenAPI 3.0 completo en
   src/infrastructure/docs/openapi.spec.ts para las 8 operaciones (5 Projects +
   3 Activities). Para CADA una:
   - summary y description en español, orientados a negocio.
   - requestBody con schema tipado vía $ref a componentes reutilizables
     (Project, Activity, ActivityEvmMetrics, ProjectEvmConsolidated,
     ErrorResponse) — no repitas definiciones inline.
   - responses documentadas para 200/201, 400 (validación: BAC negativo, % fuera
     de 0-100), 404 (proyecto/actividad inexistente) y 500 (error no controlado).
   - En los endpoints que devuelven EVM (GET /api/projects/{id},
     POST .../activities, PUT /api/activities/{id}): ejemplo numérico real con
     PV, EV, CV, SV, CPI, SPI, EAC, VAC e interpretación textual — nada de
     placeholders tipo "string".

3. Documenta explícitamente en los schemas los 3 casos borde: qué retorna el
   API cuando AC=0 (sé consistente con lo que ya devuelve el service EVM de
   Fase 2 — ¿null? ¿"N/A"?), cuando el proyecto no tiene actividades (agregados
   en 0/null, no error), y que avance real = 0% es válido, no un error.

4. Monta Swagger UI en /api-docs. Valida que el spec no tenga errores de
   schema (swagger-cli validate o el propio Swagger UI).

5. Cero magic strings/numbers en el spec: status codes, tags y mensajes de
   error repetidos van a components/responses.

6. Commit imperativo y descriptivo, ej.:
   "Add complete OpenAPI 3.0 spec for 8 REST operations with error schemas"

7. Abre PR feature/openapi-docs → develop y haz el merge.

VALIDACIÓN OBLIGATORIA antes de dar la fase por cerrada — muéstrame evidencia de:
a) /api-docs carga sin errores de consola ni de validación.
b) Las 8 operaciones aparecen, agrupadas en Projects (5) y Activities (3).
c) Un "Try it out" contra un GET real funciona contra la base de datos.
d) git log --oneline con el commit imperativo y el merge del PR.

Al terminar responde con la línea "HITO DE PARADA: /api-docs visible" y
espera mi confirmación antes de tocar Fase 5.
```

### Prompt 15 (Transición a Supabase PostgreSQL y Configuración de Datasource):
```markdown
DECISIÓN: cambiamos de Neon a Supabase como proveedor de PostgreSQL para
desarrollo. Misma naturaleza (Postgres serverless gestionado), sin impacto
en el modelo de datos ni en Prisma. Documenta este cambio en AI_PROCESS.md
como desviación menor de la decisión de stack original.

1. Instala Prisma como devDependency si no está ya:
   npm install prisma --save-dev

2. Verifica que .env está en .gitignore. Si no lo está, agrégalo ANTES de
   crear el archivo — no continúes sin esto confirmado.

3. Crea el archivo .env (no .env.example) con estas dos variables. Voy a
   reemplazar el password yo mismo directamente en el archivo después de
   que lo crees con el placeholder:

# Connect to Postgres via the shared transaction-mode pooler (IPv4-only)
DATABASE_URL="postgresql://postgres.anbrjhahmbjdoyfphmds:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connect to Postgres via the shared session-mode pooler (used for migrations)
DIRECT_URL="postgresql://postgres.anbrjhahmbjdoyfphmds:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
la contraseña es [REDACTADO POR SEGURIDAD]
valida si se logra conectar? sino mencionalo primero

4. Actualiza prisma/schema.prisma para que el datasource use ambas
   variables (pooler para queries en runtime, directUrl para migraciones):

   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }

5. NO corras prisma init si ya existe prisma/schema.prisma — verifica
   primero que no sobrescribas el schema con las entidades Project/Activity
   ya modeladas en Fase 1. Si el archivo ya existe, solo edita el bloque
   datasource.

6. Una vez confirme que reemplacé el password real en .env, corre:
   npx prisma migrate dev --name init
   Esto debe usar DIRECT_URL (puerto 5432, session mode) para la migración.

7. Corre o crea el script de seed con al menos 1 proyecto y 3 actividades
   (necesario para la demo del video).

8. Verifica conectividad real: vuelve a correr el chequeo de getAllProjects()
   contra la DB. Repórtame el conteo de proyectos, sin exponer credenciales.

9. Repite GET /api/projects contra localhost:3000 y confírmame el 200 real
   con body. Luego valida el "Try it out" desde /api-docs.

No avances a git add/commit/PR hasta que confirmes el 200 real con datos.

NO instales ni ejecutes paquetes npx adicionales (como skills de terceros)
sin que yo los autorice explícitamente primero.
```
> *Nota de seguridad*: Se reemplazó la credencial sensible original por `[REDACTADO POR SEGURIDAD]`. Dicha credencial fue expuesta temporalmente en el prompt y rotada inmediatamente tras la interacción; se omite del registro histórico por buenas prácticas de seguridad de la información. El resto del prompt se mantiene textual.

### Prompt 16 (Verificación de falso negativo en Swagger UI y cierre de Fase 4):
```markdown
Antes de cerrar la Fase 4 y avanzar, necesito que resuelvas una inconsistencia
en la validación:

El log de verificación automática de /api-docs reporta:
  GET /api-docs status: 200
  Swagger UI container rendered: false

Necesito saber la causa real, no una suposición:

1. Explícame por qué el chequeo automatizado reporta "rendered: false" —
   ¿es un falso negativo esperado por ser ssr:false (el check solo lee HTML
   estático antes de la hidratación de React), o es un problema real donde
   Swagger UI no carga en el navegador?
2. Para descartarlo con certeza, dime cómo verificarlo yo manualmente:
   abriendo http://localhost:3000/api-docs en el navegador, ¿debería ver la
   interfaz completa de Swagger UI (con los 8 endpoints listados y el botón
   "Try it out")? Voy a abrirlo yo mismo y confirmarte lo que veo.
3. Si es un falso negativo del script de verificación, ajusta el script para
   que espere a la hidratación (o valide contra un selector que solo aparece
   post-render) en vez de reportar un estado engañoso.
4. Si es un problema real, corrígelo y vuelve a correr la verificación hasta
   que "rendered: true" sea consistente con lo que yo veo en el navegador.

No des la Fase 4 por cerrada hasta que esto quede resuelto y yo confirme
visualmente que Swagger UI carga correctamente.
```

### Prompt 17 (Aprobación de Fase 4 y requisitos estrictos para Fase 5):
```markdown
Fase 4 confirmada y cerrada: verifiqué manualmente /api-docs en el navegador,
Swagger UI carga completo con los 8 endpoints, "Try it out" funciona contra
Supabase, y los casos borde (cpi/spi/eac/vac null) quedan documentados en los
schemas.

Avanza a Fase 5 — Dashboard frontend. Rama feature/dashboard-ui.

Requisitos estrictos según PLAN.md y el desafío original:

1. Formulario de creación/edición de actividades (nombre, BAC, % planificado,
   % completado, AC) con validación en cliente (no permitir negativos, no
   permitir % fuera de 0-100) — reutiliza los mismos límites que ya validan
   las API routes, no dupliques reglas distintas.
2. Tabla de actividades por proyecto con sus indicadores calculados (PV, EV,
   CV, SV, CPI, SPI, EAC, VAC) consumidos directamente de la respuesta real
   de la API (nada de recalcular en el frontend).
3. Sección de indicadores consolidados del proyecto, con el mismo criterio.
4. Indicador visual (badge o semáforo) de estado CPI/SPI:
   - Verde: CPI≥1 y SPI≥1
   - Amarillo: uno de los dos <1
   - Rojo: ambos <1
   Usa costInterpretation/scheduleInterpretation ya devueltos por la API como
   texto del badge, no textos nuevos inventados en el frontend.
5. Gráfica Recharts comparando PV, EV y AC por actividad (barras agrupadas o
   líneas, tu criterio — indícame en una línea por qué elegiste ese tipo).
6. Maneja explícitamente en la UI el caso borde de CPI/SPI/EAC/VAC = null (ej.
   mostrar "N/A" en vez de romper el render o mostrar "null").
7. Prioriza claridad: cualquiera debe entender de un vistazo si el proyecto
   va bien o mal, sin necesitar leer números crudos.

No uses lógica de negocio en los componentes — solo consumo de la API y
presentación. Si necesitas transformar datos para la gráfica, hazlo en un
helper aislado y testeable, no inline en el componente.

Commits descriptivos en feature/dashboard-ui, PR a develop al terminar.
Antes de darlo por cerrado, confírmame explícitamente que probaste el
formulario creando/editando una actividad real (con datos reales, no
placeholders) y que la tabla/gráfica se actualizan correctamente al vuelo —
no solo que compila.
```

### Prompt 18 (Solicitud de Auditoría Técnica Integral y Recomendaciones Arquitectónicas):
```markdown
me realizas una auditoria de este proyecto y me das recomendaciones para mejorar la arquitectura
```

### Prompt 19 (Generación del Plan Canónico de Implementación de Mejoras con Estándares Trycore y Skills de .agents):
```markdown
me realizas un plan de implementacion para realizar esos cambios, por favor analiza el documento Ingeniero de Desarrollo — Trycore Colombia (1) ese plan de implementacion debe cumplir con las recomendaciones que tiene ese documento el proyecto esta desplegado en vercel y ese plan de implementacion se debe guardar en un archivo .md como plan de implementacion mejoras realizadas buenas practicas segun la auditoria que acabas de realizar y tambien tener en cuenta que skills puedes usar para esta mejoras que se encuentra en la carpeta .agent y guardar esos registros de promp en el archivo AI_PROCESS.md de las mejoras realizadas
```

### Prompt 20 (Renombramiento del Plan Canónico de Mejoras):
```markdown
le cambie el nombre del archivo por plan de implementacion mejoras realizadas.md
```

### Prompt 21 (Aprobación de Inicio de Mejoras y Compartición de Enlaces de Producción Vercel):
```markdown
si apruebo, aparte te comento que aqui tengo desplegado el aplicativo Dashboard Principal (Producción):👉 https://trycore-evm-challenge.vercel.app
Documentación Interactiva Swagger UI:👉 https://trycore-evm-challenge.vercel.app/api-docs
Endpoint del Spec OpenAPI 3.0 (JSON):👉 https://trycore-evm-challenge.vercel.app/api/docs
Deployment Inspect (Vercel Console):👉 https://vercel.com/jonathanandres080-6851s-projects/trycore-evm-challenge
y este es el token de vercel si lo necesitas del proyecto este es el token de vercel [REDACTADO POR SEGURIDAD]
```

### Prompt 22 (Validación de Conformidad con Gitflow según Prueba Técnica):
```markdown
okey el gitflow quedo como se menciona en la prueba tecnica
```

### Prompt 23 (Aprobación y Solicitud de Ejecución de la Fase 2: Handlers HTTP y DRY):
```markdown
si veo todo fue cumplido exitosamente, continuemos con la fase 2
```

### Prompt 24 (Consulta sobre Ejecución y Cobertura de Pruebas Unitarias e Integrales):
```markdown
realizaste pruebas unitarias e integrales?
```

### Prompt 25 (Verificación de Buenas Prácticas de Gitflow e Integración por Ramas hacia develop):
```markdown
y como quedo en el gitflow se esta registrando conforme con las buenas practicas por ramas haciendo merce a la rama develop
```

### Prompt 26 (Consulta de Releases Existentes y Avance a Fase 3):
```markdown
ya existe un release puedes consultar cual es el ultimo para no crear o modificar el mismo release, podemos avanzar en la fase 3
```

---

## 3. Aprendizaje y Validación de EVM

### ¿Cómo aprendí EVM y cómo validé las fórmulas?
EVM (*Earned Value Management*) integra tres dimensiones críticas en la gestión de proyectos:
1. **Alcance planificado expresado en valor monetario**: Valor Planificado ($PV = \%Planificado \times BAC$).
2. **Trabajo efectivamente completado**: Valor Ganado ($EV = \%Real \times BAC$).
3. **Costo financiero real consumido**: Costo Real ($AC$).

Para validar la comprensión antes de escribir código, se realizó un ejercicio de verificación manual:
- **Escenario Testigo**:
  - Actividad: "Diseño y Prototipado"
  - $BAC = \$10,000$ USD
  - $\%$ Planificado $= 50\%$
  - $\%$ Real completado $= 40\%$
  - $AC = \$6,000$ USD
- **Cálculos manuales paso a paso**:
  - $PV = 0.50 \times 10,000 = \$5,000$
  - $EV = 0.40 \times 10,000 = \$4,000$
  - $CV = EV - AC = 4,000 - 6,000 = -\$2,000$ (Variación de costo negativa $\implies$ Sobrecosto).
  - $SV = EV - PV = 4,000 - 5,000 = -\$1,000$ (Variación de cronograma negativa $\implies$ Retraso).
  - $CPI = EV / AC = 4,000 / 6,000 \approx 0.6667$ ($< 1.0 \implies$ Sobre presupuesto).
  - $SPI = EV / PV = 4,000 / 5,000 = 0.80$ ($< 1.0 \implies$ Atrasado en cronograma).
  - $EAC = BAC / CPI = 10,000 / (4,000 / 6,000) = \$15,000$ (El proyecto terminará costando \$15,000 en lugar de \$10,000).
  - $VAC = BAC - EAC = 10,000 - 15,000 = -\$5,000$ (Déficit presupuestal proyectado).

---

## 4. Decisiones donde NO se siguió la sugerencia de la IA

### Decisión 1: Rechazo de fallbacks arbitrarios a 1.0 en divisiones por cero de CPI y SPI
- **Lo que la IA propuso inicialmente**: En el plan de implementación inicial, la IA sugirió que cuando $AC = 0$ o $PV = 0$, se evaluara un fallback a `1.0` o valor "controlado" para que el índice tuviera un número asignado.
- **Por qué se tomó un camino diferente**: Forzar $1.0$ causa inconsistencia semántica grave con las variaciones absolutas. Por ejemplo, si $PV = 0$ pero $EV = \$2,000$, la variación $SV = 2,000 - 0 = +\$2,000$ indica que la actividad está "adelantada", pero un $SPI = 1.0$ forzado indicaría erróneamente "a tiempo". La decisión correcta de ingeniería es retornar `null` con interpretación textual semántica `"Sin costos registrados"` o `"Sin avance planificado"`.

### Decisión 2: No persistir métricas EVM en la base de datos (Persistencia vs. Cálculo al vuelo)
- **Lo que la IA evaluó**: Considerar campos `pv`, `ev`, `cpi`, `spi` en la tabla `activities` del esquema Prisma.
- **Por qué se tomó un camino diferente**: En bases de datos relacionales, almacenar datos derivados viola la 3ra Forma Normal (3NF) y genera riesgo de datos desincronizados. Si el usuario actualiza el $AC$, pero falla la actualización del $CPI$ guardado, la base de datos queda corrupta. El cálculo debe ser una función pura en la capa de dominio ejecutada al vuelo en cada lectura.

### Decisión 3: Uso de `Float` en Prisma con `toBeCloseTo` en pruebas vs. `Decimal`
- **Opciones evaluadas**: 
  1. `Decimal` de Prisma (`decimal.js`): Ofrece precisión fija sin imprecisión binaria, pero añade fricción severa: los objetos `Decimal` requieren métodos específicos (`.plus()`, `.div()`), no se serializan a JSON de forma plana sin mappers custom en Next.js, y chocan con librerías de UI como Recharts y validadores Zod.
  2. `Float` (IEEE 754 64-bit `number` nativo de JS/TS): Tipos primitivos transparentes, cero dependencias en el core matemático, serialización JSON nativa y aserciones matemáticas en pruebas con `toBeCloseTo(expected, 4)` para ratios periódicos (ej. $CPI = 4000/6000$).
- **Decisión adoptada**: Se adopta `Float` en el esquema de Prisma y en las interfaces de TypeScript. El core matemático opera con números de 64 bits a precisión completa, y el redondeo a 4 decimales se delega exclusivamente a la serialización del DTO de respuesta para presentación.

### Decisión 4: Cobertura del 100% de la superficie de la API en la especificación OpenAPI (8 endpoints vs. 7)
- **Contexto**: En la solicitud inicial de Fase 4, se hizo mención a "7 endpoints".
- **Identificación y Decisión adoptada**: El análisis riguroso de la superficie de la API arrojó 8 operaciones REST implementadas (`5` en Projects + `3` en Activities, incluyendo `DELETE /api/activities/{id}`). Se tomó la decisión explícita de incluir las 8 operaciones completas en el contrato OpenAPI 3.0. Un contrato documentado que omite operaciones reales existentes (como la eliminación de actividades) constituye una especificación incompleta y rompe el principio de verdad única entre implementación y documentación.

### Decisión 5: Adopción de Supabase como proveedor gestionado de PostgreSQL para desarrollo y producción
- **Contexto**: El plan inicial contemplaba Neon / Vercel Postgres.
- **Identificación y Decisión adoptada**: Se seleccionó Supabase como proveedor de PostgreSQL serverless gestionado. Representa la misma naturaleza relacional estándar de PostgreSQL sin impacto en las entidades de Prisma ni en la lógica de negocio. Para garantizar compatibilidad óptima con Prisma y serverless, se configuró el datasource con arquitectura de doble URL en `prisma/schema.prisma`: `DATABASE_URL` apuntando al Transaction-Mode pooler (puerto 6543 con PgBouncer) para las consultas de la aplicación, y `DIRECT_URL` apuntando al Session-Mode pooler (puerto 5432) para la ejecución segura de migraciones DDL (`prisma migrate dev`).

### Decisión 6: Elección de gráfico de barras agrupadas vs. líneas para la comparativa EVM por actividad
- **Contexto**: El requerimiento de Fase 5 solicitó una gráfica Recharts para contrastar Valor Planificado (PV), Valor Ganado (EV) y Costo Real (AC) por actividad, permitiendo barras agrupadas o líneas según criterio técnico justificado.
- **Identificación y Decisión adoptada**: Se implementó una gráfica de **barras agrupadas**. En gestión de proyectos tradicional (EVM acumulativo en el tiempo), las líneas son adecuadas para curvas S continuas de fechas. Sin embargo, en el desglose granular por actividades del desafío, cada actividad es una unidad de trabajo discreta e independiente (ej. "Diseño", "Base de Datos", "Facturación"). Un gráfico de líneas implicaría falsamente una continuidad temporal o interpolación secuencial entre actividades. Las barras agrupadas contrastan con total honestidad matemática la tríada (PV en azul, EV en verde y AC en ámbar) para cada entrega de forma visual e intuitiva.

### Decisión 7: Adopción del Patrón Repositorio en Next.js App Router (Inversión de Dependencias)
- **Contexto**: La auditoría identificó que `ProjectService` y `ActivityService` acoplaban la lógica de aplicación directamente al cliente de Prisma (`@/infrastructure/db/prisma`).
- **Identificación y Decisión adoptada**: Se diseña el Patrón Repositorio con interfaces en el Core (`IProjectRepository`, `IActivityRepository`) y adaptadores en Infraestructura (`PrismaProjectRepository`, `PrismaActivityRepository`). Esto restaura el Principio de Inversión de Dependencias (DIP) de Clean Architecture, permitiendo inyectar implementaciones en memoria para pruebas unitarias sin hackeos de mockeo a nivel de módulos (`vi.mock`), y aislando al negocio de cambios en la base de datos o capas de caché.

### Decisión 8: Fuente Única de Verdad (Single Source of Truth) para Validaciones con Zod y React Hook Form
- **Contexto**: El modal de creación de actividades en el frontend duplicaba manualmente con sentencias `if/else` las mismas reglas de validación (rango 0-100, no negatividad de costos, límites de caracteres) ya definidas en `src/core/dto/activity.dto.ts`.
- **Identificación y Decisión adoptada**: Integrar `react-hook-form` con `@hookform/resolvers/zod` consumiendo directamente el schema `CreateActivitySchema`. Esto elimina código redundante (DRY), garantiza coherencia absoluta entre cliente y servidor, y previene que una actualización de reglas en backend quede desfasada en el frontend.

### Decisión 9: Reemplazo de `confirm()` y `alert()` por componente accesible `ConfirmDialog` y manejo reactivo de errores en React Query
- **Contexto**: La auditoría identificó llamadas bloqueantes nativas del navegador (`confirm()` y `alert()`) en `DashboardClient.tsx`, que degradan la experiencia de usuario y violan estándares de accesibilidad (WCAG) y buenas prácticas frontend.
- **Identificación y Decisión adoptada**: Implementación de `ConfirmDialog.tsx` con accesibilidad ARIA completa (`role="dialog"`, `aria-modal="true"`, foco automático en botón cancelar, soporte para tecla `Escape` y desenfoque de fondo con `backdrop-blur`). El flujo de eliminación y errores de mutaciones se delega a estados reactivos en TanStack Query (`isPending`, banners contextuales en Tailwind), logrando 0 llamadas a `alert()` o `confirm()` en toda la base de código.


### Corrección de Proceso Gitflow: Integración vía Pull Requests en GitHub
- **Incidente en Fase 1**: La rama `feature/data-models` fue integrada a `develop` mediante un comando de merge local con `--no-ff`.
- **Corrección**: El usuario señaló que el enunciado de Trycore exige: *"Cada feature debe integrarse a develop mediante un Pull Request, aunque trabajes solo"*. Se documenta este error de proceso con total transparencia y se adopta la regla estricta: desde la Fase 2 (`feature/evm-engine`), cada rama de característica se publica en GitHub, se crea un Pull Request real mediante `gh pr create`, y se fusiona a `develop` mediante `gh pr merge`.

### Desviación de Proceso Gitflow en PR #4: Squash Merge involuntario y restablecimiento de Merge Commits
- **Incidente en PR #4**: Al completar la Fase 4 (`feature/openapi-docs`), la integración del Pull Request #4 hacia `develop` se ejecutó mediante un comando de squash merge (`gh pr merge 4 --squash`) en lugar de generar un merge commit estándar (`--merge` / `--no-ff`). En consecuencia, los commits individuales de la rama se compactaron en un único commit con el título por defecto `feat: Add complete OpenAPI 3.0 spec for 8 REST operations with error schemas and Swagger UI (#4)` (hash `099095f`).
- **Causa raíz**: Omisión de la bandera de estrategia explícita `--merge` en la instrucción de ejecución o adopción de la opción squash preseleccionada en el CLI de GitHub.
- **Impacto en el historial**: Si bien el código resultante, los tests y la funcionalidad de OpenAPI y Supabase quedaron íntegros y validados en `develop`, se perdió la granularidad individual de los commits de la rama en el grafo de Git (`git log --graph`), contrastando visualmente con los merge commits explícitos de los PRs #1, #2 y #3.
- **Corrección adoptada**: Conforme a la buena práctica de no reescribir la historia pública de Git una vez compartida en el repositorio remoto, se mantuvo el commit sin forzar un rebase destructivo y se aplicó la disciplina estricta a partir de la Fase 5: el PR #5 (`feature/dashboard-ui`) se integró explícitamente con merge commit tradicional (`Merge pull request #5 from JononathanRincon/feature/dashboard-ui`, commit `ea97698`), preservando la trazabilidad de Gitflow.

---

## 5. Decisión de Arquitectura Independiente

- **Adopción de Next.js 14+ (App Router, TypeScript) en Monorepo vs. Separación Spring/FastAPI + React**:
  - *Justificación*: Permite unificar el tipado de contratos entre API y Frontend sin redundancia de DTOs, garantiza despliegue atómico en Vercel sin costos de hosting adicionales y mantiene una arquitectura en capas limpia (`app/api/` como controllers delgados $\rightarrow$ `core/` como servicios y motor puro $\rightarrow$ `infrastructure/` como acceso a datos con Prisma).

---

## 6. Reflexión Honesta: ¿Qué haría diferente?

1. **Disciplina estricta en las banderas del CLI de GitHub (`gh pr merge`)**:
   - *Lección aprendida*: La integración del PR #4 mediante `--squash` demostró que asumir el comportamiento por defecto de herramientas CLI puede romper convenciones de equipo (Gitflow con merge commits obligatorios). En un proyecto productivo o colaborativo, configuraría reglas de protección de rama en GitHub (`Require linear history` desactivado, y restringir las opciones de merge del repositorio exclusivamente a *Allow merge commits*, deshabilitando *Squash merging* y *Rebase merging* a nivel de configuración de repositorio).

2. **Gestión preventiva de secretos y variables de entorno**:
   - *Lección aprendida*: La exposición temporal de una credencial de base de datos en un prompt interactivo (que motivó su inmediata rotación y reemplazo por `[REDACTADO POR SEGURIDAD]`) resalta la importancia de adoptar desde el primer minuto un gestor de secretos o herramientas locales como `dotenv-vault` o el CLI de Doppler/Supabase (`supabase link`), evitando manipular contraseñas directamente en mensajes o prompts compartidos con agentes de IA.

3. **Pruebas End-to-End (Playwright / Cypress) automatizadas para la UI**:
   - *Lección aprendida*: La suite de pruebas unitarias y de integración se amplió a 64 tests automáticos en Vitest cubriendo el 100% del motor EVM, los servicios de aplicación desacoplados por el Patrón Repositorio y las API routes paginadas. Aunque la interacción visual del dashboard ahora cuenta con TanStack Query y componentes modales accesibles, incorporar pruebas E2E automatizadas con Playwright en el pipeline de CI cerraría el ciclo de aseguramiento de calidad de forma 100% desatendida en el navegador.

4. **Automatización de Quality Gates desde el día cero**:
   - *Lección aprendida*: Configurar el pipeline de GitHub Actions (`ci.yml`) desde el inicio del proyecto asegura que cada Pull Request sea evaluado de manera idéntica al entorno de producción (verificando Prettier, ESLint, cobertura en Vitest y `next build`). La incorporación de este gate en la versión 1.1.0 eleva la madurez operativa del repositorio a un nivel de estándar industrial.

