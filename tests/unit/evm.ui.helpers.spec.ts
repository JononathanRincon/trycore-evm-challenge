import { describe, it, expect } from 'vitest';
import {
  getTrafficLightStatus,
  getTrafficLightClasses,
  formatEvmValue,
  formatCurrency,
} from '@/core/evm/evm.ui.helpers';
import { transformActivitiesForChart } from '@/components/charts/chart.helpers';

describe('UI Helpers — EVM Presentation and Chart Formatting', () => {
  describe('getTrafficLightStatus', () => {
    it('debe retornar "success" cuando CPI >= 1 y SPI >= 1', () => {
      expect(getTrafficLightStatus(1.0, 1.0)).toBe('success');
      expect(getTrafficLightStatus(1.2, 1.05)).toBe('success');
    });

    it('debe retornar "warning" cuando exactamente uno de los dos es < 1', () => {
      expect(getTrafficLightStatus(0.9, 1.1)).toBe('warning');
      expect(getTrafficLightStatus(1.1, 0.8)).toBe('warning');
    });

    it('debe retornar "danger" cuando ambos son < 1', () => {
      expect(getTrafficLightStatus(0.85, 0.75)).toBe('danger');
      expect(getTrafficLightStatus(0, 0)).toBe('danger');
    });

    it('debe retornar "neutral" cuando ambos son null', () => {
      expect(getTrafficLightStatus(null, null)).toBe('neutral');
    });
  });

  describe('getTrafficLightClasses', () => {
    it('debe retornar clases con estilo verde para success', () => {
      const res = getTrafficLightClasses('success');
      expect(res.label).toBe('Saludable');
      expect(res.badge).toContain('emerald');
    });

    it('debe retornar clases con estilo amarillo para warning', () => {
      const res = getTrafficLightClasses('warning');
      expect(res.label).toBe('Atención Requerida');
      expect(res.badge).toContain('amber');
    });

    it('debe retornar clases con estilo rojo para danger', () => {
      const res = getTrafficLightClasses('danger');
      expect(res.label).toBe('En Riesgo Crítico');
      expect(res.badge).toContain('rose');
    });

    it('debe retornar clases con estilo neutro para neutral', () => {
      const res = getTrafficLightClasses('neutral');
      expect(res.label).toBe('Sin Datos Suficientes');
      expect(res.badge).toContain('slate');
    });
  });

  describe('formatEvmValue & formatCurrency', () => {
    it('debe retornar "N/A" para null, undefined o NaN', () => {
      expect(formatEvmValue(null)).toBe('N/A');
      expect(formatEvmValue(undefined as any)).toBe('N/A');
      expect(formatEvmValue(NaN)).toBe('N/A');

      expect(formatCurrency(null)).toBe('N/A');
      expect(formatCurrency(undefined as any)).toBe('N/A');
      expect(formatCurrency(NaN)).toBe('N/A');
    });

    it('debe formatear números válidos con decimales correspondientes', () => {
      expect(formatEvmValue(1.2345, 4)).toMatch(/1[,.]2345/);
      expect(formatCurrency(10000)).toBe('$10,000.00');
    });
  });

  describe('transformActivitiesForChart', () => {
    it('debe transformar actividades mapeando pv, ev y ac correctamente', () => {
      const rawActivities = [
        {
          name: 'Esta es una actividad con un nombre sumamente largo para el eje X',
          pv: 5000,
          ev: 4000,
          actualCost: 6000,
          bac: 10000,
          cpi: 0.6667,
          spi: 0.8,
        },
      ];

      const result = transformActivitiesForChart(rawActivities);
      expect(result).toHaveLength(1);
      expect(result[0].name.endsWith('...')).toBe(true);
      expect(result[0].fullName).toBe(rawActivities[0].name);
      expect(result[0].pv).toBe(5000);
      expect(result[0].ev).toBe(4000);
      expect(result[0].ac).toBe(6000);
      expect(result[0].bac).toBe(10000);
    });

    it('debe manejar lista vacía sin fallar', () => {
      const result = transformActivitiesForChart([]);
      expect(result).toEqual([]);
    });
  });
});
