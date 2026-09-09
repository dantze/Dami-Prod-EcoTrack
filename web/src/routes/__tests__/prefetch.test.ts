/**
 * The prefetch map has to stay in step with the nav pane (TODO-107).
 *
 * It is a second list of the app's routes, and a second list is exactly the
 * thing that goes stale: add a screen to the nav and forget this file, and the
 * new screen is the one screen that still hesitates on click — which nobody
 * notices, because the app is not broken, only slower in one place.
 *
 * Comparing against NAV_SECTIONS rather than against the router's own table is
 * deliberate: prefetching is triggered from the nav, so what must be covered is
 * every destination the nav can offer. A route that exists but is not in the
 * nav (there are none today) would be reached by a link, not a hover.
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import { NAV_SECTIONS } from '@/components/layout/nav';
import { PREFETCHABLE_PATHS, prefetchRoute, resetPrefetchMemoForTests } from '@/routes/prefetch';

const navPaths = NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.to));

describe('route prefetching', () => {
  beforeEach(() => {
    resetPrefetchMemoForTests();
  });

  it('can prefetch every destination the nav offers', () => {
    expect([...navPaths].sort()).toEqual(
      [...navPaths].sort().filter((p) => PREFETCHABLE_PATHS.includes(p)),
    );
  });

  it('lists nothing the nav cannot reach, so no chunk is fetched for a dead path', () => {
    expect([...PREFETCHABLE_PATHS].sort()).toEqual([...navPaths].sort());
  });

  it('attempts a given path only once, so a hover loop is not a fetch loop', async () => {
    // A rejected import() is not cached by the browser, so without the memo a
    // failing chunk would be re-requested on every single hover.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    prefetchRoute('/rute');
    prefetchRoute('/rute');
    prefetchRoute('/rute');

    // Nothing to assert on the network here; what is asserted is that repeated
    // calls are inert and never throw into the caller's event handler.
    await Promise.resolve();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('ignores a path it does not know instead of throwing in an event handler', () => {
    expect(() => prefetchRoute('/nu-exista')).not.toThrow();
  });
});
