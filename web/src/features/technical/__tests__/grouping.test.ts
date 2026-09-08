/**
 * `distanceKm`, the only thing left in `grouping.ts`.
 *
 * The dispatch board's two heuristics — a suggested group of unassigned jobs,
 * and a shorter stop order — are gone (TODO-16), and their tests went with
 * them. What survives is the great-circle helper the map feature imports.
 *
 * Coordinates below are real Bucharest-area points so the kilometres in the
 * assertions are recognisable rather than abstract.
 */

import { describe, expect, it } from 'vitest';
import { distanceKm } from '../grouping';

describe('distanceKm', () => {
  it('is zero for the same point and symmetric', () => {
    const a = { lat: 44.55, lng: 26.07 };
    const b = { lat: 44.49, lng: 26.18 };
    expect(distanceKm(a, a)).toBe(0);
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 6);
  });

  it('gets a known Ilfov hop about right', () => {
    // Otopeni → Voluntari is ~11 km as the crow flies.
    expect(distanceKm({ lat: 44.551, lng: 26.0714 }, { lat: 44.49, lng: 26.18 })).toBeGreaterThan(8);
    expect(distanceKm({ lat: 44.551, lng: 26.0714 }, { lat: 44.49, lng: 26.18 })).toBeLessThan(14);
  });
});
