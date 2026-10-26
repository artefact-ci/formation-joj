import {
  type CreateDisciplineInput,
  type UpdateDisciplineInput,
  type DisciplineResponse,
  disciplineListSchema,
  disciplineSchema,
} from '@joj/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

/** Clés du cache TanStack Query pour cette fonctionnalité. */
export const disciplineKeys = {
  all: ['disciplines'] as const,
  list: () => [...disciplineKeys.all, 'list'] as const,
  detail: (id: string) => [...disciplineKeys.all, 'detail', id] as const,
};

export function useDisciplines() {
  return useQuery({
    queryKey: disciplineKeys.list(),
    queryFn: ({ signal }) =>
      api.request<DisciplineResponse[]>('/disciplines', { schema: disciplineListSchema, signal }),
  });
}

export function useDiscipline(id: string) {
  return useQuery({
    queryKey: disciplineKeys.detail(id),
    queryFn: ({ signal }) =>
      api.request<DisciplineResponse>(`/disciplines/${id}`, { schema: disciplineSchema, signal }),
  });
}

export function useCreateDiscipline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDisciplineInput) =>
      api.request<DisciplineResponse>('/disciplines', {
        method: 'POST',
        body: input,
        schema: disciplineSchema,
      }),
    // La liste est relue depuis l'API : elle reste triée par le serveur.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.list() }),
  });
}

export function useUpdateDiscipline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDisciplineInput }) =>
      api.request<DisciplineResponse>(`/disciplines/${id}`, {
        method: 'PATCH',
        body: input,
        schema: disciplineSchema,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.all }),
  });
}

export function useDeleteDiscipline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.request<void>(`/disciplines/${id}`, { method: 'DELETE' }),
    // Même en échec (déjà supprimée par quelqu'un d'autre), la liste est relue. Le détail ne
    // l'est pas : sa page le quitte après la suppression.
    onSettled: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.list() }),
  });
}
