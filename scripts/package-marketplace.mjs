import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'plugins/goland-style');
// This directory is generated exclusively by this script.
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(root,'orca-plugin.json'),'utf8'));
manifest.manifestVersion=2;
manifest.engines.orca='>=1.4.245';
// Reserve a higher version so an upgraded host can migrate from the legacy build.
manifest.version='2.1.0';
for(const panel of manifest.contributes.panels)panel.icon='layers';
for(const command of manifest.contributes.commands)delete command.context;
for(const family of ['themes','terminalThemes'])for(const t of manifest.contributes[family]){t.title=t.label;delete t.label}
fs.writeFileSync(path.join(out,'orca-plugin.json'),JSON.stringify(manifest,null,2)+'\n');
for(const entry of [...manifest.contributes.themes,...manifest.contributes.terminalThemes,...manifest.contributes.panels]){const relative=entry.path||entry.entry;const dst=path.join(out,relative);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(root,relative),dst);if(relative==='setup/index.html')fs.writeFileSync(dst,fs.readFileSync(dst,'utf8').replace('Marketplace · '+JSON.parse(fs.readFileSync(path.join(root,'orca-plugin.json'),'utf8')).version,'Marketplace · '+manifest.version))}
console.log('Packaged modern catalog collection under plugins/goland-style; legacy root remains 1.4.244 compatible.');
