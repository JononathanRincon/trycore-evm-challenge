'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      <p className="text-sm font-medium text-slate-500">
        Cargando documentación interactiva Swagger UI...
      </p>
    </div>
  ),
});

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                OpenAPI 3.0
              </span>
              <h1 className="text-xl font-bold text-slate-900">
                Trycore EVM Challenge — Documentación de la API
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Contratos interactivos y especificación formal de los 8 endpoints REST para proyectos
              y actividades.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Ver JSON del Spec
            </a>
            <Link
              href="/"
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
            >
              Ir al Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <SwaggerUI url="/api/docs" />
      </section>
    </main>
  );
}
