'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { transformActivitiesForChart, RawActivityForChart } from './chart.helpers';

interface EvmComparisonChartProps {
  activities: RawActivityForChart[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg text-xs">
        <p className="font-bold text-slate-800 mb-1">{data.fullName || label}</p>
        <div className="space-y-1">
          <p className="text-indigo-600 font-medium">
            Valor Planificado (PV): ${data.pv.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-emerald-600 font-medium">
            Valor Ganado (EV): ${data.ev.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-amber-600 font-medium">
            Costo Real (AC): ${data.ac.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-slate-500 font-medium pt-1 border-t border-slate-100">
            Presupuesto (BAC): ${data.bac.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const EvmComparisonChart: React.FC<EvmComparisonChartProps> = ({ activities }) => {
  const chartData = transformActivitiesForChart(activities);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-500">
          No hay actividades registradas para graficar el comparativo EVM.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">
          Comparativa de Desempeño: PV vs EV vs AC por Actividad
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Elegimos barras agrupadas porque permiten contrastar directamente la tríada fundamental de
          EVM (alcance programado en azul, trabajo completado en verde y costo real en ámbar) para
          cada entrega sin interpolar datos discretos entre actividades independientes.
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar
              name="Valor Planificado (PV)"
              dataKey="pv"
              fill="#4F46E5"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              name="Valor Ganado (EV)"
              dataKey="ev"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              name="Costo Real (AC)"
              dataKey="ac"
              fill="#F59E0B"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
