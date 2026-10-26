import {
  type CreateDisciplineInput,
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
