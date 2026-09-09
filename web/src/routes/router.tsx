/**
 * Route table.
 *
 * Owned by the shell, not by the feature agents — they add screens by
 * exporting page components, and those get wired up here.
 *
 * Shape, outside in:
 *   /login is the only public route.
 *   `RequireAuth` gates everything else on a live session (see src/auth) —
 *     anonymous or still-restoring visitors never reach AppShell.
 *   `RequireRole` gates the Vânzări routes on SALES and the Tehnic routes on
 *     TECH, matching the two nav sections in AppShell — a Sales-only account
 *     hitting /rute directly gets the Romanian "acces interzis" page, not a
 *     blank screen or a silent redirect.
 *   The index route sends a signed-in user to whichever section their roles
 *     actually grant, so landing on "/" never bounces through Forbidden.
 *   A catch-all under AppShell renders NotFoundPage for anything else, and
 *     the root `errorElement` catches any render throw below it.
 *
 * The feature screens are loaded with React Router's own `lazy`, so each
 * becomes its own chunk instead of riding in the entry bundle. That matters
 * here for two reasons: nobody has both role sets in practice, so a dispatcher
 * was downloading the whole Vânzări module (and vice versa) to look at a route;
 * and @dnd-kit is used by exactly one screen, RoutesPage, so it now travels
 * with it. `lazy` rather than React.lazy + Suspense because the router already
 * has a pending state — the current screen stays on-screen during the fetch
 * instead of blanking to a spinner.
 *
 * The auth screens stay eager on purpose: LoginPage is the first thing an
 * anonymous visitor needs, and making it a second round trip would put a
 * network hop on the critical path to the login form.
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth, RequireRole, useAuth, isDriverOnly } from '@/auth';
import { ForbiddenPage } from '@/features/auth/ForbiddenPage';
import { EnrollmentPage } from '@/features/auth/EnrollmentPage';
import { DriverAppPage } from '@/features/auth/DriverAppPage';
import { NotFoundPage } from '@/features/auth/NotFoundPage';
import { ErrorPage } from './ErrorPage';

/**
 * Turns a named export from a lazily imported module into the `{ Component }`
 * shape React Router's `lazy` expects. Keeps the route table readable.
 */
function lazyPage(load: () => Promise<Record<string, unknown>>, name: string) {
  return async () => ({ Component: (await load())[name] as React.ComponentType });
}

/**
 * Sends a signed-in user to the first section their roles actually grant.
 *
 * `hasRole` treats ADMIN as satisfying every gate (see AuthProvider), so an
 * admin leaves on the first line like everyone else and never reaches the
 * bottom of this function. What does reach it is an account holding neither
 * office role — in practice a driver, whose app is the phone (TODO-100). Those
 * two cases want different screens: the driver is correctly configured and
 * needs a signpost, while an account with no usable role at all is the genuine
 * "ask an admin" case ForbiddenPage was written for.
 *
 * The DRIVER check uses `isDriverOnly`, which reads `user.roles` directly:
 * `hasRole` would answer true for an admin — harmless here only because an
 * admin has already returned above, and fragile enough to be worth not
 * relying on.
 */
export function HomeRedirect() {
  const { hasRole, user } = useAuth();
  if (hasRole('SALES')) return <Navigate to="/comenzi" replace />;
  if (hasRole('TECH')) return <Navigate to="/rute" replace />;
  if (user && isDriverOnly(user.roles)) return <DriverAppPage />;
  return <ForbiddenPage />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorPage />,
    children: [
      { path: 'login', element: <EnrollmentPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <HomeRedirect /> },
              {
                // Cross-module: the map plots Vânzări orders and draws Tehnic
                // routes over them, so either role opens it and the screen
                // itself decides which layers that role gets.
                element: <RequireRole roles={['SALES', 'TECH']} />,
                children: [
                  {
                    path: 'harta',
                    lazy: lazyPage(() => import('@/features/map/MapPage'), 'MapPage'),
                  },
                ],
              },
              {
                element: <RequireRole roles={['SALES']} />,
                children: [
                  {
                    path: 'comenzi',
                    lazy: lazyPage(() => import('@/features/sales/OrdersPage'), 'OrdersPage'),
                  },
                  {
                    // Sits next to Comenzi and reads the same orders — the
                    // month view of the list, not a separate record type.
                    path: 'calendar',
                    lazy: lazyPage(() => import('@/features/sales/CalendarPage'), 'CalendarPage'),
                  },
                  {
                    path: 'clienti',
                    lazy: lazyPage(() => import('@/features/sales/ClientsPage'), 'ClientsPage'),
                  },
                  {
                    path: 'produse',
                    lazy: lazyPage(() => import('@/features/sales/ProductsPage'), 'ProductsPage'),
                  },
                  {
                    path: 'abonamente',
                    lazy: lazyPage(
                      () => import('@/features/sales/SubscriptionsPage'),
                      'SubscriptionsPage',
                    ),
                  },
                ],
              },
              {
                // Admin-only. Access control lives entirely behind these two
                // screens: nobody enters EcoTrack except by being approved in
                // "Cereri de acces".
                element: <RequireRole roles={['ADMIN']} />,
                children: [
                  {
                    path: 'cereri',
                    lazy: lazyPage(
                      () => import('@/features/admin/AccessRequestsPage'),
                      'AccessRequestsPage',
                    ),
                  },
                  {
                    path: 'angajati',
                    lazy: lazyPage(
                      () => import('@/features/admin/EmployeesPage'),
                      'EmployeesPage',
                    ),
                  },
                ],
              },
              {
                element: <RequireRole roles={['TECH']} />,
                children: [
                  {
                    path: 'rute',
                    lazy: lazyPage(() => import('@/features/technical/RoutesPage'), 'RoutesPage'),
                  },
                  {
                    path: 'sarcini',
                    lazy: lazyPage(() => import('@/features/technical/TasksPage'), 'TasksPage'),
                  },
                  {
                    path: 'recurente',
                    lazy: lazyPage(
                      () => import('@/features/technical/RecurringPage'),
                      'RecurringPage',
                    ),
                  },
                ],
              },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
