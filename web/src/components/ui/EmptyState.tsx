/**
 * Empty state, on the shadcn `Empty` composition.
 *
 * Two flavours via `size`: `md` for a whole screen, `sm` for the inside of a
 * table body where the surrounding chrome already says where we are.
 */

import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/empty';
import { cn } from '@/lib/utils';
import type { EmptyStateProps } from './types';

export interface EmptyStateExtraProps {
  size?: 'sm' | 'md';
  /** Optional glyph above the title; falls back to a neutral placeholder mark. */
  icon?: ReactNode;
  className?: string;
  /**
   * Heading level the title is announced at, or `false` for none (TODO-108).
   *
   * Defaults to 2. `Empty` renders its title as a plain `<div>`, so before this
   * the whole-screen dead ends — Acces interzis, Pagina nu a fost găsită, the
   * router's error boundary — offered a screen reader NO heading at all, and
   * "jump to the next heading" (how many people navigate a page first) landed
   * nowhere. It is set through props rather than by editing the primitive:
   * `components/shadcn/*` is CLI-owned and not hand-edited, and `EmptyTitle`
   * spreads its props onto the element, so ARIA reaches it intact.
   *
   * Pass `false` for the `sm` size inside a table body, where the surrounding
   * chrome already carries the real heading and a second one would be noise.
   */
  headingLevel?: 1 | 2 | 3 | false;
}

export function EmptyState({
  title,
  body,
  action,
  size = 'md',
  icon,
  className,
  headingLevel = 2,
}: EmptyStateProps & EmptyStateExtraProps) {
  return (
    <Empty className={cn('gap-2', size === 'md' ? 'py-14' : 'py-8', className)}>
      <EmptyHeader className="gap-1.5">
        <EmptyMedia
          variant="icon"
          className={cn(
            'mb-1 rounded-full bg-surface-hover text-ink-subtle ring-1 ring-border ring-inset',
            size === 'md' ? 'size-11 [&_svg:not([class*=size-])]:size-5' : 'size-9',
          )}
        >
          {icon ?? <Inbox />}
        </EmptyMedia>
        <EmptyTitle
          className={cn('text-ink', size === 'md' ? 'text-sm' : 'text-xs')}
          {...(headingLevel === false
            ? {}
            : { role: 'heading' as const, 'aria-level': headingLevel })}
        >
          {title}
        </EmptyTitle>
        {body && (
          <EmptyDescription className="text-xs leading-relaxed text-ink-muted">
            {body}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {action && <EmptyContent className="mt-1 flex-row justify-center">{action}</EmptyContent>}
    </Empty>
  );
}
