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
};

export function useDisciplines() {
  return useQuery({
    queryKey: disciplineKeys.all,
    queryFn: ({ signal }) =>
      api.request<DisciplineResponse[]>('/disciplines', { schema: disciplineListSchema, signal }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.all }),
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
    // Même en échec (déjà supprimée par quelqu'un d'autre), la liste est relue.
    onSettled: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.all }),
  });
}
