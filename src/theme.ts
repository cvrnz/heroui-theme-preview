import type React from 'react';
import variablesCss from '@heroui/styles/themes/default/variables.css?raw';

export type Mode = 'light' | 'dark';

export interface TokenGroup {
  label: string;
  /** True for tokens HeroUI declares once on :root for both modes */
  shared: boolean;
  tokens: string[];
}

export interface Theme {
  /** Every HeroUI theme token, per mode. Values are raw CSS, so calculated tokens keep their formulas. */
  tokens: Record<Mode, Record<string, string>>;
  /** Extra rules for things tokens can't reach, e.g. component-level variables like --button-bg */
  customCss: string;
}

// Lets inline styles set CSS custom properties without a cast
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | undefined;
  }
}

// ─── Parsing CSS ─────────────────────────────────────────────────────────────

type Scope = 'shared' | Mode;

interface CssBlock {
  selector: string;
  body: string;
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Innermost `selector { body }` blocks; wrappers like `@layer base { … }` are skipped. */
function cssBlocks(css: string): CssBlock[] {
  return [...css.matchAll(/([^{}]*)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selector: stripComments(selector).trim(),
    body,
  }));
}

function selectorScope(selector: string): Scope | null {
  if (/dark/.test(selector)) return 'dark';
  if (/light|default/.test(selector)) return 'light';
  if (/^:root(\s*,\s*:host)?$/.test(selector)) return 'shared';
  return null;
}

/** Declarations in a block body; values may span lines and trailing comments are dropped. */
function declarations(body: string): [string, string][] {
  return [...stripComments(body).matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [
    name,
    value.replace(/\s+/g, ' ').trim(),
  ]);
}

