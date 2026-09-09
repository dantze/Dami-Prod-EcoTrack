/**
 * The dead-end screens announce a heading (TODO-108).
 *
 * `Empty` renders its title as a plain `<div>`, so Acces interzis, Pagina nu a
 * fost găsită and the router's error boundary offered a screen reader no
 * heading at all — and "jump to the next heading", which is how many people
 * orient themselves on an unfamiliar page, landed nowhere. These screens are
 * exactly the ones somebody arrives at confused.
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState heading semantics', () => {
  it('announces its title as a level-2 heading by default', () => {
    render(<EmptyState title="Acces interzis" body="..." />);

    expect(screen.getByRole('heading', { name: 'Acces interzis', level: 2 })).toBeVisible();
  });

  it('honours an explicit level', () => {
    render(<EmptyState title="Nimic aici" headingLevel={1} />);

    expect(screen.getByRole('heading', { name: 'Nimic aici', level: 1 })).toBeVisible();
  });

  it('can opt out, for the in-table variant whose chrome already has the heading', () => {
    render(<EmptyState title="Nicio comandă" size="sm" headingLevel={false} />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    // The text is still there — only its role changed.
    expect(screen.getByText('Nicio comandă')).toBeVisible();
  });
});
