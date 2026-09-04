'use client';

import React from 'react';
import { ActivityWithEvmResponse } from '@/core/dto/activity.dto';
import { formatCurrency, formatEvmValue } from '@/core/evm/evm.ui.helpers';
import { TrafficLightBadge } from '../dashboard/TrafficLightBadge';

interface ActivityTableProps {
  activities: ActivityWithEvmResponse[];
  onEdit: (_activity: ActivityWithEvmResponse) => void;
  onDelete: (_id: string, _name: string) => void;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  activities,
  onEdit,
  onDelete,
}) => {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-medium text-slate-700">No hay actividades registradas en este proyecto</p>
        <p className="mt-1 text-xs text-slate-500">
          Utiliza el botón superior para agregar la primera actividad y calcular sus métricas EVM en tiempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3">Actividad</th>
              <th scope="col" className="px-3 py-3 text-right">BAC</th>
              <th scope="col" className="px-3 py-3 text-right">% Plan</th>
              <th scope="col" className="px-3 py-3 text-right">% Real</th>
              <th scope="col" className="px-3 py-3 text-right">PV</th>
              <th scope="col" className="px-3 py-3 text-right">EV</th>
              <th scope="col" className="px-3 py-3 text-right">AC</th>
              <th scope="col" className="px-3 py-3 text-right">CV</th>
              <th scope="col" className="px-3 py-3 text-right">SV</th>
              <th scope="col" className="px-3 py-3 text-center">CPI</th>
              <th scope="col" className="px-3 py-3 text-center">SPI</th>
              <th scope="col" className="px-3 py-3 text-right">EAC</th>
              <th scope="col" className="px-3 py-3 text-right">VAC</th>
              <th scope="col" className="px-3 py-3 text-center">Salud</th>
              <th scope="col" className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {activities.map((act) => (
              <tr key={act.id} className="hover:bg-slate-50/75 transition-colors">
                {/* Nombre de Actividad */}
                <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate" title={act.name}>
                  {act.name}
                </td>

                {/* BAC */}
                <td className="px-3 py-3 text-right font-medium text-slate-700">
                  {formatCurrency(act.bac)}
                </td>

                {/* % Planificado */}
                <td className="px-3 py-3 text-right text-slate-600">
                  {act.plannedProgress}%
                </td>

                {/* % Real */}
                <td className="px-3 py-3 text-right text-slate-600 font-semibold">
                  {act.actualProgress}%
                </td>

                {/* PV */}
                <td className="px-3 py-3 text-right text-indigo-600 font-medium">
                  {formatCurrency(act.pv)}
                </td>

                {/* EV */}
                <td className="px-3 py-3 text-right text-emerald-600 font-medium">
                  {formatCurrency(act.ev)}
                </td>

                {/* AC */}
                <td className="px-3 py-3 text-right text-amber-600 font-medium">
                  {formatCurrency(act.actualCost)}
                </td>

                {/* CV */}
                <td
                  className={`px-3 py-3 text-right font-medium ${
                    act.cv >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                  title={act.costInterpretation}
                >
                  {formatCurrency(act.cv)}
                </td>

                {/* SV */}
                <td
                  className={`px-3 py-3 text-right font-medium ${
                    act.sv >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                  title={act.scheduleInterpretation}
                >
                  {formatCurrency(act.sv)}
                </td>

                {/* CPI */}
                <td className="px-3 py-3 text-center font-bold" title={act.costInterpretation}>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                      act.cpi === null
                        ? 'bg-slate-100 text-slate-500'
                        : act.cpi >= 1
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {formatEvmValue(act.cpi, 4)}
                  </span>
                </td>

                {/* SPI */}
                <td className="px-3 py-3 text-center font-bold" title={act.scheduleInterpretation}>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                      act.spi === null
                        ? 'bg-slate-100 text-slate-500'
                        : act.spi >= 1
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {formatEvmValue(act.spi, 4)}
                  </span>
                </td>

                {/* EAC */}
                <td className="px-3 py-3 text-right text-slate-700">
                  {formatCurrency(act.eac)}
                </td>

                {/* VAC */}
                <td
                  className={`px-3 py-3 text-right font-medium ${
                    act.vac !== null && act.vac >= 0
                      ? 'text-emerald-600'
                      : act.vac !== null
                      ? 'text-rose-600'
                      : 'text-slate-500'
                  }`}
                >
                  {formatCurrency(act.vac)}
                </td>

                {/* Semáforo visual */}
                <td className="px-3 py-3 text-center">
                  <TrafficLightBadge cpi={act.cpi} spi={act.spi} />
                </td>

                {/* Acciones */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(act)}
                      className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition"
                      title="Editar actividad"
                      aria-label={`Editar actividad ${act.name}`}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(act.id, act.name)}
                      className="rounded p-1 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Eliminar actividad"
                      aria-label={`Eliminar actividad ${act.name}`}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