/** Group label from a section comment like "Surface: Used for…" or "Primitive Colors (Do not…)" */
const groupLabel = (comment: string) =>
  comment
    .split(/[:(]/)[0]
    .replace(/^[\s=]+|[\s=]+$/g, '')
    .trim();

/** Groups tokens by the section comments that precede them in HeroUI's variables.css. */
function parseGroups(body: string, shared: boolean): TokenGroup[] {
  const groups: TokenGroup[] = [];
  let current: TokenGroup | null = null;
  let lastEnd = 0;
  for (const m of body.matchAll(/\/\*([\s\S]*?)\*\/|--([\w-]+)\s*:[^;]*;/g)) {
    const [, comment, name] = m;
    if (comment !== undefined) {
      // Skip comments on the same line as a declaration (they describe that value)
      const onDeclarationLine = !body.slice(lastEnd, m.index).includes('\n') && lastEnd > 0;
      const label = groupLabel(comment);
      if (!onDeclarationLine && label && !/theme|variables/i.test(label)) {
        current = {label, shared, tokens: []};
        groups.push(current);
      }
    } else if (name) {
      if (!current) {
        current = {label: 'Other', shared, tokens: []};
        groups.push(current);
      }
      current.tokens.push(name);
    }
    lastEnd = m.index + m[0].length;
  }
  return groups.filter(g => g.tokens.length > 0);
}

// ─── HeroUI defaults ─────────────────────────────────────────────────────────

const heroBlocks = cssBlocks(variablesCss);
const sharedBlock = heroBlocks.find(b => selectorScope(b.selector) === 'shared');
const lightBlock = heroBlocks.find(b => selectorScope(b.selector) === 'light');
const darkBlock = heroBlocks.find(b => selectorScope(b.selector) === 'dark');

const sharedDefaults = Object.fromEntries(declarations(sharedBlock?.body ?? ''));

/** Every token HeroUI defines, grouped: shared groups first, then the per-mode groups. */
export const TOKEN_GROUPS: TokenGroup[] = [
  ...parseGroups(sharedBlock?.body ?? '', true),
  ...parseGroups(lightBlock?.body ?? '', false),
];

// Tokens only declared in the dark block go in their own group so nothing is hidden
const listed = new Set(TOKEN_GROUPS.flatMap(g => g.tokens));
const darkOnly = declarations(darkBlock?.body ?? '')
  .map(([name]) => name)
  .filter(name => !listed.has(name));
if (darkOnly.length > 0) TOKEN_GROUPS.push({label: 'Dark only', shared: false, tokens: darkOnly});

const SHARED_TOKENS = new Set(Object.keys(sharedDefaults));
const ALL_TOKENS = new Set(TOKEN_GROUPS.flatMap(g => g.tokens));

export const DEFAULT_THEME: Theme = {
  tokens: {
    light: {...sharedDefaults, ...Object.fromEntries(declarations(lightBlock?.body ?? ''))},
    dark: {...sharedDefaults, ...Object.fromEntries(declarations(darkBlock?.body ?? ''))},
  },
  customCss: '',
};

// ─── Applying, exporting, importing ──────────────────────────────────────────

/** Inline style that applies the theme; put it on the element that has the `light`/`dark` class. */
export function themeStyle(theme: Theme, mode: Mode): React.CSSProperties {
  const style: React.CSSProperties = {};
  for (const [name, value] of Object.entries(theme.tokens[mode])) {
    style[`--${name}`] = value;
  }
  return style;
}

const block = (selector: string, vars: Record<string, string>) =>
  `${selector} {\n${Object.entries(vars)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n')}\n}`;

/** CSS for the tokens that differ from HeroUI's defaults, plus any custom CSS. */
export function themeToCss(theme: Theme): string {
  const shared: Record<string, string> = {};
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};
  for (const name of ALL_TOKENS) {
    const l = theme.tokens.light[name];
    const d = theme.tokens.dark[name];
    const lChanged = l !== undefined && l !== DEFAULT_THEME.tokens.light[name];
    const dChanged = d !== undefined && d !== DEFAULT_THEME.tokens.dark[name];
    // A shared token changed identically in both modes stays shared
    if (SHARED_TOKENS.has(name) && l === d && lChanged) {
      shared[name] = l;
      continue;
    }
    if (lChanged) light[name] = l;
    if (dChanged) dark[name] = d;
  }
  const parts = [];
  if (Object.keys(shared).length) parts.push(block(':root', shared));
  if (Object.keys(light).length) {
    parts.push(block(":root,\n.light,\n.default,\n[data-theme='light'],\n[data-theme='default']", light));
  }
  if (Object.keys(dark).length) parts.push(block(".dark,\n[data-theme='dark']", dark));
  if (theme.customCss.trim()) parts.push(theme.customCss.trim());
  return parts.join('\n\n') || '/* Same as the HeroUI default theme */';
}

/**
 * Applies pasted CSS on top of `base`: light/dark blocks set that mode, a plain :root block sets
 * both, and any other rule is kept as custom CSS.
 */
/** Moves top-level at-rule blocks (@layer, @media, …) into `out` verbatim and returns the rest. */
function extractAtRules(css: string, out: string[]): string {
  let rest = '';
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf('@', i);
    const open = at === -1 ? -1 : css.indexOf('{', at);
    if (open === -1) break;
    let depth = 1;
    let end = open + 1;
    for (; end < css.length && depth > 0; end++) {
      if (css[end] === '{') depth++;
      else if (css[end] === '}') depth--;
    }
    rest += css.slice(i, at);
    out.push(css.slice(at, end).trim());
    i = end;
  }
  return rest + css.slice(i);
}

