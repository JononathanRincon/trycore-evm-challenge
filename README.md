# Trycore EVM — Earned Value Management Platform

Sistema fullstack para líderes de proyecto que permite registrar y gestionar actividades, calculando en tiempo real los indicadores de **Valor Ganado (Earned Value Management — EVM)** según el estándar PMI, ofreciendo visibilidad inmediata sobre la salud presupuestal y de cronograma.

Desarrollado como prueba técnica para el cargo de **Ingeniero de Desarrollo en Trycore Colombia**.

---

## 🏛️ Arquitectura del Sistema

El proyecto sigue los principios de **Clean Architecture** estructurado en capas desacopladas:

1. **Capa de Presentación / API Routes (`src/app/api/`)**:
   - Controladores REST delgados.
   - Validación de esquema y tipos con Zod.
   - Orquestan peticiones hacia la capa de servicio, sin lógica de cálculo incrustada.
2. **Capa de Negocio / Core EVM (`src/core/`)**:
   - `src/core/evm/`: Motor matemático puro para el cálculo de EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC) e interpretaciones semánticas. Sin dependencias de frameworks ni de bases de datos.
   - `src/core/services/`: Servicios de aplicación (`project.service.ts`, `activity.service.ts`) que gestionan la orquestación y reglas de negocio.
3. **Capa de Datos e Infraestructura (`src/infrastructure/`)**:
   - Cliente singleton de base de datos con **Prisma ORM**.
   - Conexión a PostgreSQL (Neon / Supabase / Postgres local).
   - Generación y especificación de OpenAPI 3.0 servida interactivamente en `/api-docs`.
4. **Capa de Interfaz de Usuario (`src/components/` & `src/app/`)**:
   - Dashboard ejecutivo con KPIs consolidados.
   - Semáforos visuales (badges) según el rendimiento de CPI y SPI.
   - Tabla reactiva de actividades con métricas por ítem.
   - Gráfica comparativa PV vs EV vs AC con **Recharts**.

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

> **Manejo estricto de casos borde:** Si $AC = 0$, $CPI$ es `null` ("Sin costos registrados"). Si $PV = 0$, $SPI$ es `null` ("Sin avance planificado"). Esto evita contradicciones lógicas entre variaciones absolutas ($CV, SV$) e índices de rendimiento ($CPI, SPI$).

---

## 🚀 Requisitos e Instalación Local

### Requisitos previos:
- Node.js >= 18.x (Recomendado v20+ o v22 LTS)
- npm >= 9.x
- Base de datos PostgreSQL (local, Docker o instancia en Neon/Supabase)

### Pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/JononathanRincon/trycore-evm-challenge.git
   cd trycore-evm-challenge
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copiar `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Ajustar la variable `DATABASE_URL` con tu cadena de conexión PostgreSQL.

4. **Inicializar la base de datos (Prisma):**
   ```bash
   # Generar cliente de Prisma
   npm run prisma:generate

   # Ejecutar migraciones
   npx prisma migrate dev --name init

   # Poblar con datos de prueba (1 proyecto con 3 actividades representativas)
   npm run prisma:seed
   ```

5. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

6. **Explorar documentación de API:**
   Acceder a [http://localhost:3000/api-docs](http://localhost:3000/api-docs) para interactuar con la especificación OpenAPI (Swagger UI).

---

## 🧪 Pruebas y Cobertura

El proyecto utiliza **Vitest** con cobertura estricta sobre la capa de cálculo de negocio:

```bash
# Ejecutar todas las pruebas unitarias y de integración
npm test

# Ejecutar pruebas con reporte de cobertura
npm run test:coverage
```

---

## 🌿 Estrategia Gitflow

El repositorio sigue un flujo Gitflow formal:
- `main`: Código en producción, estable y etiquetado con releases semánticos.
- `develop`: Rama principal de integración y desarrollo.
- `feature/*`: Ramas de características específicas (`feature/evm-engine`, `feature/api-routes`, `feature/dashboard`, etc.).
- `release/*`: Ramas de preparación de release previo al merge en `main`.
