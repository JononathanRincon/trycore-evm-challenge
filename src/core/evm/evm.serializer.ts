import { EvmResult, ProjectConsolidatedEvm } from './evm.types';

const DISPLAY_DECIMALS = 4;

/**
 * Redondea un número a una cantidad fija de decimales para presentación en API/UI.
 * Utiliza notación exponencial para evitar errores comunes de punto flotante en JS.
 */
export function roundToDecimals(
  value: number,
  decimals: number = DISPLAY_DECIMALS
): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return value;
  }
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

/**
 * Serializa un resultado EVM aplicando redondeo a 4 decimales exclusivamente para la salida HTTP.
 * El cálculo dentro de evm.calculator.ts permanece en punto flotante puro de 64 bits.
 */
export function serializeEvmResult(result: EvmResult): EvmResult {
  return {
    ...result,
    pv: roundToDecimals(result.pv),
    ev: roundToDecimals(result.ev),
    cv: roundToDecimals(result.cv),
    sv: roundToDecimals(result.sv),
    cpi: result.cpi !== null ? roundToDecimals(result.cpi) : null,
    spi: result.spi !== null ? roundToDecimals(result.spi) : null,
    eac: result.eac !== null ? roundToDecimals(result.eac) : null,
    vac: result.vac !== null ? roundToDecimals(result.vac) : null,
  };
}

/**
 * Serializa los indicadores consolidados del proyecto aplicando redondeo para presentación.
 */
export function serializeConsolidatedEvm(
  consolidated: ProjectConsolidatedEvm
): ProjectConsolidatedEvm {
  const base = serializeEvmResult(consolidated);
  return {
    ...base,
    totalBac: roundToDecimals(consolidated.totalBac),
    totalPv: roundToDecimals(consolidated.totalPv),
    totalEv: roundToDecimals(consolidated.totalEv),
    totalAc: roundToDecimals(consolidated.totalAc),
    activitiesCount: consolidated.activitiesCount,
  };
}
