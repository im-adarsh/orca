import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import './validate-themes.mjs';
if (process.exitCode) process.exit(process.exitCode);
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const app = process.argv[2] || '/Applications/Orca.app';
const out = path.join(app, 'Contents/Resources/app.asar.unpacked/out');
const api = path.join(out, 'shared/plugins');
const { parsePluginManifest } = require(path.join(api, 'plugin-manifest.js'));
const { parsePluginAppThemeArtifact } = require(path.join(api, 'plugin-theme-artifact.js'));
const { parsePluginTerminalThemeArtifact } = require(path.join(api, 'plugin-terminal-theme-artifact.js'));
const { pluginMarketplaceSchema } = require(path.join(api, 'plugin-marketplace.js'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'orca-plugin.json'), 'utf8'));
const parsed = parsePluginManifest(manifest);
if (!parsed.ok) throw new Error(parsed.error);
pluginMarketplaceSchema.parse(JSON.parse(fs.readFileSync(path.join(root, 'orca-marketplace.json'), 'utf8')));
const {KEYBINDING_DEFINITIONS, keybindingConflictIdentities} = require(path.join(out, 'shared/keybindings.js'));
for (const platform of ['darwin','linux','win32']) {
  for (const binding of manifest.contributes.keybindings ?? []) {
    const ours = keybindingConflictIdentities(binding.command, binding.key, platform);
    for (const def of KEYBINDING_DEFINITIONS) {
      for (const key of def.defaultBindings[platform] ?? []) {
        if (keybindingConflictIdentities(def.id, key, platform).some(id => ours.includes(id))) {
          throw new Error(`${binding.key} conflicts with ${def.id} on ${platform}`);
        }
      }
    }
  }
}
console.log('Navigation defaults have no host shortcut conflicts on macOS, Linux, or Windows.');
const assets = path.join(out, 'renderer/assets');
const rendererPath = fs.readdirSync(assets).find(n => /^document-theme-.*\.js$/.test(n));
const source = fs.readFileSync(path.join(assets, rendererPath), 'utf8');
// Use the installed host's pure filtering implementation, not a copy of our validator.
// These anchors are specific to the inspected 1.4.244 build. Fail closed if it changes.
const start = source.indexOf('var tt=[['), end = source.indexOf('var J,ut=', start);
if (start < 0 || end < 0) throw new Error('Host renderer changed; review filter extraction before verifying');
const context = vm.createContext({});
vm.runInContext(source.slice(start, end) + ';globalThis.hostFilter=lt;', context, {timeout:1000});
const stylesheet = fs.readdirSync(assets).find(n => /^client-.*\.css$/.test(n));
const css = fs.readFileSync(path.join(assets, stylesheet), 'utf8');
function declarations(selector) {
  const i = css.indexOf(selector);
  if (i < 0) throw new Error('Host base stylesheet changed');
  return Object.fromEntries([...css.slice(i + selector.length, css.indexOf('}', i)).matchAll(/(--[a-z0-9-]+):([^;}]*)/g)].map(m => [m[1], m[2]]));
}
const light = declarations(':root{--app-font-family:');
const dark = {...light, ...declarations('.dark{--orca-security-background:')};
function probe(value) {
  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) return null;
  let h=value.slice(1); if(h.length===3) h=h.split('').map(x=>x+x).join(''); if(h.length===6) h+='ff';
  return [0,2,4,6].map((i,j)=>parseInt(h.slice(i,i+2),16)/(j===3?255:1));
}
for (const entry of manifest.contributes.themes) {
  const raw=fs.readFileSync(path.join(root,entry.path),'utf8');
  const theme=parsePluginAppThemeArtifact(raw);
  const result=context.hostFilter(theme.tokens,theme.base==='dark'?dark:light,probe);
  const dropped=Object.keys(theme.tokens).filter(k=>!(k in result));
  if(dropped.length) throw new Error(`${entry.label}: host rejected ${dropped.join(', ')}`);
  console.log(`${entry.label}: installed Orca retained all ${Object.keys(result).length} tokens`);
}
for(const entry of manifest.contributes.terminalThemes) parsePluginTerminalThemeArtifact(fs.readFileSync(path.join(root,entry.path),'utf8'));
console.log('Installed Orca accepted marketplace, plugin manifest, 12 theme files, commands, and panel registration.');
