/**
 * Constantes semánticas para el cálculo de Valor Ganado (EVM).
 * Se evitan números o cadenas mágicas en toda la lógica de negocio.
 */

export const PERCENT_DIVISOR = 100;
export const BENCHMARK_INDEX = 1.0;

export const CPI_INTERPRETATION = {
  NO_COSTS: 'Sin costos registrados',
  UNDER_BUDGET: 'Bajo presupuesto (eficiente en costos)',
  OVER_BUDGET: 'Sobre presupuesto (sobrecosto)',
  ON_BUDGET: 'En presupuesto',
} as const;

export const SPI_INTERPRETATION = {
  NO_SCHEDULE: 'Sin avance planificado',
  AHEAD: 'Adelantado en cronograma',
  BEHIND: 'Atrasado en cronograma',
  ON_TIME: 'A tiempo',
} as const;
