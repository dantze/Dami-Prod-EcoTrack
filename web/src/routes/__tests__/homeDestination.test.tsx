/**
 * What `/` does for each shape of account (TODO-100).
 *
 * The case this was written for is the driver: the web app has no driver screen
 * at all, so before this existed a driver landing on `/` was told their account
 * lacked a role and to ask an admin for one — an admin who could only confirm
 * the role was already there. The other three cases are pinned at the same time
 * because they are what make the driver branch reachable, and one of them
 * (ADMIN) is the reason the obvious version of this fix would have been wrong.
 *
 * `useAuth` is mocked, but `hasRole` delegates to the REAL `roleSatisfies`, so
 * this asserts the app's rule rather than a copy of it.
 */

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Role } from '@/types/domain';
import { roleSatisfies } from '@/auth/roleRules';

const logout = vi.fn();
let currentRoles: Role[] = [];

// Mocked at the SOURCE module, not at the '@/auth' barrel: StatusScreen and
// HomeRedirect both import `useAuth`, and only mocking where it is defined
// guarantees they share the one stubbed session.
vi.mock('@/auth/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth/AuthProvider')>();
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 1, username: 'u', fullName: 'Ion Popescu', phone: null, county: null, email: null, roles: currentRoles },
      status: 'authenticated' as const,
      adoptSession: vi.fn(),
      logout,
      hasRole: (gate: Role) => roleSatisfies(currentRoles, gate),
    }),
  };
});

async function landOn(roles: Role[]) {
  currentRoles = roles;
  const { HomeRedirect } = await import('@/routes/router');
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/comenzi" element={<h1>Comenzi</h1>} />
        <Route path="/rute" element={<h1>Rute</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('what "/" resolves to, per account', () => {
  it('sends a driver to the mobile-app signpost, not to "acces interzis"', async () => {
    await landOn(['DRIVER']);

    expect(screen.getByText(/aplicația de mobil/i)).toBeVisible();
    // The specific wrong advice this replaced.
    expect(screen.queryByText(/cere-i unui administrator/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Acces interzis')).not.toBeInTheDocument();
  });

  it('offers the driver a way off a shared browser, and no link back to "/"', async () => {
    await landOn(['DRIVER']);

    expect(screen.getByRole('button', { name: 'Deconectare' })).toBeVisible();
    // StatusScreen's default action resolves to useHomePath, which for this
    // account is "/" — the screen it is already on.
    expect(screen.queryByRole('button', { name: /înapoi/i })).not.toBeInTheDocument();
  });

  it('still refuses an account with no usable role, where "ask an admin" is right', async () => {
    await landOn([]);

    // Announced as a heading since TODO-108, which is what makes this screen
              // reachable by "jump to next heading".
    expect(screen.getByRole('heading', { name: 'Acces interzis' })).toBeVisible();
    expect(screen.getByText(/cere-i unui administrator/i)).toBeVisible();
  });

  it('sends an ADMIN-only account to Comenzi — ADMIN satisfies every gate', async () => {
    await landOn(['ADMIN']);

    expect(screen.getByRole('heading', { name: 'Comenzi' })).toBeVisible();
  });

  it('routes a driver who also holds an office role by the office role', async () => {
    await landOn(['DRIVER', 'TECH']);

    expect(screen.getByRole('heading', { name: 'Rute' })).toBeVisible();
  });

  it('sends a salesperson to Comenzi', async () => {
    await landOn(['SALES']);

    expect(screen.getByRole('heading', { name: 'Comenzi' })).toBeVisible();
  });
});
