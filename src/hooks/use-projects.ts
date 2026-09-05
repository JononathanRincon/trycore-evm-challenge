import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ProjectDetailResponse,
  ProjectListItemResponse,
  PaginatedProjectsResponse,
} from '@/core/dto/project.dto';
import { CreateActivityInput, ActivityWithEvmResponse } from '@/core/dto/activity.dto';

interface UseProjectsParams {
  page?: number;
  limit?: number;
}

export function useProjects(params?: UseProjectsParams) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async (): Promise<ProjectListItemResponse[]> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));

      const url = `/api/projects${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Error al cargar la lista de proyectos');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
      return (data as PaginatedProjectsResponse).items;
    },
  });
}

export function useProjectDetail(projectId: string | null) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async (): Promise<ProjectDetailResponse> => {
      if (!projectId) throw new Error('No project ID specified');
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        throw new Error('Error al cargar el detalle del proyecto');
      }
      return res.json();
    },
    enabled: Boolean(projectId),
  });
}

export function useCreateActivity(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateActivityInput): Promise<ActivityWithEvmResponse> => {
      if (!projectId) throw new Error('No se ha seleccionado un proyecto');
      const res = await fetch(`/api/projects/${projectId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Error al crear la actividad');
      }

      return res.json();
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateActivity(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      activityId,
      input,
    }: {
      activityId: string;
      input: CreateActivityInput;
    }): Promise<ActivityWithEvmResponse> => {
      const res = await fetch(`/api/activities/${activityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Error al actualizar la actividad');
      }

      return res.json();
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteActivity(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId: string): Promise<void> => {
      const res = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Error al eliminar la actividad');
      }
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
