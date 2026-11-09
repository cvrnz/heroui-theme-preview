import {Button} from '@heroui/react';
import {Check, Copy, Moon, RotateCcw, Sun, Undo2} from 'lucide-react';
import {useEffect, useLayoutEffect, useState} from 'react';
import {DemoPage} from '@/components/DemoPage';
import {Gallery} from '@/components/Gallery';
import {
  DEFAULT_THEME,
  type Mode,
  PRESETS,
  type Theme,
  TOKEN_GROUPS,
  cssToTheme,
  isColor,
  resolveVars,
  themeStyle,
  themeToCss,
  toHex,
} from '@/theme';

const STORAGE_KEY = 'heroui-theme-preview:v2';

type View = 'page' | 'components';

function loadSaved(): {theme: Theme; mode: Mode; view?: View} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- JSON.parse returns any
    return raw ? (JSON.parse(raw) as {theme: Theme; mode: Mode; view?: View}) : null;
  } catch {
    return null;
  }
}

interface TokenRowProps {
  name: string;
  value: string;
  /** The value after var()/color-mix() are resolved, used for the swatch */
  resolved: string;
  modified: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
}

function TokenRow({name, value, resolved, modified, onChange, onReset}: TokenRowProps) {
  return (
    <div className='flex items-center gap-2'>
      {isColor(resolved) ? (
        <input
          type='color'
          value={toHex(resolved)}
          onChange={e => onChange(e.target.value)}
          className='size-7 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5'
          aria-label={`--${name} color picker`}
        />
      ) : (
        <span className='size-7 shrink-0' />
      )}
      <span
        className={`w-40 shrink-0 truncate font-mono text-xs ${modified ? 'text-accent' : 'text-muted'}`}
        title={`--${name}`}
      >
        --{name}
      </span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        title={value}
        aria-label={`--${name} value`}
        className='min-w-0 flex-1 rounded border border-border bg-field px-2 py-1 font-mono text-xs text-field-foreground outline-none focus:border-focus'
      />
      <button
        onClick={onReset}
        disabled={!modified}
        className='shrink-0 text-muted hover:text-foreground disabled:invisible'
        aria-label={`Reset --${name}`}
      >
        <Undo2 className='size-3.5' />
      </button>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useState<Theme>(() => loadSaved()?.theme ?? DEFAULT_THEME);
  const [mode, setMode] = useState<Mode>(() => loadSaved()?.mode ?? 'light');
  const [view, setView] = useState<View>(() => loadSaved()?.view ?? 'page');
  const [panel, setPanel] = useState<'export' | 'import' | null>(null);
  const [importText, setImportText] = useState('');
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({theme, mode, view}));
    } catch {
      // Storage unavailable (private mode); the theme just won't persist
    }
  }, [theme, mode, view]);

  // Theme the whole document: the theme class and every token go on <html>, so HeroUI's calculated
  // tokens follow edits and popovers/modals (rendered at the end of <body>) are themed too
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.className = mode;
    root.removeAttribute('style');
    for (const [name, value] of Object.entries(themeStyle(theme, mode))) {
      if (typeof value === 'string') root.style.setProperty(name, value);
    }
  }, [theme, mode]);

  const tokens = theme.tokens[mode];
  const defaults = DEFAULT_THEME.tokens[mode];

  // Shared tokens (radius, accent, …) are declared once by HeroUI, so edits apply to both modes,
  // unless the theme already gives that token a different value per mode
  const setToken = (name: string, value: string, shared: boolean) =>
    setTheme(t => {
      const both = shared && t.tokens.light[name] === t.tokens.dark[name];
      return {
        ...t,
        tokens: {
          light: both || mode === 'light' ? {...t.tokens.light, [name]: value} : t.tokens.light,
          dark: both || mode === 'dark' ? {...t.tokens.dark, [name]: value} : t.tokens.dark,
        },
      };
    });

  const radius = parseFloat(tokens['radius'] ?? '0.5') || 0;

  const css = themeToCss(theme);
  const query = filter.trim().toLowerCase();
  const groups = TOKEN_GROUPS.map(g => ({
    ...g,
    tokens: g.tokens.filter(t => !query || t.includes(query) || g.label.toLowerCase().includes(query)),
  })).filter(g => g.tokens.length > 0);

  const copyCss = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className='flex h-full flex-col bg-background text-foreground md:flex-row'>
      {theme.customCss && <style>{theme.customCss}</style>}

      {/* ── Editor ── */}
      <aside className='flex min-h-0 shrink-0 flex-col border-b border-border md:w-[26rem] md:border-r md:border-b-0'>
        <div className='flex items-center justify-between gap-2 px-4 pt-4 pb-3'>
          <h1 className='font-semibold'>HeroUI Theme Preview</h1>
          <Button
            variant='ghost'
            size='sm'
            isIconOnly
            onPress={() => setTheme(DEFAULT_THEME)}
            aria-label='Reset to HeroUI default'
          >
            <RotateCcw className='size-4' />
          </Button>
        </div>

        <div className='flex flex-col gap-3 px-4 pb-3'>
          <div className='flex gap-1 rounded-lg bg-default p-1'>
            {(['light', 'dark'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm capitalize transition-colors ${
                  mode === m ? 'bg-segment text-segment-foreground shadow-sm' : 'text-muted hover:text-foreground'
                }`}
              >
                {m === 'light' ? <Sun className='size-3.5' /> : <Moon className='size-3.5' />}
                {m}
              </button>
            ))}
          </div>

          <div className='flex items-center gap-2 text-sm'>
            <span className='text-muted'>Preview</span>
            <div className='flex flex-1 gap-1 rounded-lg bg-default p-1'>
              {(
                [
                  ['page', 'Page'],
                  ['components', 'Components'],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex-1 rounded-md py-1 text-sm transition-colors ${
                    view === v ? 'bg-segment text-segment-foreground shadow-sm' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className='flex items-center gap-2 text-sm'>
            <span className='text-muted'>Preset</span>
            <select
              value=''
              onChange={e => {
                const preset = PRESETS.find(p => p.id === e.target.value);
                if (preset) setTheme(preset.theme());
              }}
              className='flex-1 rounded border border-border bg-field px-2 py-1 text-field-foreground'
            >
              <option
                value=''
                disabled
              >
                Load a preset…
              </option>
              {PRESETS.map(p => (
                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <label className='flex items-center gap-3 text-sm'>
            <span className='text-muted'>Radius</span>
            <input
              type='range'
              min={0}
              max={1.5}
              step={0.125}
              value={radius}
              onChange={e => setToken('radius', `${e.target.value}rem`, true)}
              className='flex-1 accent-accent'
            />
            <span className='w-16 text-right font-mono text-xs'>{radius}rem</span>
          </label>

          <div className='flex gap-2'>
            <Button
              variant='secondary'
              size='sm'
              className='flex-1'
              onPress={() => setPanel(p => (p === 'import' ? null : 'import'))}
            >
              Import CSS
            </Button>
            <Button
              variant='secondary'
              size='sm'
              className='flex-1'
              onPress={() => setPanel(p => (p === 'export' ? null : 'export'))}
            >
              Export CSS
            </Button>
          </div>

          {panel === 'export' && (
            <div className='flex flex-col gap-2'>
              <pre className='max-h-60 overflow-auto rounded border border-border bg-surface p-2 font-mono text-[11px] leading-relaxed'>
                {css}
              </pre>
              <Button
                size='sm'
                onPress={() => void copyCss()}
              >
                {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
                {copied ? 'Copied' : 'Copy to clipboard'}
              </Button>
            </div>
          )}

          {panel === 'import' && (
            <div className='flex flex-col gap-2'>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={'Paste theme CSS, e.g.\n:root { --accent: oklch(…); }\n.dark { --background: #121212; }'}
                spellCheck={false}
                className='h-40 resize-y rounded border border-border bg-field p-2 font-mono text-[11px] text-field-foreground outline-none focus:border-focus'
              />
              <Button
                size='sm'
                isDisabled={!importText.trim()}
                onPress={() => {
                  setTheme(t => cssToTheme(importText, t));
                  setPanel(null);
                  setImportText('');
                }}
              >
                Apply
              </Button>
            </div>
          )}

          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder={`Filter ${TOKEN_GROUPS.reduce((n, g) => n + g.tokens.length, 0)} tokens…`}
            className='rounded border border-border bg-field px-2 py-1.5 text-sm text-field-foreground outline-none focus:border-focus'
          />
        </div>

        <div className='flex min-h-0 flex-col gap-5 overflow-y-auto border-t border-border px-4 py-4 max-md:max-h-[45vh]'>
          {groups.map(group => (
            <div
              key={`${group.shared}-${group.label}`}
              className='flex flex-col gap-2'
            >
              <p className='text-xs font-semibold uppercase tracking-wider text-muted'>
                {group.label} <span className='font-normal normal-case'>({group.shared ? 'both modes' : mode})</span>
              </p>
              {group.tokens.map(name => (
                <TokenRow
                  key={name}
                  name={name}
                  value={tokens[name] ?? ''}
                  resolved={resolveVars(tokens[name] ?? '', tokens)}
                  modified={tokens[name] !== defaults[name]}
                  onChange={value => setToken(name, value, group.shared)}
                  onReset={() => setToken(name, defaults[name] ?? '', group.shared)}
                />
              ))}
            </div>
          ))}

          {!query && (
            <div className='flex flex-col gap-2'>
              <p className='text-xs font-semibold uppercase tracking-wider text-muted'>
                Custom CSS <span className='font-normal normal-case'>(both modes)</span>
              </p>
              <p className='text-xs text-muted'>
                For component-level variables tokens can&apos;t reach, e.g.{' '}
                <code className='font-mono'>.button--primary {'{ --button-bg: … }'}</code>
              </p>
              <textarea
                value={theme.customCss}
                onChange={e => setTheme(t => ({...t, customCss: e.target.value}))}
                spellCheck={false}
                className='h-48 resize-y rounded border border-border bg-field p-2 font-mono text-[11px] text-field-foreground outline-none focus:border-focus'
              />
            </div>
          )}
        </div>
      </aside>

      {/* ── Preview ── */}
      <main className='min-h-0 flex-1 overflow-y-auto'>{view === 'page' ? <DemoPage /> : <Gallery />}</main>
    </div>
  );
}
