import { ActivityEvmInput, EvmResult, ProjectConsolidatedEvm } from './evm.types';
import {
  PERCENT_DIVISOR,
  BENCHMARK_INDEX,
  CPI_INTERPRETATION,
  SPI_INTERPRETATION,
} from './evm.constants';

/**
 * Calcula los indicadores de Valor Ganado (EVM) para una actividad individual.
 * Función pura: sin efectos secundarios, sin dependencias de base de datos ni de frameworks.
 *
 * Casos borde garantizados:
 * - actualCost <= 0 -> cpi = null ("Sin costos registrados")
 * - pv <= 0 -> spi = null ("Sin avance planificado")
 * - actualProgress = 0 -> ev = 0, cv = -actualCost, sv = -pv (calculables de forma segura)
 */
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
    pv,
    ev,
    cv,
    sv,
    cpi,
    spi,
    eac,
    vac,
    costInterpretation: interpretCpi(cpi),
    scheduleInterpretation: interpretSpi(spi),
  };
}

/**
 * Interpreta textualmente el índice de rendimiento del costo (CPI).
 */
export function interpretCpi(cpi: number | null): string {
  if (cpi === null) {
    return CPI_INTERPRETATION.NO_COSTS;
  }
  if (cpi > BENCHMARK_INDEX) {
    return CPI_INTERPRETATION.UNDER_BUDGET;
  }
  if (cpi < BENCHMARK_INDEX) {
    return CPI_INTERPRETATION.OVER_BUDGET;
  }
  return CPI_INTERPRETATION.ON_BUDGET;
}

/**
 * Interpreta textualmente el índice de rendimiento del cronograma (SPI).
 */
export function interpretSpi(spi: number | null): string {
  if (spi === null) {
    return SPI_INTERPRETATION.NO_SCHEDULE;
  }
  if (spi > BENCHMARK_INDEX) {
    return SPI_INTERPRETATION.AHEAD;
  }
  if (spi < BENCHMARK_INDEX) {
    return SPI_INTERPRETATION.BEHIND;
  }
  return SPI_INTERPRETATION.ON_TIME;
}

/**
 * Calcula los indicadores consolidados de Valor Ganado (EVM) para un proyecto completo
 * a partir de la lista de sus actividades.
 *
 * Casos borde garantizados:
 * - Lista de actividades vacía: retorna totales en 0 y métricas seguras en null sin arrojar excepciones.
 * - Total AC <= 0: cpi = null ("Sin costos registrados")
 * - Total PV <= 0: spi = null ("Sin avance planificado")
 */
export function calculateProjectEvm(activities: ActivityEvmInput[]): ProjectConsolidatedEvm {
  if (!activities || activities.length === 0) {
    return {
      totalBac: 0,
      totalPv: 0,
      totalEv: 0,
      totalAc: 0,
      activitiesCount: 0,
      pv: 0,
      ev: 0,
      cv: 0,
      sv: 0,
      cpi: null,
      spi: null,
      eac: null,
      vac: null,
      costInterpretation: CPI_INTERPRETATION.NO_COSTS,
      scheduleInterpretation: SPI_INTERPRETATION.NO_SCHEDULE,
    };
  }

  let totalBac = 0;
  let totalPv = 0;
  let totalEv = 0;
  let totalAc = 0;

  for (const activity of activities) {
    const activityEvm = calculateActivityEvm(activity);
    totalBac += activity.bac;
    totalPv += activityEvm.pv;
    totalEv += activityEvm.ev;
    totalAc += activity.actualCost;
  }

  const cv = totalEv - totalAc;
  const sv = totalEv - totalPv;

  const cpi = totalAc > 0 ? totalEv / totalAc : null;
  const spi = totalPv > 0 ? totalEv / totalPv : null;

  const eac = cpi !== null && cpi > 0 ? totalBac / cpi : null;
  const vac = eac !== null ? totalBac - eac : null;

  return {
    totalBac,
    totalPv,
    totalEv,
    totalAc,
    activitiesCount: activities.length,
    pv: totalPv,
    ev: totalEv,
    cv,
    sv,
    cpi,
    spi,
    eac,
    vac,
    costInterpretation: interpretCpi(cpi),
    scheduleInterpretation: interpretSpi(spi),
  };
}
