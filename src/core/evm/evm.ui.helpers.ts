export type TrafficLightStatus = 'success' | 'warning' | 'danger' | 'neutral';

export interface TrafficLightBadgeProps {
  cpi: number | null;
  spi: number | null;
  costInterpretation?: string;
  scheduleInterpretation?: string;
}

/**
 * Determina el estado del semáforo según las reglas estrictas de EVM:
 * - Verde (success): CPI >= 1 y SPI >= 1
 * - Amarillo (warning): Uno de los dos < 1 (o uno neutral y el otro >= 1)
 * - Rojo (danger): Ambos < 1
 * - Neutral: Ambos son null (ej. sin costos ni planificación registrada)
 */
export function getTrafficLightStatus(cpi: number | null, spi: number | null): TrafficLightStatus {
  if (cpi === null && spi === null) {
    return 'neutral';
  }

  const isCpiUnder = cpi !== null && cpi < 1.0;
  const isSpiBehind = spi !== null && spi < 1.0;

  if (isCpiUnder && isSpiBehind) {
    return 'danger';
  }

  if (isCpiUnder || isSpiBehind) {
    return 'warning';
  }

  return 'success';
}

/**
 * Retorna las clases Tailwind para estilizar el badge de acuerdo al estado.
 */
export function getTrafficLightClasses(status: TrafficLightStatus): {
  badge: string;
  dot: string;
  label: string;
} {
  switch (status) {
    case 'success':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
        dot: 'bg-emerald-500',
        label: 'Saludable',
      };
    case 'warning':
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
        dot: 'bg-amber-500',
        label: 'Atención Requerida',
      };
    case 'danger':
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
        dot: 'bg-rose-500',
        label: 'En Riesgo Crítico',
      };
    case 'neutral':
    default:
      return {
        badge: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20',
        dot: 'bg-slate-400',
        label: 'Sin Datos Suficientes',
      };
  }
}

/**
 * Formatea valores numéricos asegurando manejo de null -> "N/A"
 */
export function formatEvmValue(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'N/A';
  }
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatea montos monetarios en USD
 */
export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'N/A';
  }
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
