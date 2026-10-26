import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createQueryClient } from '@/lib/api';
import { createAppRouter } from '@/router';

/** QueryClient neuf, sans retry : un test ne dépend pas d'un autre. */
function createTestQueryClient() {
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({ queries: { retry: false } });
  return queryClient;
}

/** Rend un composant seul, avec TanStack Query (sans router : pas de <Link>). */
export function renderWithQuery(ui: ReactElement) {
  return render(<QueryClientProvider client={createTestQueryClient()}>{ui}</QueryClientProvider>);
}

/** Rend l'application complète (routes, liens, Query) à l'adresse donnée. */
export async function renderApp(path: string) {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }));
  const result = render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await router.load();
  return { ...result, router };
}
