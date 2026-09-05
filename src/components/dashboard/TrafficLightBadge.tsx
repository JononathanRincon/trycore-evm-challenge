import React from 'react';
import { getTrafficLightStatus, getTrafficLightClasses } from '@/core/evm/evm.ui.helpers';

interface TrafficLightBadgeProps {
  cpi: number | null;
  spi: number | null;
  costInterpretation?: string;
  scheduleInterpretation?: string;
  showDetails?: boolean;
}

export const TrafficLightBadge: React.FC<TrafficLightBadgeProps> = ({
  cpi,
  spi,
  costInterpretation,
  scheduleInterpretation,
  showDetails = false,
}) => {
  const status = getTrafficLightStatus(cpi, spi);
  const classes = getTrafficLightClasses(status);

  return (
    <div className="inline-flex flex-col gap-1">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-xs ring-1 ring-inset ${classes.badge}`}
        role="status"
        aria-label={`Estado EVM: ${classes.label}`}
      >
        <span className={`h-2 w-2 rounded-full ${classes.dot}`} aria-hidden="true" />
        <span>{classes.label}</span>
      </div>

      {showDetails && (costInterpretation || scheduleInterpretation) && (
        <div className="text-[11px] leading-tight text-slate-500">
          {costInterpretation && <p>• {costInterpretation}</p>}
          {scheduleInterpretation && <p>• {scheduleInterpretation}</p>}
        </div>
      )}
    </div>
  );
};
