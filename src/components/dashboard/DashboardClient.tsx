'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ActivityWithEvmResponse,
  CreateActivityInput,
} from '@/core/dto/activity.dto';
import { ConsolidatedMetricsCards } from '@/components/dashboard/ConsolidatedMetricsCards';
import { ActivityTable } from '@/components/activities/ActivityTable';
import { ActivityModal } from '@/components/activities/ActivityModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EvmComparisonChart } from '@/components/charts/EvmComparisonChart';
import {
  useProjects,
  useProjectDetail,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
} from '@/hooks/use-projects';

export default function DashboardClient() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  // Modales y diálogos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] =
    useState<ActivityWithEvmResponse | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // TanStack Query Hooks
  const {
    data: projects = [],
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useProjects();

  // Seleccionar automáticamente el primer proyecto si no hay uno activo
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const {
    data: projectDetail,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useProjectDetail(selectedProjectId);

  const createActivityMutation = useCreateActivity(selectedProjectId);
  const updateActivityMutation = useUpdateActivity(selectedProjectId);
  const deleteActivityMutation = useDeleteActivity(selectedProjectId);

  // Guardar actividad (Crear o Actualizar)
  const handleSaveActivity = async (data: CreateActivityInput) => {
    if (!selectedProjectId) return;
    setActionError(null);

    if (editingActivity) {
      await updateActivityMutation.mutateAsync({
        activityId: editingActivity.id,
        input: data,
      });
    } else {
      await createActivityMutation.mutateAsync(data);
    }
  };

  // Abrir diálogo de confirmación para eliminar
  const handleOpenDeleteDialog = (id: string, name: string) => {
    setActionError(null);
    setDeletingActivity({ id, name });
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deletingActivity) return;
    try {
      setActionError(null);
      await deleteActivityMutation.mutateAsync(deletingActivity.id);
      setDeletingActivity(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar la actividad';
      setActionError(message);
    }
  };

  const openCreateModal = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const openEditModal = (activity: ActivityWithEvmResponse) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const loading =
    isLoadingProjects || (Boolean(selectedProjectId) && isLoadingDetail);
  const generalError =
    projectsError?.message || detailError?.message || actionError;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Corporativo */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-600 p-2 text-white font-black text-sm">
              EVM
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Trycore EVM Challenge — Dashboard de Gestión
              </h1>
              <p className="text-xs text-slate-500">
                Control de Costo y Cronograma con Valor Ganado en Tiempo Real
                (PMI Standard)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/api-docs"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
            >
              Documentación OpenAPI
            </Link>
            <button
              type="button"
              onClick={openCreateModal}
              disabled={!selectedProjectId}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-xs transition disabled:opacity-50"
            >
              + Nueva Actividad
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Selector de Proyecto */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <label
              htmlFor="project-select"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Proyecto Activo:
            </label>
            <select
              id="project-select"
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.activitiesCount} actividades)
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            {projectDetail?.description}
          </div>
        </div>

        {generalError && (
          <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-700">
            {generalError}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-xs font-medium text-slate-500">
              Cargando indicadores y actividades...
            </p>
          </div>
        ) : projectDetail ? (
          <>
            {/* Indicadores Consolidados */}
            <ConsolidatedMetricsCards
              evm={projectDetail.consolidatedEvm}
              projectName={projectDetail.name}
            />

            {/* Gráfica Comparativa PV vs EV vs AC */}
            <EvmComparisonChart activities={projectDetail.activities} />

            {/* Tabla de Actividades con CRUD */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Desglose de Actividades e Indicadores Granulares
                  </h3>
                  <p className="text-xs text-slate-500">
                    Métricas calculadas al vuelo por el motor de negocio según
                    avance real y costos reportados.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                >
                  + Agregar Actividad
                </button>
              </div>

              <ActivityTable
                activities={projectDetail.activities}
                onEdit={openEditModal}
                onDelete={handleOpenDeleteDialog}
              />
            </section>
          </>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">
            No se encontró información del proyecto.
          </div>
        )}
      </main>

      {/* Modal de Creación/Edición */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveActivity}
        initialData={editingActivity}
        isEditing={Boolean(editingActivity)}
      />

      {/* Diálogo de Confirmación Accesible para Eliminación */}
      <ConfirmDialog
        isOpen={Boolean(deletingActivity)}
        title="Eliminar Actividad"
        message={`¿Estás seguro de que deseas eliminar permanentemente la actividad "${deletingActivity?.name}"? Esta acción recalculará los indicadores EVM del proyecto de manera irreversible.`}
        confirmText="Eliminar Actividad"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteActivityMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingActivity(null)}
      />
    </div>
  );
}
