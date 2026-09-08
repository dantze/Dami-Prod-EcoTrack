/**
 * Every cross-cutting provider the UI needs, in the one order they work in.
 *
 * Outside in:
 *   ThemeProvider     owns light/dark and writes `.dark` + Mantine's attribute
 *   MantineProvider   forced to the resolved scheme — it never manages its own
 *   DatesProvider     Romanian locale for every Mantine calendar
 *   DirectionProvider shadcn's LTR/RTL context (LTR here, but Radix wants it)
 *   TooltipProvider   one delay/skip-delay group for the whole app, so moving
 *                     between toolbar buttons shows tooltips instantly
 *   FeedbackHost      the kit's confirm dialog — `useConfirm()` needs a host
 *                     that outlives the screen that asked the question
 *   Sonner            shadcn's toast host — the UI kit's `toast()` funnels here
 *
 * **One toast system and one modal system, and both are shadcn's.**
 * `ModalsProvider` and Mantine's `Notifications` host used to be mounted here
 * and nothing ever filled them — no `modals.open`, no `notifications.show`
 * anywhere in `src/` (TODO-82). Two live providers rendering empty containers
 * read, reasonably, as "this app has two of each". Dialogs are the kit's
 * `Modal`/`Drawer` over shadcn's; toasts are Sonner's, through `toast()` in
 * `components/ui/feedback.tsx`. Do not reintroduce either without a caller.
 *
 * Kept out of main.tsx so tests can mount the same stack around a screen.
 */

import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import 'dayjs/locale/ro';
import { DirectionProvider } from '@/components/shadcn/direction';
import { TooltipProvider } from '@/components/shadcn/tooltip';
import { Toaster } from '@/components/shadcn/sonner';
import { FeedbackHost } from '@/components/ui/feedback';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { cssVariablesResolver, mantineTheme } from './mantine';

function Themed({ children }: { children: ReactNode }) {
  const { scheme } = useTheme();

  return (
    <MantineProvider
      theme={mantineTheme}
      cssVariablesResolver={cssVariablesResolver}
      forceColorScheme={scheme}
      // The class/attribute are already on <html> by the time this mounts
      // (ThemeProvider's effect plus the pre-paint script in index.html), so
      // Mantine must not fight for the same attribute.
      getRootElement={() => document.documentElement}
    >
      {/* Romanian dates app-wide. dayjs.locale('ro') in the kit's DateInput
          sets the GLOBAL dayjs locale, which is not where Mantine reads from —
          its calendars take the locale from this provider, so without it every
          date popup said "September 2026" and "Mo Tu We" inside an otherwise
          Romanian app. Monday-first and a Sat/Sun weekend live here too, so a
          new date field cannot forget them. */}
      <DatesProvider settings={{ locale: 'ro', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
        <DirectionProvider dir="ltr">
          <TooltipProvider delayDuration={400} skipDelayDuration={200}>
            {children}
            {/* The kit's confirm dialog. One host for the whole app: a promise
                returned by `useConfirm()` has to be answered by something that
                is always mounted, whatever screen asked. */}
            <FeedbackHost />
            <Toaster />
          </TooltipProvider>
        </DirectionProvider>
      </DatesProvider>
    </MantineProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Themed>{children}</Themed>
    </ThemeProvider>
  );
}
