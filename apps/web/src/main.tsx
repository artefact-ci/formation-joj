import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyStoredTheme } from './features/theme/theme';
import { createQueryClient } from './lib/api';
import { createAppRouter } from './router';
import './styles.css';

// Avant le premier affichage, pour que la page n'apparaisse pas d'abord dans l'autre thème.
applyStoredTheme();

const queryClient = createQueryClient();
const router = createAppRouter();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
