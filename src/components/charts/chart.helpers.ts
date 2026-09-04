export interface ActivityChartDataPoint {
  name: string;
  fullName: string;
  pv: number;
  ev: number;
  ac: number;
  bac: number;
  cpi: number | null;
  spi: number | null;
}

export interface RawActivityForChart {
  name: string;
  pv: number;
  ev: number;
  actualCost: number;
  bac: number;
  cpi: number | null;
  spi: number | null;
}

/**
 * Transforma una lista de actividades con métricas EVM en una estructura plana
 * optimizada para consumo en Recharts. Trunca nombres largos para visualización limpia
 * en el eje X preservando el nombre completo para el Tooltip.
 */
export function transformActivitiesForChart(
  activities: RawActivityForChart[]
): ActivityChartDataPoint[] {
  return activities.map((activity, idx) => {
    const truncatedName =
      activity.name.length > 18 ? `${activity.name.slice(0, 16)}...` : activity.name;

    return {
      name: truncatedName || `Actividad ${idx + 1}`,
      fullName: activity.name,
      pv: activity.pv ?? 0,
      ev: activity.ev ?? 0,
      ac: activity.actualCost ?? 0,
      bac: activity.bac ?? 0,
      cpi: activity.cpi,
      spi: activity.spi,
    };
  });
}