export function cssToTheme(css: string, base: Theme): Theme {
  const next: Theme = {
    tokens: {light: {...base.tokens.light}, dark: {...base.tokens.dark}},
    customCss: '',
  };
  const custom: string[] = [];
  // Comments are dropped first so an `@import` or brace inside one isn't read as a rule
  for (const {selector, body} of cssBlocks(extractAtRules(stripComments(css), custom))) {
    const scope = selectorScope(selector);
    if (!scope) {
      if (selector) custom.push(`${selector} {${body}}`);
      continue;
    }
    for (const [name, value] of declarations(body)) {
      if (scope !== 'dark') next.tokens.light[name] = value;
      if (scope !== 'light') next.tokens.dark[name] = value;
    }
  }
  next.customCss = custom.join('\n\n');
  return next;
}

// ─── Colors ──────────────────────────────────────────────────────────────────

let canvasContext: CanvasRenderingContext2D | null = null;

/** Converts any CSS color to #rrggbb for the native color picker (alpha is dropped). */
export function toHex(color: string): string {
  canvasContext ??= document.createElement('canvas').getContext('2d', {willReadFrequently: true});
  const ctx = canvasContext;
  if (!ctx) return '#000000';
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000000';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')}`;
}

export const isColor = (value: string) => value !== '' && CSS.supports('color', value);

/** Replaces var(--x) references with token values (recursively) so a value can be checked or drawn. */
export function resolveVars(value: string, tokens: Record<string, string>, depth = 0): string {
  if (depth > 10) return value;
  return value.replace(
    /var\(\s*--([\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))*[^()]*))?\)/g,
    (match, name: string, fallback?: string) => {
      const next = tokens[name] ?? fallback;
      return next === undefined ? match : resolveVars(next, tokens, depth + 1);
    },
  );
}

// ─── Presets ─────────────────────────────────────────────────────────────────

/** The theme used by the photos and music apps */
const JELLYFIN_THEME_CSS = `
:root { --radius: 0.125rem; --field-radius: 0.25rem; }
:root, .light {
  --accent: oklch(53.28% 0.1507 256.68);
  --accent-foreground: oklch(99.11% 0 0);
  --background: oklch(97.02% 0 256.68);
  --border: oklch(90% 0 256.68);
  --danger: oklch(65.32% 0.2328 26.08);
  --danger-foreground: oklch(99.11% 0 0);
  --default: oklch(94% 0 256.68);
  --default-foreground: oklch(21.03% 0.0059 256.68);
  --field-background: oklch(100% 0 256.68);
  --field-foreground: oklch(21.03% 0 256.68);
  --field-placeholder: oklch(55.17% 0 256.68);
  --focus: oklch(53.28% 0.1507 256.68);
  --foreground: oklch(21.03% 0 256.68);
  --muted: oklch(55.17% 0 256.68);
  --overlay: oklch(100% 0 256.68);
  --overlay-foreground: oklch(21.03% 0 256.68);
  --scrollbar: oklch(87.1% 0 256.68);
  --segment: oklch(100% 0 256.68);
  --segment-foreground: oklch(21.03% 0 256.68);
  --separator: oklch(92% 0 256.68);
  --success: oklch(73.29% 0.1935 151.15);
  --success-foreground: oklch(21.03% 0.0059 151.15);
  --surface: oklch(100% 0 256.68);
  --surface-foreground: oklch(21.03% 0 256.68);
  --surface-secondary: oklch(95.24% 0 256.68);
  --surface-secondary-foreground: oklch(21.03% 0 256.68);
  --surface-tertiary: oklch(93.73% 0 256.68);
  --surface-tertiary-foreground: oklch(21.03% 0 256.68);
  --warning: oklch(78.19% 0.1585 72.67);
  --warning-foreground: oklch(21.03% 0.0059 72.67);
}
.dark {
  --accent: oklch(53.28% 0.1507 256.68);
  --accent-foreground: oklch(99.11% 0 0);
  --background: #121212;
  --border: oklch(28% 0 256.68);
  --danger: oklch(59.4% 0.1967 24.97);
  --danger-foreground: oklch(99.11% 0 0);
  --default: oklch(27.4% 0 256.68);
  --default-foreground: oklch(99.11% 0 0);
  --field-background: oklch(21.03% 0 256.68);
  --field-foreground: oklch(99.11% 0 256.68);
  --field-placeholder: oklch(70.5% 0 256.68);
  --focus: oklch(53.28% 0.1507 256.68);
  --foreground: oklch(99.11% 0 256.68);
  --muted: oklch(70.5% 0 256.68);
  --overlay: oklch(21.03% 0 256.68);
  --overlay-foreground: oklch(99.11% 0 256.68);
  --scrollbar: oklch(70.5% 0 256.68);
  --segment: oklch(39.64% 0 256.68);
  --segment-foreground: oklch(99.11% 0 256.68);
  --separator: oklch(25% 0 256.68);
  --success: oklch(73.29% 0.1935 151.15);
  --success-foreground: oklch(21.03% 0.0059 151.15);
  --surface: oklch(21.03% 0 256.68);
  --surface-foreground: oklch(99.11% 0 256.68);
  --surface-secondary: oklch(25.7% 0 256.68);
  --surface-secondary-foreground: oklch(99.11% 0 256.68);
  --surface-tertiary: oklch(27.21% 0 256.68);
  --surface-tertiary-foreground: oklch(99.11% 0 256.68);
  --warning: oklch(82.03% 0.1388 76.68);
  --warning-foreground: oklch(21.03% 0.0059 72.67);
}
`;

// Every intent color uses the same lightness and chroma per mode; only the hue changes,
// so no color reads as more pastel or more saturated than the others
const INTENT_HUES = {accent: 262, success: 152, warning: 70, danger: 25};
const INTENT_TONE: Record<Mode, {l: number; c: number; fg: string}> = {
  // White text on light mode fills, dark text on dark mode fills
  light: {l: 0.58, c: 0.13, fg: 'var(--snow)'},
  dark: {l: 0.72, c: 0.12, fg: 'var(--eclipse)'},
};
// Soft fills/text mix every intent the same way (HeroUI's defaults differ per color)
const SOFT_MIX: Record<Mode, {bg: number; hover: number; fg: number}> = {
  light: {bg: 16, hover: 22, fg: 78},
  dark: {bg: 18, hover: 24, fg: 82},
};

function intentTokens(mode: Mode): string {
  const {l, c, fg} = INTENT_TONE[mode];
  const mix = SOFT_MIX[mode];
  return Object.entries(INTENT_HUES)
    .flatMap(([name, hue]) => [
      `  --${name}: oklch(${l} ${c} ${hue});`,
      `  --${name}-foreground: ${fg};`,
      `  --${name}-soft: color-mix(in oklab, var(--${name}) ${mix.bg}%, transparent);`,
      `  --${name}-soft-hover: color-mix(in oklab, var(--${name}) ${mix.hover}%, transparent);`,
      `  --${name}-soft-foreground: color-mix(in oklab, var(--${name}) ${mix.fg}%, var(--foreground));`,
    ])
    .join('\n');
}

/**
 * Accent-as-ink: buttons keep the neutral "default" background, and the accent color moves to
 * their text and a 1px outline. Secondary and outline buttons use accent text too.
 */
const OUTLINE_ACCENT_THEME_CSS = `
.light {
${intentTokens('light')}
}
.dark {
${intentTokens('dark')}
}
.button--primary {
  --button-bg: var(--default);
  --button-bg-hover: var(--default-hover);
  --button-bg-pressed: var(--default-hover);
  --button-fg: var(--accent);
  border: 1px solid var(--accent);
}
.button--secondary,
.button--outline {
  --button-fg: var(--accent);
}
.button--outline {
  border-color: color-mix(in oklab, var(--accent) 45%, transparent);
}
`;

/**
 * HeroUI default with tighter rounding and a lighter dark mode. Dark surfaces step up in even
 * lightness increments (page → card → controls → raised), so cards, fields and buttons separate
 * clearly from the page and from each other. Light mode is unchanged.
 */
const DEFAULT_BRIGHTER_DARK_CSS = `
:root {
  --radius: 0.25rem;
}
.dark {
  --background: oklch(0.23 0.006 286);
  --surface: oklch(0.29 0.006 286);
  --surface-secondary: oklch(0.33 0.006 286);
  --surface-tertiary: oklch(0.37 0.006 286);
  --overlay: oklch(0.32 0.006 286);
  --default: oklch(0.38 0.006 286);
  --segment: oklch(0.5 0.008 286);
  --field-background: oklch(0.35 0.006 286);
  --border: oklch(0.4 0.006 286);
  --separator: oklch(0.36 0.006 286);
  --muted: oklch(0.76 0.012 286);
  --surface-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.25);
  --overlay-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.35), 0 0 1px 0 rgba(255, 255, 255, 0.25) inset;
}
`;

/**
 * Inspired by shadcn/ui's neutral theme: monochrome surfaces, a near-black (light) / near-white
 * (dark) primary, hairline borders and medium rounding. Colors are shadcn's neutral palette mapped
 * onto HeroUI tokens (card → surface, popover → overlay, secondary → default, input → field-border,
 * ring → focus). Borders on cards and popovers are drawn as a 1px ring in the shadow tokens.
 */
const SHADCN_THEME_CSS = `
:root {
  --radius: 0.625rem;
  --field-radius: calc(var(--radius) - 2px);
  --field-border-width: 1px;
}
.light {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --surface: oklch(1 0 0);
  --surface-secondary: oklch(0.97 0 0);
  --surface-tertiary: oklch(0.94 0 0);
  --overlay: oklch(1 0 0);
  --muted: oklch(0.556 0 0);
  --default: oklch(0.97 0 0);
  --default-foreground: oklch(0.205 0 0);
  --segment: oklch(1 0 0);
  --field-background: oklch(1 0 0);
  --field-foreground: oklch(0.145 0 0);
  --field-border: oklch(0.922 0 0);
  --border: oklch(0.922 0 0);
  --separator: oklch(0.922 0 0);
  --focus: oklch(0.708 0 0);
  --accent: oklch(0.205 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --success: oklch(0.6 0.13 150);
  --success-foreground: oklch(0.985 0 0);
  --warning: oklch(0.75 0.15 75);
  --warning-foreground: oklch(0.205 0 0);
  --danger: oklch(0.577 0.245 27.325);
  --danger-foreground: oklch(0.985 0 0);
  --surface-shadow: 0 0 0 1px var(--border), 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --overlay-shadow: 0 0 0 1px var(--border), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --field-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --surface: oklch(0.205 0 0);
  --surface-secondary: oklch(0.269 0 0);
  --surface-tertiary: oklch(0.3 0 0);
  --overlay: oklch(0.205 0 0);
  --muted: oklch(0.708 0 0);
  --default: oklch(0.269 0 0);
  --default-foreground: oklch(0.985 0 0);
  --segment: oklch(0.33 0 0);
  --field-background: oklch(1 0 0 / 0.045);
  --field-foreground: oklch(0.985 0 0);
  --field-border: oklch(1 0 0 / 0.15);
  --border: oklch(1 0 0 / 0.1);
  --separator: oklch(1 0 0 / 0.1);
  --focus: oklch(0.556 0 0);
  --accent: oklch(0.922 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --success: oklch(0.7 0.13 150);
  --success-foreground: oklch(0.145 0 0);
  --warning: oklch(0.8 0.14 75);
  --warning-foreground: oklch(0.145 0 0);
  --danger: oklch(0.704 0.191 22.216);
  --danger-foreground: oklch(0.985 0 0);
  --surface-shadow: 0 0 0 1px var(--border);
  --overlay-shadow: 0 0 0 1px var(--border), 0 4px 6px -1px rgb(0 0 0 / 0.3);
  --field-shadow: 0 0 0 0 transparent inset;
}
/* shadcn shapes: cards and alerts rounded-xl, popovers rounded-md */
.card,
.alert {
  --radius-3xl: calc(var(--radius) + 4px);
}
.popover {
  --radius-3xl: calc(var(--radius) - 2px);
}
/* HeroUI's pill buttons, chips and tabs become rounded-md. Kept in the components layer so
   HeroUI's own grouped/variant rules (e.g. square inner corners in a button group) still win. */
@layer components {
  .button,
  .toggle-button,
  .button-group,
  .toggle-button-group,
  .tabs__tab,
  .tabs__indicator {
    border-radius: calc(var(--radius) - 2px);
  }
  .button-group--horizontal .button:first-child,
  .toggle-button-group--horizontal .toggle-button:first-child {
    border-start-start-radius: calc(var(--radius) - 2px);
    border-end-start-radius: calc(var(--radius) - 2px);
  }
  .button-group--horizontal .button:last-child,
  .toggle-button-group--horizontal .toggle-button:last-child {
    border-start-end-radius: calc(var(--radius) - 2px);
    border-end-end-radius: calc(var(--radius) - 2px);
  }
  .button-group--vertical .button:first-child,
  .toggle-button-group--vertical .toggle-button:first-child {
    border-top-left-radius: calc(var(--radius) - 2px);
    border-top-right-radius: calc(var(--radius) - 2px);
  }
  .button-group--vertical .button:last-child,
  .toggle-button-group--vertical .toggle-button:last-child {
    border-bottom-left-radius: calc(var(--radius) - 2px);
    border-bottom-right-radius: calc(var(--radius) - 2px);
  }
  .tabs__list-container {
    border-radius: var(--radius);
  }
  .chip {
    border-radius: calc(var(--radius) - 4px);
  }
}
`;

/**
 * The shadcn-inspired theme with shadcn's blue primary and a #111111 dark background. Cards and
 * other surfaces are raised to stay lighter than that background. Later blocks override earlier ones.
 */
const SHADCN_BLUE_THEME_CSS = `${SHADCN_THEME_CSS}
.light {
  --accent: oklch(0.546 0.215 262.9);
  --accent-foreground: oklch(0.985 0 0);
  --focus: oklch(0.623 0.19 259.8);
}
.dark {
  --background: #111111;
  --surface: oklch(0.228 0 0);
  --surface-secondary: oklch(0.28 0 0);
  --surface-tertiary: oklch(0.31 0 0);
  --overlay: oklch(0.228 0 0);
  --default: oklch(0.28 0 0);
  --segment: oklch(0.35 0 0);
  --accent: oklch(0.623 0.19 259.8);
  --accent-foreground: oklch(0.985 0 0);
  --focus: oklch(0.546 0.215 262.9);
}
`;

export const PRESETS: {id: string; label: string; theme: () => Theme}[] = [
  {id: 'default', label: 'HeroUI default', theme: () => DEFAULT_THEME},
  {id: 'jellyfin', label: 'Photos / Music apps', theme: () => cssToTheme(JELLYFIN_THEME_CSS, DEFAULT_THEME)},
  {id: 'outline-accent', label: 'Outline accent', theme: () => cssToTheme(OUTLINE_ACCENT_THEME_CSS, DEFAULT_THEME)},
  {
    id: 'brighter-dark',
    label: 'Default, brighter dark',
    theme: () => cssToTheme(DEFAULT_BRIGHTER_DARK_CSS, DEFAULT_THEME),
  },
  {id: 'shadcn', label: 'shadcn-inspired', theme: () => cssToTheme(SHADCN_THEME_CSS, DEFAULT_THEME)},
  {id: 'shadcn-blue', label: 'shadcn-inspired, blue', theme: () => cssToTheme(SHADCN_BLUE_THEME_CSS, DEFAULT_THEME)},
];
