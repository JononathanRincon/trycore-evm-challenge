export interface ActivityEvmInput {
  bac: number;
  plannedProgress: number;
  actualProgress: number;
  actualCost: number;
}

export interface EvmResult {
  pv: number;
  ev: number;
  cv: number;
  sv: number;
  cpi: number | null;
  spi: number | null;
  eac: number | null;
  vac: number | null;
  costInterpretation: string;
  scheduleInterpretation: string;
}

export interface ProjectConsolidatedEvm extends EvmResult {
  totalBac: number;
  totalPv: number;
  totalEv: number;
  totalAc: number;
  activitiesCount: number;
}
