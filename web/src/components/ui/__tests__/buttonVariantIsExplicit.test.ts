import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Every `<Button>` outside the kit names its variant.
 *
 * `Button` defaults to `secondary`, which is right roughly forty times out of
 * forty-one — most buttons in a dense app are secondary — and silently wrong the
 * one time it matters. `AccessRequestsPage`'s **Aprobă**, the single action that
 * screen exists for, drew as a quiet bordered button beside a ghost **Respinge**
 * because nobody passed a variant (TODO-83). Nothing was broken; the screen just
 * had no primary action and no reviewer noticed.
 *
 * A scan cannot answer "is this the primary action". It can insist the question
 * was ASKED, which is what this does: pass `variant="secondary"` explicitly when
 * that is the intent. The default stays, because the kit's contract is frozen
 * and making `variant` required would touch every call site — the cost lands on
 * new code only.
 *
 * A second variant-less primary was found by writing this: the "Mută N comenzi"
 * button in `SubscriptionUsageModal`, the only control in the section and the
 * only button in the modal.
 */
const ROOTS = ['src/features', 'src/components/layout'];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === '__tests__' ? [] : sourceFiles(full);
    }
    return /\.tsx$/.test(entry) ? [full] : [];
  });
}

/**
 * The props of every `<Button …>` opening tag in the source.
 *
 * Hand-scanned rather than regexed because a prop can itself contain `>`:
 * `icon={<MapPin aria-hidden />}` ends the tag early for any `[^>]*` pattern,
 * which would report a Button whose `variant` sits after the icon as missing
 * one. Brace depth is tracked so only a `>` at depth zero closes the tag.
 */
function buttonTags(source: string): { props: string; line: number }[] {
  const tags: { props: string; line: number }[] = [];
  const opening = /<Button\b/g;
  let match: RegExpExecArray | null;

  while ((match = opening.exec(source)) !== null) {
    let depth = 0;
    let index = match.index + match[0].length;
    for (; index < source.length; index += 1) {
      const char = source[index];
      if (char === '{') depth += 1;
      else if (char === '}') depth -= 1;
      else if (char === '>' && depth === 0) break;
    }
    tags.push({
      props: source.slice(match.index + match[0].length, index),
      line: source.slice(0, match.index).split('\n').length,
    });
  }

  return tags;
}

describe('Button variants are explicit outside the kit', () => {
  it('no feature or layout component relies on the default', () => {
    const offenders = ROOTS.flatMap(sourceFiles).flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return buttonTags(source)
        .filter((tag) => !/\bvariant\s*=/.test(tag.props))
        .map((tag) => `${file}:${tag.line}`);
    });

    expect(offenders).toEqual([]);
  });

  it('the scanner is not fooled by a prop containing ">"', () => {
    const withIconThenVariant = '<Button icon={<Pin aria-hidden />} variant="secondary">x</Button>';
    expect(buttonTags(withIconThenVariant)[0]!.props).toContain('variant=');

    const withIconOnly = '<Button icon={<Pin aria-hidden />} onClick={go}>x</Button>';
    expect(buttonTags(withIconOnly)[0]!.props).not.toContain('variant=');
  });
});
