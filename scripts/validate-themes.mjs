import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'orca-plugin.json'), 'utf8'));
// Orca 1.4.244 document-theme renderer validates every one of these pairs.
export const textPairs = [
  ['background', 'foreground'], ['background', 'muted-foreground'],
  ['editor-surface', 'foreground'], ['editor-surface', 'muted-foreground'],
  ['card', 'card-foreground'], ['popover', 'popover-foreground'],
  ['primary', 'primary-foreground'], ['secondary', 'secondary-foreground'],
  ['muted', 'muted-foreground'], ['accent', 'accent-foreground'],
  ['sidebar', 'sidebar-foreground'], ['sidebar-primary', 'sidebar-primary-foreground'],
  ['sidebar-accent', 'sidebar-accent-foreground'],
  ['worktree-sidebar', 'worktree-sidebar-foreground'],
  ['worktree-sidebar-accent', 'worktree-sidebar-accent-foreground']
];
const rings = [['ring', 'background'], ['sidebar-ring', 'sidebar'], ['worktree-sidebar-ring', 'worktree-sidebar']];
export const tokens = ['background', 'editor-surface', 'foreground', 'card', 'card-foreground',
  'popover', 'popover-foreground', 'primary', 'primary-foreground', 'secondary',
  'secondary-foreground', 'muted', 'muted-foreground', 'accent', 'accent-foreground',
  'border', 'input', 'ring', 'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
  'worktree-sidebar', 'worktree-sidebar-foreground', 'worktree-sidebar-accent',
  'worktree-sidebar-accent-foreground', 'worktree-sidebar-border', 'worktree-sidebar-ring'].map(k => `--${k}`);
