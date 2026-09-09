/**
 * Fetches a screen's JavaScript before the operator asks for it (TODO-107).
 *
 * Every feature screen is a separate chunk (see router.tsx), which keeps the
 * initial download inside its budget but moves the cost to the click: pressing
 * Rute starts a network round trip for RoutesPage's 24 kB, and React Router
 * holds the CURRENT screen on-screen while it waits. Nothing is broken, it just
 * hesitates — and dispatchers move between Rute, Sarcini and Hartă constantly,
 * so they pay it over and over.
 *
 * Hovering or focusing the nav item is a good enough prediction. By the time the
 * pointer travels to the row and the click lands, a chunk this size is usually
 * already there, so the navigation renders from memory.
 *
 * <p>Three properties keep this from being a pessimisation:
 * <ul>
 *   <li>Each path is attempted ONCE. `import()` caches the module, but a
 *       rejected promise does not, so a failed prefetch on a flaky connection
 *       would otherwise retry on every hover.</li>
 *   <li>A failure is swallowed. This is a speculative fetch for something the
 *       user has not asked for; the real navigation will surface a genuine
 *       failure through the router's own error boundary, which is where it
 *       belongs.</li>
 *   <li>Only routes the nav pane actually shows are listed. Prefetching a
 *       screen the account's roles forbid would download a chunk it can never
 *       render.</li>
 * </ul>
 */

/**
 * Path -> the same dynamic import the route table uses. Kept next to the router
 * rather than inside it because `router.tsx` evaluates `createBrowserRouter` at
 * module scope; importing this file from the nav must not drag that in.
 */
const LOADERS: Record<string, () => Promise<unknown>> = {
  '/harta': () => import('@/features/map/MapPage'),
  '/comenzi': () => import('@/features/sales/OrdersPage'),
  '/calendar': () => import('@/features/sales/CalendarPage'),
  '/clienti': () => import('@/features/sales/ClientsPage'),
  '/produse': () => import('@/features/sales/ProductsPage'),
  '/abonamente': () => import('@/features/sales/SubscriptionsPage'),
  '/cereri': () => import('@/features/admin/AccessRequestsPage'),
  '/angajati': () => import('@/features/admin/EmployeesPage'),
  '/rute': () => import('@/features/technical/RoutesPage'),
  '/sarcini': () => import('@/features/technical/TasksPage'),
  '/recurente': () => import('@/features/technical/RecurringPage'),
};

const attempted = new Set<string>();

export function prefetchRoute(path: string): void {
  if (attempted.has(path)) return;
  const load = LOADERS[path];
  if (!load) return;
  attempted.add(path);
  void load().catch(() => {
    /* speculative: the real navigation reports failures, this must not. */
  });
}

/** Test seam — the module-level "already tried" set outlives a test otherwise. */
export function resetPrefetchMemoForTests(): void {
  attempted.clear();
}

/** The paths this module knows how to prefetch. Used to hold it to the router. */
export const PREFETCHABLE_PATHS = Object.keys(LOADERS);
