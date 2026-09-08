import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The dispatch board suggests NOTHING (TODO-16).
 *
 * Two heuristics used to sit above the stop list — "Grupare sugerată", which
 * proposed unassigned jobs to add to a route, and "Ordine mai scurtă a
 * opririlor", which proposed a shorter driving sequence. Both are gone, along
 * with the code behind them.
 *
 * This is a source-level tripwire rather than a rendering test because the
 * first removal was incomplete: the group card went and the stop-order card
 * stayed, and it was still on screen months later. Catching the VOCABULARY
 * catches a reintroduction under a new component name, which is how it would
 * come back.
 *
 * Scoped to `src/features/technical`, deliberately. Comenzi has its own
 * suggestions (`features/sales/suggestions.ts` — order autofill from the
 * client's own history) and those are wanted; this rule is about routes.
 */
const BANNED = ['suggest', 'sugerat', 'sugestie', 'recomand', 'SuggestionCard'];

/**
 * Comments are stripped first: the files that removed this feature explain what
 * they removed, and banning the history would force those notes out of the
 * code. Only block comments and whole comment lines go, so a line of real code
 * is never mangled.
 */
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !/^\s*(\/\/|\*)/.test(line))
    .join('\n');
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === '__tests__' ? [] : sourceFiles(full);
    }
    return /\.tsx?$/.test(entry) ? [full] : [];
  });
}

describe('the dispatch board makes no suggestions', () => {
  it('nothing under features/technical proposes work or an order', () => {
    const offenders = sourceFiles('src/features/technical').flatMap((file) => {
      const source = withoutComments(readFileSync(file, 'utf8')).toLowerCase();
      return BANNED.filter((word) => source.includes(word.toLowerCase())).map(
        (word) => `${file}: ${word}`,
      );
    });

    expect(offenders).toEqual([]);
  });

  it('grouping.ts exports only the distance helper the map needs', async () => {
    const grouping = await import('../grouping');
    expect(Object.keys(grouping).sort()).toEqual(['distanceKm']);
  });
});
