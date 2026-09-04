'use client';

import React, { useState, useEffect } from 'react';
import { CreateActivityInput } from '@/core/dto/activity.dto';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (_data: CreateActivityInput) => Promise<void>;
  initialData?: {
    id: string;
    name: string;
    bac: number;
    plannedProgress: number;
    actualProgress: number;
    actualCost: number;
  } | null;
  isEditing?: boolean;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const [name, setName] = useState('');
  const [bac, setBac] = useState<number | ''>('');
  const [plannedProgress, setPlannedProgress] = useState<number | ''>('');
  const [actualProgress, setActualProgress] = useState<number | ''>('');
  const [actualCost, setActualCost] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isEditing) {
      setName(initialData.name);
      setBac(initialData.bac);
      setPlannedProgress(initialData.plannedProgress);
      setActualProgress(initialData.actualProgress);
      setActualCost(initialData.actualCost);
    } else {
      setName('');
      setBac('');
      setPlannedProgress('');
      setActualProgress('');
      setActualCost('');
    }
    setErrors({});
  }, [initialData, isEditing, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'El nombre de la actividad es obligatorio';
    } else if (name.length > 150) {
      errs.name = 'El nombre no puede exceder 150 caracteres';
    }

    if (bac === '' || Number.isNaN(Number(bac))) {
      errs.bac = 'El presupuesto (BAC) es requerido';
    } else if (Number(bac) < 0) {
      errs.bac = 'El BAC (presupuesto planificado) no puede ser negativo';
    }

    if (plannedProgress === '' || Number.isNaN(Number(plannedProgress))) {
      errs.plannedProgress = 'El porcentaje planificado es requerido';
    } else if (Number(plannedProgress) < 0 || Number(plannedProgress) > 100) {
      errs.plannedProgress = 'El porcentaje planificado debe estar entre 0 y 100';
    }

    if (actualProgress === '' || Number.isNaN(Number(actualProgress))) {
      errs.actualProgress = 'El porcentaje real completado es requerido';
    } else if (Number(actualProgress) < 0 || Number(actualProgress) > 100) {
      errs.actualProgress = 'El porcentaje real completado debe estar entre 0 y 100';
    }

    if (actualCost === '' || Number.isNaN(Number(actualCost))) {
      errs.actualCost = 'El costo real (AC) es requerido';
    } else if (Number(actualCost) < 0) {
      errs.actualCost = 'El costo real (AC) no puede ser negativo';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        bac: Number(bac),
        plannedProgress: Number(plannedProgress),
        actualProgress: Number(actualProgress),
        actualCost: Number(actualCost),
      });
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al guardar la actividad' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {errors.submit && (
          <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="activity-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Nombre de la Actividad *
            </label>
            <input
              id="activity-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Implementación de API REST"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Presupuesto Total (BAC) */}
            <div>
              <label htmlFor="activity-bac" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Presupuesto BAC ($) *
              </label>
              <input
                id="activity-bac"
                type="number"
                step="any"
                min="0"
                value={bac}
                onChange={(e) => setBac(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="10000"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.bac && <p className="mt-1 text-xs text-rose-600">{errors.bac}</p>}
            </div>

            {/* Costo Real (AC) */}
            <div>
              <label htmlFor="activity-ac" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Costo Real AC ($) *
              </label>
              <input
                id="activity-ac"
                type="number"
                step="any"
                min="0"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="6000"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.actualCost && <p className="mt-1 text-xs text-rose-600">{errors.actualCost}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Avance Planificado (%) */}
            <div>
              <label htmlFor="activity-planned-progress" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                % Planificado (0-100) *
              </label>
              <input
                id="activity-planned-progress"
                type="number"
                step="any"
                min="0"
                max="100"
                value={plannedProgress}
                onChange={(e) =>
                  setPlannedProgress(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="50"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.plannedProgress && (
                <p className="mt-1 text-xs text-rose-600">{errors.plannedProgress}</p>
              )}
            </div>

            {/* Avance Real Completado (%) */}
            <div>
              <label htmlFor="activity-actual-progress" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                % Real Completado (0-100) *
              </label>
              <input
                id="activity-actual-progress"
                type="number"
                step="any"
                min="0"
                max="100"
                value={actualProgress}
                onChange={(e) =>
                  setActualProgress(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="40"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.actualProgress && (
                <p className="mt-1 text-xs text-rose-600">{errors.actualProgress}</p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Nota: Un avance real del 0% es perfectamente válido y representa una actividad aún no iniciada.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Actividad' : 'Crear Actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
