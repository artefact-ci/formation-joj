import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createQueryClient } from '@/lib/api';

/** Rend un composant avec un QueryClient neuf, sans retry : un test ne dépend pas d'un autre. */
export function renderWithQuery(ui: ReactElement) {
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({ queries: { retry: false } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}
