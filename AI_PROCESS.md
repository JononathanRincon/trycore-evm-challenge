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

### Corrección de Proceso Gitflow: Integración vía Pull Requests en GitHub
- **Incidente en Fase 1**: La rama `feature/data-models` fue integrada a `develop` mediante un comando de merge local con `--no-ff`.
- **Corrección**: El usuario señaló que el enunciado de Trycore exige: *"Cada feature debe integrarse a develop mediante un Pull Request, aunque trabajes solo"*. Se documenta este error de proceso con total transparencia y se adopta la regla estricta: desde la Fase 2 (`feature/evm-engine`), cada rama de característica se publica en GitHub, se crea un Pull Request real mediante `gh pr create`, y se fusiona a `develop` mediante `gh pr merge`.

---

## 5. Decisión de Arquitectura Independiente

- **Adopción de Next.js 14+ (App Router, TypeScript) en Monorepo vs. Separación Spring/FastAPI + React**:
  - *Justificación*: Permite unificar el tipado de contratos entre API y Frontend sin redundancia de DTOs, garantiza despliegue atómico en Vercel sin costos de hosting adicionales y mantiene una arquitectura en capas limpia (`app/api/` como controllers delgados $\rightarrow$ `core/` como servicios y motor puro $\rightarrow$ `infrastructure/` como acceso a datos con Prisma).

---

## 6. Reflexión Honesta: ¿Qué haría diferente?

*(Se completará al culminar la implementación y el despliegue final)*
