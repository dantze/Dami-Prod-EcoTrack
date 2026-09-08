/**
 * Great-circle distance, and nothing else.
 *
 * This file used to hold the dispatch board's two heuristics: `suggestRouteGroup`,
 * which proposed unassigned jobs to add to a route, and `suggestStopOrder`, which
 * proposed a shorter stop sequence. Both are gone (TODO-16) — the board makes no
 * suggestions of any kind. Adding work to a route is a drag from "Neasignate";
 * ordering the stops is the dispatcher's, by drag or keyboard.
 *
 * `distanceKm` survives because the map feature imports it.
 */

import type { LatLng } from '@/types/domain';

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometres. */
export function distanceKm(from: LatLng, to: LatLng): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}
