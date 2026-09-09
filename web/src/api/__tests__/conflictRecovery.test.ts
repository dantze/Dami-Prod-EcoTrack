/**
 * A 409 refreshes the screen it failed on (TODO-109).
 *
 * The optimistic locking added with `Auditable` turns a concurrent edit into a
 * refusal, which is the right answer — but a refusal alone leaves the operator
 * looking at the stale row that caused it, being told by a toast to reload.
 * These assert that the reload happens for them.
 */

import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/http';
import { createQueryClient } from '@/api/queryClient';

/** Runs a mutation that rejects with `error`, and reports whether a refetch followed. */
async function mutateAndFail(error: unknown): Promise<boolean> {
  const client = createQueryClient();
  const invalidate = vi.spyOn(client, 'invalidateQueries').mockResolvedValue(undefined);

  await client
    .getMutationCache()
    .build(client, { mutationFn: async () => { throw error; } })
    .execute(undefined)
    .catch(() => {});

  return invalidate.mock.calls.length > 0;
}

describe('recovering from a write that lost a race', () => {
  it('refetches after a 409, so the pane stops showing the stale row', async () => {
    expect(await mutateAndFail(new ApiError('conflict', 409, ''))).toBe(true);
  });

  it('does not refetch after a validation error — the data was not stale', async () => {
    expect(await mutateAndFail(new ApiError('bad request', 400, ''))).toBe(false);
  });

  it('does not refetch after a 403 — a refused write says nothing about freshness', async () => {
    expect(await mutateAndFail(new ApiError('forbidden', 403, ''))).toBe(false);
  });

  it('ignores a non-ApiError rejection rather than throwing inside the cache handler', async () => {
    expect(await mutateAndFail(new Error('network down'))).toBe(false);
  });
});
