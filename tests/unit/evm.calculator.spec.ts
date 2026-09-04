import { describe, it, expect } from 'vitest';
import {
  calculateActivityEvm,
  calculateProjectEvm,
  interpretCpi,
  interpretSpi,
} from '@/core/evm/evm.calculator';
import {
  serializeEvmResult,
  serializeConsolidatedEvm,
  roundToDecimals,
} from '@/core/evm/evm.serializer';
import {
  CPI_INTERPRETATION,
  SPI_INTERPRETATION,
} from '@/core/evm/evm.constants';
import { ActivityEvmInput } from '@/core/evm/evm.types';

describe('EVM Calculator — Pure Core Engine', () => {
  describe('Casos Borde Obligatorios de PLAN.md (1 al 7)', () => {
    // 1. Ejemplo numérico testigo
    it('Caso 1: debe calcular exactamente el ejemplo numérico testigo (BAC=10,000, 50%/40%, AC=6,000)', () => {
      const input: ActivityEvmInput = {
        bac: 10000,
        plannedProgress: 50,
        actualProgress: 40,
        actualCost: 6000,
      };

      const result = calculateActivityEvm(input);

      expect(result.pv).toBe(5000);
      expect(result.ev).toBe(4000);
      expect(result.cv).toBe(-2000);
      expect(result.sv).toBe(-1000);
      expect(result.cpi).toBeCloseTo(4000 / 6000, 4); // 0.6667
      expect(result.spi).toBeCloseTo(0.8, 4);
      expect(result.eac).toBeCloseTo(15000, 2);
      expect(result.vac).toBeCloseTo(-5000, 2);
      expect(result.costInterpretation).toBe(CPI_INTERPRETATION.OVER_BUDGET);
      expect(result.scheduleInterpretation).toBe(SPI_INTERPRETATION.BEHIND);
    });

    // 2. AC = 0 con EV = 0
    it('Caso 2: debe manejar AC = 0 con EV = 0 retornando CPI null y EAC null ("Sin costos registrados")', () => {
      const input: ActivityEvmInput = {
        bac: 10000,
        plannedProgress: 20,
        actualProgress: 0,
        actualCost: 0,
      };

      const result = calculateActivityEvm(input);

      expect(result.ev).toBe(0);
      expect(result.cv).toBe(0);
      expect(result.cpi).toBeNull();
      expect(result.eac).toBeNull();
      expect(result.vac).toBeNull();
      expect(result.costInterpretation).toBe(CPI_INTERPRETATION.NO_COSTS);
    });

    // 3. AC = 0 con EV > 0
    it('Caso 3: debe manejar AC = 0 con EV > 0 retornando CPI null y EAC null sin división por cero', () => {
      const input: ActivityEvmInput = {
        bac: 8000,
        plannedProgress: 25,
        actualProgress: 30,
        actualCost: 0,
      };

      const result = calculateActivityEvm(input);

      expect(result.ev).toBe(2400);
      expect(result.cv).toBe(2400); // 2400 - 0 = 2400
      expect(result.cpi).toBeNull(); // Denominador AC <= 0 -> null
      expect(result.eac).toBeNull();
      expect(result.vac).toBeNull();
      expect(result.costInterpretation).toBe(CPI_INTERPRETATION.NO_COSTS);
    });

    // 4. AC > 0 con EV = 0 (Nota de PLAN.md)
    it('Caso 4: debe manejar AC > 0 con EV = 0 con CPI = 0 (número, NO null) y EAC null', () => {
      const input: ActivityEvmInput = {
        bac: 10000,
        plannedProgress: 50,
        actualProgress: 0,
        actualCost: 3000,
      };

      const result = calculateActivityEvm(input);

      expect(result.ev).toBe(0);
      expect(result.cv).toBe(-3000);
      expect(result.cpi).toBe(0); // Número 0 estricto
      expect(result.eac).toBeNull(); // CPI no es > 0, evita división por cero
      expect(result.vac).toBeNull();
      expect(result.costInterpretation).toBe(CPI_INTERPRETATION.OVER_BUDGET);
    });

    // 5. PV = 0 con EV = 0
    it('Caso 5: debe manejar PV = 0 con EV = 0 retornando SPI null ("Sin avance planificado")', () => {
      const input: ActivityEvmInput = {
        bac: 5000,
        plannedProgress: 0,
        actualProgress: 0,
        actualCost: 500,
      };

      const result = calculateActivityEvm(input);

      expect(result.pv).toBe(0);
      expect(result.ev).toBe(0);
      expect(result.sv).toBe(0);
      expect(result.spi).toBeNull();
      expect(result.scheduleInterpretation).toBe(SPI_INTERPRETATION.NO_SCHEDULE);
    });

    // 6. PV = 0 con EV > 0
    it('Caso 6: debe manejar PV = 0 con EV > 0 con SPI null y SV positivo consistente', () => {
      const input: ActivityEvmInput = {
        bac: 12000,
        plannedProgress: 0,
        actualProgress: 15,
        actualCost: 1000,
      };

      const result = calculateActivityEvm(input);

      expect(result.pv).toBe(0);
      expect(result.ev).toBe(1800);
      expect(result.sv).toBe(1800); // SV > 0 (adelantado en valor absoluto)
      expect(result.spi).toBeNull(); // SPI null para no contradecir a SV con un fallback falso a 1.0
      expect(result.scheduleInterpretation).toBe(SPI_INTERPRETATION.NO_SCHEDULE);
    });

    // 7. Proyecto sin actividades ([])
    it('Caso 7: debe consolidar un proyecto sin actividades retornando ceros y nulls de forma segura', () => {
      const result = calculateProjectEvm([]);

      expect(result.totalBac).toBe(0);
      expect(result.totalPv).toBe(0);
      expect(result.totalEv).toBe(0);
      expect(result.totalAc).toBe(0);
      expect(result.activitiesCount).toBe(0);
      expect(result.pv).toBe(0);
      expect(result.ev).toBe(0);
      expect(result.cv).toBe(0);
      expect(result.sv).toBe(0);
      expect(result.cpi).toBeNull();
      expect(result.spi).toBeNull();
      expect(result.eac).toBeNull();
      expect(result.vac).toBeNull();
      expect(result.costInterpretation).toBe(CPI_INTERPRETATION.NO_COSTS);
      expect(result.scheduleInterpretation).toBe(SPI_INTERPRETATION.NO_SCHEDULE);
    });
  });

  describe('Cálculo Consolidado del Proyecto (Multi-Actividad)', () => {
    it('debe agregar correctamente los totales de un proyecto con 3 actividades heterogéneas', () => {
      const activities: ActivityEvmInput[] = [
        // Actividad 1: Saludable (bajo presupuesto y adelantada)
        { bac: 10000, plannedProgress: 50, actualProgress: 60, actualCost: 4500 },
        // Actividad 2: Retrasada con sobrecosto
        { bac: 20000, plannedProgress: 40, actualProgress: 25, actualCost: 8000 },
        // Actividad 3: Recién iniciada sin costo
        { bac: 5000, plannedProgress: 10, actualProgress: 0, actualCost: 0 },
      ];

      const consolidated = calculateProjectEvm(activities);

      // Actividad 1: PV=5000, EV=6000, AC=4500
      // Actividad 2: PV=8000, EV=5000, AC=8000
      // Actividad 3: PV=500,  EV=0,    AC=0
      // Totales: BAC = 35,000; PV = 13,500; EV = 11,000; AC = 12,500
      expect(consolidated.totalBac).toBe(35000);
      expect(consolidated.totalPv).toBe(13500);
      expect(consolidated.totalEv).toBe(11000);
      expect(consolidated.totalAc).toBe(12500);
      expect(consolidated.activitiesCount).toBe(3);

      expect(consolidated.cv).toBe(11000 - 12500); // -1500
      expect(consolidated.sv).toBe(11000 - 13500); // -2500

      // CPI = 11000 / 12500 = 0.88
      expect(consolidated.cpi).toBeCloseTo(11000 / 12500, 4);
      expect(consolidated.costInterpretation).toBe(CPI_INTERPRETATION.OVER_BUDGET);

      // SPI = 11000 / 13500 = 0.8148
      expect(consolidated.spi).toBeCloseTo(11000 / 13500, 4);
      expect(consolidated.scheduleInterpretation).toBe(SPI_INTERPRETATION.BEHIND);

      // EAC = 35000 / (11000 / 12500) = 39772.7272
      expect(consolidated.eac).toBeCloseTo(35000 / (11000 / 12500), 2);
      expect(consolidated.vac).toBeCloseTo(35000 - (consolidated.eac ?? 0), 2);
    });

    it('debe retornar CPI null a nivel de proyecto si todas las actividades tienen AC = 0', () => {
      const activities: ActivityEvmInput[] = [
        { bac: 5000, plannedProgress: 10, actualProgress: 10, actualCost: 0 },
        { bac: 3000, plannedProgress: 20, actualProgress: 20, actualCost: 0 },
      ];

      const consolidated = calculateProjectEvm(activities);

      expect(consolidated.totalAc).toBe(0);
      expect(consolidated.cpi).toBeNull();
      expect(consolidated.costInterpretation).toBe(CPI_INTERPRETATION.NO_COSTS);
    });

    it('debe retornar SPI null a nivel de proyecto si todas las actividades tienen PV = 0', () => {
      const activities: ActivityEvmInput[] = [
        { bac: 5000, plannedProgress: 0, actualProgress: 10, actualCost: 500 },
        { bac: 3000, plannedProgress: 0, actualProgress: 20, actualCost: 300 },
      ];

      const consolidated = calculateProjectEvm(activities);

      expect(consolidated.totalPv).toBe(0);
      expect(consolidated.spi).toBeNull();
      expect(consolidated.scheduleInterpretation).toBe(SPI_INTERPRETATION.NO_SCHEDULE);
    });
  });

  describe('Interpretaciones Semánticas Límite (CPI y SPI)', () => {
    it('debe interpretar correctamente cuando CPI es exactamente 1.0 ("En presupuesto")', () => {
      expect(interpretCpi(1.0)).toBe(CPI_INTERPRETATION.ON_BUDGET);
    });

    it('debe interpretar correctamente cuando CPI > 1.0 ("Bajo presupuesto (eficiente en costos)")', () => {
      expect(interpretCpi(1.25)).toBe(CPI_INTERPRETATION.UNDER_BUDGET);
    });

    it('debe interpretar correctamente cuando SPI es exactamente 1.0 ("A tiempo")', () => {
      expect(interpretSpi(1.0)).toBe(SPI_INTERPRETATION.ON_TIME);
    });

    it('debe interpretar correctamente cuando SPI > 1.0 ("Adelantado en cronograma")', () => {
      expect(interpretSpi(1.15)).toBe(SPI_INTERPRETATION.AHEAD);
    });
  });

  describe('Serializador EVM (Redondeo a 4 Decimales para Presentación)', () => {
    it('debe formatear los valores numéricos a un máximo de 4 decimales sin alterar los nulos', () => {
      const rawResult = calculateActivityEvm({
        bac: 10000,
        plannedProgress: 50,
        actualProgress: 40,
        actualCost: 6000,
      });

      const serialized = serializeEvmResult(rawResult);

      expect(serialized.cpi).toBe(0.6667);
      expect(serialized.spi).toBe(0.8);
      expect(serialized.eac).toBe(15000);
      expect(serialized.vac).toBe(-5000);
    });

    it('debe serializar un resultado con nulos preservando los valores nulos', () => {
      const rawResult = calculateActivityEvm({
        bac: 10000,
        plannedProgress: 0,
        actualProgress: 0,
        actualCost: 0,
      });

      const serialized = serializeEvmResult(rawResult);

      expect(serialized.cpi).toBeNull();
      expect(serialized.spi).toBeNull();
      expect(serialized.eac).toBeNull();
      expect(serialized.vac).toBeNull();
    });

    it('debe serializar métricas consolidadas formateando tanto agregados como índices', () => {
      const consolidated = calculateProjectEvm([
        { bac: 10000, plannedProgress: 33.3333, actualProgress: 33.3333, actualCost: 3000 },
      ]);

      const serialized = serializeConsolidatedEvm(consolidated);

      expect(serialized.totalBac).toBe(10000);
      expect(serialized.totalPv).toBe(3333.33);
      expect(serialized.totalEv).toBe(3333.33);
      expect(serialized.cpi).toBe(1.1111);
    });

    it('roundToDecimals debe manejar NaN e Infinity de forma segura', () => {
      expect(roundToDecimals(NaN)).toBeNaN();
      expect(roundToDecimals(Infinity)).toBe(Infinity);
      expect(roundToDecimals(0.123456, 4)).toBe(0.1235);
    });
  });
});