const ansi = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow', 'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite'];
export function rgb(hex) { return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); }
export function luminance(hex) {
  return rgb(hex).map(v => v / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrast(a, b) {
  const [l, h] = [luminance(a), luminance(b)].sort((a, b) => a - b);
  return (h + 0.05) / (l + 0.05);
}
export function load(relative) {
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(root)) throw new Error(`Path escapes the plugin: ${relative}`);
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}
let failures = 0;
function check(ok, message) { if (!ok) { console.error(`FAIL ${message}`); failures++; } }
check(manifest.publisher === 'im-adarsh' && manifest.id === 'jetbrains-themes', 'Plugin identity must remain stable');
const apps = manifest.contributes.themes;
const terminals = manifest.contributes.terminalThemes;
check(apps.length === terminals.length && apps.length >= 6, 'Every app theme needs a terminal pair');
// Family base anchors preserve Darcula/New UI identity while main surfaces stay uniform.
const anchors = {
  'jetbrains-dark': ['dark', '#1E1F22', '#1E1F22'],
  'jetbrains-light': ['light', '#FFFFFF', '#FFFFFF'],
  'classic-dark': ['dark', '#2B2B2B', '#2B2B2B'],
  'classic-light': ['light', '#FFFFFF', '#FFFFFF'],
  'islands-dark': ['dark', '#191A1C', '#191A1C'],
  'islands-light': ['light', '#FFFFFF', '#FFFFFF'],
  'islands-darcula': ['dark', '#2B2B2B', '#2B2B2B'],
  'high-contrast': ['dark', '#000000', '#000000']
};
for (const [id, [base, background, editor]] of Object.entries(anchors)) {
  const entry = apps.find(e => e.id === id);
  check(!!entry, `${id}: required JetBrains family variant`);
  if (entry) {
    const app = load(entry.path);
    check(app.base === base && app.tokens['--background'] === background && app.tokens['--editor-surface'] === editor,
      `${id}: preserve family base surfaces`);
  }
}
check(new Set([...apps, ...terminals].map(v => v.id)).size === apps.length + terminals.length, 'Theme IDs must be unique');
for (const entry of apps) {
  const app = load(entry.path), t = app.tokens;
  const partner = terminals.find(v => v.id === `${entry.id}-terminal`);
  check(!!partner, `${entry.label}: matching terminal registration`);
  if (!partner) continue;
  const terminal = load(partner.path);
  check(app.base === terminal.mode && entry.label === partner.label, `${entry.label}: matching labels and modes`);
  check(Object.keys(t).length === tokens.length && tokens.every(k => k in t), `${entry.label}: all 37 public tokens`);
  for (const [k, v] of Object.entries(t)) check(/^#[0-9a-f]{6}$/i.test(v), `${entry.label}: ${k} must be opaque hex`);
  for (const [bg, fg] of textPairs) {
    const ratio = contrast(t[`--${bg}`], t[`--${fg}`]);
    check(ratio >= 4.5, `${entry.label}: ${bg}/${fg} ${ratio.toFixed(2)} < 4.5 (Orca would drop tokens)`);
  }
  for (const [ring, bg] of rings) check(contrast(t[`--${ring}`], t[`--${bg}`]) >= 2, `${entry.label}: ${ring} visibility`);
  const surfaces = ['background', 'editor-surface', 'card', 'popover', 'sidebar', 'worktree-sidebar'];
  for (const key of surfaces) {
    const value = t[`--${key}`];
    check(value === t['--editor-surface'], `${entry.label}: ${key} must match the inner/editor/terminal surface`);
    check(app.base === 'light' ? luminance(value) > 0.45 : luminance(value) < 0.16,
      `${entry.label}: ${key} must stay within a cohesive ${app.base} surface range`);
  }
  const sorted = surfaces.map(k => t[`--${k}`]).sort((a, b) => luminance(a) - luminance(b));
  check(contrast(sorted[0], sorted.at(-1)) <= 1.8, `${entry.label}: excessive difference between app surfaces`);
  const c = terminal.terminal;
  check(c.background === t['--editor-surface'], `${entry.label}: terminal and editor must share a surface`);
  check(contrast(c.background, c.foreground) >= 4.5, `${entry.label}: terminal text contrast`);
  check(contrast(c.cursor, c.cursorAccent) >= 4.5, `${entry.label}: block cursor text contrast`);
  check(contrast(c.selectionBackground, c.selectionForeground) >= 4.5, `${entry.label}: terminal selection contrast`);
  for (const key of ['background', 'foreground', 'cursor', 'cursorAccent', 'selectionBackground', 'selectionForeground', ...ansi]) {
    check(/^#[0-9a-f]{6}$/i.test(c[key]), `${entry.label}: missing or invalid terminal ${key}`);
  }
  console.log(`Checked ${entry.label}`);
}
const marketplace = load('orca-marketplace.json');
check(marketplace.owner === manifest.publisher, 'Marketplace publisher must match plugin');
const themeListing = marketplace.plugins.find(entry => entry.id === `${manifest.publisher}.${manifest.id}`);
check(Boolean(themeListing), 'Marketplace must point to this collection');
check(themeListing?.source.ref === `v${manifest.version}`, 'Marketplace release ref must match plugin version');
check(themeListing?.source.url === 'https://github.com/im-adarsh/orca.git', 'Public plugin download must work without SSH credentials');
const panel = fs.readFileSync(path.join(root, 'setup/index.html'), 'utf8');
const embedded = panel.match(/<script id="palettes" type="application\/json">([\s\S]*?)<\/script>/);
check(!!embedded, 'Panel needs embedded palette data');
if (embedded) {
  const palettes = JSON.parse(embedded[1]);
  check(palettes.length === apps.length, 'Preview needs all theme choices');
  for (const entry of apps) {
    const preview = palettes.find(p => p.id === entry.id);
    check(!!preview && JSON.stringify(preview.tokens) === JSON.stringify(load(entry.path).tokens), `${entry.label}: preview must use actual app colors`);
    const partner = terminals.find(v => v.id === `${entry.id}-terminal`);
    check(!!preview && JSON.stringify(preview.terminal) === JSON.stringify(load(partner.path).terminal), `${entry.label}: preview must use actual terminal colors`);
  }
}
check(!panel.includes('__PALETTES__') && !panel.includes('__PRESET__'), 'No unresolved setup placeholders');
check(!/<script[^>]+src=/i.test(panel), 'Setup panel must not load remote scripts');
const profile = load('presets/goland-style.json');
check(profile.terminal.backgroundOpacity === 1 && profile.terminal.activePaneOpacity === 1 && profile.terminal.inactivePaneOpacity === 1, 'Preset must prevent translucent and dimmed panes');
check(profile.terminal.separateLightTheme === true && profile.appearance.leftSidebarAppearance === 'Default', 'Preset must prevent mixed terminal modes and sidebar tint');

if (failures) { console.error(`${failures} validation failures`); process.exitCode = 1; }
else console.log(`${apps.length} theme pairs passed every renderer contrast and surface consistency check.`);
