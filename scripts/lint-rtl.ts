/**
 * Fails when src/ uses physical-direction Tailwind classes or CSS properties.
 * NGP apps are RTL first, so layout uses logical ones: ms-, me-, ps-, pe-, start-, end-,
 * text-start, border-s, rounded-s... (ngp-react §6, ngp-general §9).
 *
 * Run: npm run lint:rtl
 * Escape hatch: a line containing `lint-rtl-ignore` is skipped; say why in the same comment.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const sourceDir = 'src';
const scannedExtensions = new Set(['.ts', '.tsx', '.css']);
const ignoreMarker = 'lint-rtl-ignore';

type Rule = { pattern: RegExp; useInstead: string };
type Problem = { file: string; line: number; column: number; found: string; useInstead: string };

/** Physical Tailwind class (or class prefix ending in `-`) and its logical replacement. */
const physicalClasses: [physical: string, logical: string][] = [
  ['ml-', 'ms-'],
  ['mr-', 'me-'],
  ['pl-', 'ps-'],
  ['pr-', 'pe-'],
  ['left-', 'start-'],
  ['right-', 'end-'],
  ['scroll-ml-', 'scroll-ms-'],
  ['scroll-mr-', 'scroll-me-'],
  ['scroll-pl-', 'scroll-ps-'],
  ['scroll-pr-', 'scroll-pe-'],
  ['border-l', 'border-s'],
  ['border-r', 'border-e'],
  ['rounded-l', 'rounded-s'],
  ['rounded-r', 'rounded-e'],
  ['rounded-tl', 'rounded-ss'],
  ['rounded-tr', 'rounded-se'],
  ['rounded-bl', 'rounded-es'],
  ['rounded-br', 'rounded-ee'],
  ['text-left', 'text-start'],
  ['text-right', 'text-end'],
  ['float-left', 'float-start'],
  ['float-right', 'float-end'],
  ['clear-left', 'clear-start'],
  ['clear-right', 'clear-end'],
];

// A class starts after a space, quote, backtick, `:` (variant, `md:ml-2`) or `!` (important), and
// may be negative (`-ml-2`). A prefix ending in `-` matches any value; a full name must end there
// or continue with `-` (`border-l-2`), so `border-line` and `rounded-lg` are fine.
const classRules: Rule[] = physicalClasses.map(([physical, logical]) => ({
  pattern: new RegExp(`(?<![\\w-])-?${physical}${physical.endsWith('-') ? '' : '(?!\\w)'}`, 'g'),
  useInstead: logical,
}));

const cssRules: Rule[] = [
  {
    pattern: /(?<![\w-])(?:margin|padding|border|scroll-margin|scroll-padding)-(?:left|right)\b/g,
    useInstead: '*-inline-start / *-inline-end',
  },
  { pattern: /(?<![\w-])(?:left|right)\s*:/g, useInstead: 'inset-inline-start / inset-inline-end' },
  { pattern: /(?:text-align|float|clear)\s*:\s*(?:left|right)\b/g, useInstead: 'start / end' },
];

function listSourceFiles(): string[] {
  return readdirSync(sourceDir, { recursive: true, encoding: 'utf8' })
    .map((path) => join(sourceDir, path).replaceAll('\\', '/'))
    .filter((path) => scannedExtensions.has(extname(path)) && !path.endsWith('.d.ts'));
}

function findProblems(file: string): Problem[] {
  const rules = file.endsWith('.css') ? [...classRules, ...cssRules] : classRules;
  const lines = readFileSync(file, 'utf8').split('\n');

  return lines
    .flatMap((text, index) => {
      if (text.includes(ignoreMarker)) return [];
      return rules.flatMap((rule) =>
        [...text.matchAll(rule.pattern)].map((match) => ({
          file,
          line: index + 1,
          column: match.index + 1,
          found: match[0],
          useInstead: rule.useInstead,
        })),
      );
    })
    .sort((a, b) => a.line - b.line || a.column - b.column);
}

const problems = listSourceFiles().flatMap(findProblems);

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(
      `${problem.file}:${problem.line}:${problem.column}  "${problem.found}" -> use ${problem.useInstead}`,
    );
  }
  console.error(
    `\nlint:rtl: ${problems.length} physical-direction class(es) found. Use logical ones.`,
  );
  process.exit(1);
}

console.log('lint:rtl: no physical-direction classes found.');
