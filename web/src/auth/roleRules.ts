/**
 * The one definition of "does this account satisfy a role gate".
 *
 * Extracted from `AuthProvider.hasRole` so the rule has a single home: it is
 * mirrored by `HomeRedirect`, by `useHomePath` and by the nav pane's section
 * filter, and a test that restates it would be asserting its own copy rather
 * than the app's.
 *
 * ADMIN satisfies every gate. That mirrors the backend: SecurityConfig's matrix
 * lets ADMIN perform every business write, so an admin seeing only the Admin
 * section while being allowed to do everything would be a lie the UI tells
 * about the server.
 */

import type { Role } from '@/types/domain';

export function roleSatisfies(roles: readonly Role[], gate: Role): boolean {
  return roles.includes(gate) || roles.includes('ADMIN');
}

/**
 * True for an account whose only role is DRIVER — the one that has no screen in
 * this app at all, because the driver experience is the phone (TODO-33).
 *
 * Deliberately NOT written with `roleSatisfies`: an admin satisfies the DRIVER
 * gate too, and the question here is what the account actually holds.
 */
export function isDriverOnly(roles: readonly Role[]): boolean {
  return roles.includes('DRIVER') && !roles.some((r) => r === 'SALES' || r === 'TECH' || r === 'ADMIN');
}
