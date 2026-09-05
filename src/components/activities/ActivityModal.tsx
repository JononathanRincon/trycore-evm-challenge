'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateActivityInput, CreateActivitySchema } from '@/core/dto/activity.dto';

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
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateActivityInput>({
    resolver: zodResolver(CreateActivitySchema),
    defaultValues: {
      name: '',
      bac: 0,
      plannedProgress: 0,
      actualProgress: 0,
      actualCost: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      if (initialData && isEditing) {
        reset({
          name: initialData.name,
          bac: initialData.bac,
          plannedProgress: initialData.plannedProgress,
          actualProgress: initialData.actualProgress,
          actualCost: initialData.actualCost,
        });
      } else {
        reset({
          name: '',
          bac: '' as unknown as number,
          plannedProgress: '' as unknown as number,
          actualProgress: '' as unknown as number,
          actualCost: '' as unknown as number,
        });
      }
    }
  }, [isOpen, initialData, isEditing, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: CreateActivityInput) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la actividad';
      setSubmitError(message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 id="activity-modal-title" className="text-lg font-bold text-slate-900">
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

        {submitError && (
          <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="mt-4 space-y-4" noValidate>
          {/* Nombre */}
          <div>
            <label
              htmlFor="activity-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Nombre de la Actividad *
            </label>
            <input
              id="activity-name"
              type="text"
              placeholder="Ej: Implementación de API REST"
              {...register('name')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Presupuesto Total (BAC) */}
            <div>
              <label
                htmlFor="activity-bac"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Presupuesto BAC ($) *
              </label>
              <input
                id="activity-bac"
                type="number"
                step="any"
                min="0"
                placeholder="10000"
                {...register('bac', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.bac && <p className="mt-1 text-xs text-rose-600">{errors.bac.message}</p>}
            </div>

            {/* Costo Real (AC) */}
            <div>
              <label
                htmlFor="activity-ac"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Costo Real AC ($) *
              </label>
              <input
                id="activity-ac"
                type="number"
                step="any"
                min="0"
                placeholder="6000"
                {...register('actualCost', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.actualCost && (
                <p className="mt-1 text-xs text-rose-600">{errors.actualCost.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Avance Planificado (%) */}
            <div>
              <label
                htmlFor="activity-planned-progress"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                % Planificado (0-100) *
              </label>
              <input
                id="activity-planned-progress"
                type="number"
                step="any"
                min="0"
                max="100"
                placeholder="50"
                {...register('plannedProgress', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.plannedProgress && (
                <p className="mt-1 text-xs text-rose-600">{errors.plannedProgress.message}</p>
              )}
            </div>

            {/* Avance Real Completado (%) */}
            <div>
              <label
                htmlFor="activity-actual-progress"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                % Real Completado (0-100) *
              </label>
              <input
                id="activity-actual-progress"
                type="number"
                step="any"
                min="0"
                max="100"
                placeholder="40"
                {...register('actualProgress', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.actualProgress && (
                <p className="mt-1 text-xs text-rose-600">{errors.actualProgress.message}</p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Nota: Un avance real del 0% es perfectamente válido y representa una actividad aún no
            iniciada.
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
              {isSubmitting
                ? 'Guardando...'
                : isEditing
                  ? 'Actualizar Actividad'
                  : 'Crear Actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
