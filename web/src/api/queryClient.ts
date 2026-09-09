/**
 * The app's one QueryClient, and the two policies that are not per-feature.
 *
 * Lives here rather than in main.tsx so both can be exercised by a test:
 * main.tsx renders the whole application, which is not a place to assert cache
 * behaviour from.
 */

import { MutationCache, QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api/http';

export function createQueryClient(): QueryClient {
  const client: QueryClient = new QueryClient({
    /*
     * A 409 means somebody else changed the record first (TODO-109).
     *
     * The backend now refuses a stale write instead of silently applying it
     * (Auditable's @Version), and GlobalExceptionHandler turns that into a 409
     * whose Romanian message says "reload and apply the change again". Showing
     * that over a pane still displaying the STALE row leaves the operator
     * stuck: the toast asks for a reload, and doing it by hand is the only way
     * out.
     *
     * So the refusal also refreshes. By the time the toast is read, the pane
     * underneath shows the other person's version, and re-applying the edit is
     * the ordinary next action rather than a recovery procedure.
     *
     * Everything is invalidated rather than the mutation's own keys, because
     * the write that lost is exactly the one whose effects are unknown — it may
     * have touched an order, its tasks and a subscription. This runs only on a
     * genuine conflict, which is rare, so the cost is a few refetches at the
     * one moment they are certainly warranted.
     *
     * 409 is NOT unique to optimistic locking — InsufficientQuantityException
     * and the subscription guards answer with it too — and refetching after
     * those is right for the same reason: each one means the caller's picture
     * of the data was out of date.
     */
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof ApiError && error.status === 409) {
          void client.invalidateQueries();
        }
      },
    }),
    defaultOptions: {
      queries: {
        // Five minutes, not thirty seconds. Dispatchers move between Rute,
        // Sarcini and Hartă constantly, and every screen is a fresh mount — at
        // 30s almost every return trip re-fetched lists that had not changed
        // and flashed a loading state over data already on screen. The write
        // paths all invalidate explicitly, so freshness comes from mutations
        // rather than from re-asking on a timer.
        staleTime: 5 * 60_000,
        // Keep the cache well past staleTime so a revisit renders instantly
        // from cache and revalidates behind the existing content.
        gcTime: 30 * 60_000,
        // Alt-tabbing back to the browser is not a reason to re-query.
        refetchOnWindowFocus: false,
        // Nor is a mount, while the data is still inside staleTime.
        refetchOnMount: true,
        retry: 1,
      },
    },
  });

  return client;
}
