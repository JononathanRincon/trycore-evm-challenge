import React from 'react';
import { ProjectConsolidatedEvm } from '@/core/evm/evm.types';
import { formatCurrency, formatEvmValue } from '@/core/evm/evm.ui.helpers';
import { TrafficLightBadge } from './TrafficLightBadge';

interface ConsolidatedMetricsCardsProps {
  evm: ProjectConsolidatedEvm;
  projectName: string;
}

export const ConsolidatedMetricsCards: React.FC<ConsolidatedMetricsCardsProps> = ({
  evm,
  projectName,
}) => {
  return (
    <div className="space-y-4">
      {/* Encabezado de Estado de Salud del Proyecto */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-5 shadow-xs border border-slate-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Diagnóstico Integral del Proyecto
          </span>
          <h2 className="text-lg font-bold text-slate-900">{projectName}</h2>
          <p className="text-sm text-slate-500">
            {evm.activitiesCount} {evm.activitiesCount === 1 ? 'actividad evaluada' : 'actividades evaluadas'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TrafficLightBadge
            cpi={evm.cpi}
            spi={evm.spi}
            costInterpretation={evm.costInterpretation}
            scheduleInterpretation={evm.scheduleInterpretation}
            showDetails={true}
          />
        </div>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* BAC (Presupuesto Total) */}
        <div className="rounded-xl bg-white p-4 shadow-xs border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Presupuesto Total (BAC)
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(evm.totalBac)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Línea base autorizada</p>
        </div>

        {/* PV (Valor Planificado) */}
        <div className="rounded-xl bg-white p-4 shadow-xs border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Valor Planificado (PV)
          </p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">
            {formatCurrency(evm.totalPv)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Trabajo programado a la fecha</p>
        </div>

        {/* EV (Valor Ganado) */}
        <div className="rounded-xl bg-white p-4 shadow-xs border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Valor Ganado (EV)
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatCurrency(evm.totalEv)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Trabajo físico completado</p>
        </div>

        {/* AC (Costo Real) */}
        <div className="rounded-xl bg-white p-4 shadow-xs border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Costo Real (AC)
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {formatCurrency(evm.totalAc)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Gasto financiero incurrido</p>
        </div>
      </div>

      {/* Grid de Eficiencia y Proyecciones */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CPI (Índice Costo) */}
        <div className="rounded-xl bg-white p-4 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Eficiencia Costo (CPI)
            </span>
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                evm.cpi !== null && evm.cpi >= 1
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Meta ≥ 1.0
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatEvmValue(evm.cpi, 4)}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-600">
            {evm.costInterpretation}
          </p>
        </div>

        {/* SPI (Índice Cronograma) */}
        <div className="rounded-xl bg-white p-4 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Eficiencia Tiempo (SPI)
            </span>
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                evm.spi !== null && evm.spi >= 1
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Meta ≥ 1.0
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatEvmValue(evm.spi, 4)}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-600">
            {evm.scheduleInterpretation}
          </p>
        </div>

        {/* EAC (Estimado al Concluir) */}
        <div className="rounded-xl bg-white p-4 shadow-xs border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Proyección Final (EAC)
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(evm.eac)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {evm.cpi !== null && evm.cpi > 0
              ? 'Costo proyectado al terminar'
              : 'N/A (Indeterminado por CPI nulo o cero)'}
          </p>
        </div>

        {/* VAC (Variación Final) */}
        <div className="rounded-xl bg-white p-4 shadow-xs border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Variación Final (VAC)
          </p>
          <p
            className={`mt-1 text-2xl font-bold ${
              evm.vac !== null && evm.vac >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(evm.vac)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {evm.vac !== null
              ? evm.vac >= 0
                ? 'Superávit proyectado'
                : 'Déficit presupuestal proyectado'
              : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};
