import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/auth';
import { AppProviders } from '@/theme/AppProviders';
import { createQueryClient } from '@/api/queryClient';
import { router } from '@/routes/router';
import './index.css';

// Cache policy and the 409-conflict refresh live in @/api/queryClient, where a
// test can reach them.
const queryClient = createQueryClient();

// AuthProvider sits above the router (not inside a route element) so its
// session-restore effect starts as early as possible and RequireAuth, which
// lives inside the route tree, can read `status` from the very first route
// match — see src/auth/AuthProvider.tsx.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </AppProviders>
  </StrictMode>,
);
