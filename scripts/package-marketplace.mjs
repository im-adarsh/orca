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
manifest.version='2.3.0';
for(const panel of manifest.contributes.panels)panel.icon='layers';
for(const command of manifest.contributes.commands)delete command.context;
for(const family of ['themes','terminalThemes'])for(const t of manifest.contributes[family]){t.title=t.label;delete t.label}
fs.writeFileSync(path.join(out,'orca-plugin.json'),JSON.stringify(manifest,null,2)+'\n');
for(const entry of [...manifest.contributes.themes,...manifest.contributes.terminalThemes,...manifest.contributes.panels]){const relative=entry.path||entry.entry;const dst=path.join(out,relative);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(root,relative),dst);if(relative==='setup/index.html')fs.writeFileSync(dst,fs.readFileSync(dst,'utf8').replace('Marketplace · '+JSON.parse(fs.readFileSync(path.join(root,'orca-plugin.json'),'utf8')).version,'Marketplace · '+manifest.version))}
fs.cpSync(path.join(root,'licenses'),path.join(out,'licenses'),{recursive:true});
fs.copyFileSync(path.join(root,'THIRD_PARTY_THEMES.md'),path.join(out,'THIRD_PARTY_THEMES.md'));
fs.mkdirSync(path.join(out,'provenance'),{recursive:true});
fs.copyFileSync(path.join(root,'docs/popular-theme-sources.json'),path.join(out,'provenance/themes.json'));
console.log('Packaged modern catalog collection under plugins/goland-style; legacy root remains 1.4.244 compatible.');

// Publish the same sample panel through both manifest generations.
const mrsRoot=path.join(root,'plugins/mrs-panel'),mrsOut=path.join(root,'plugins/mrs-panel-modern');
const mrs=JSON.parse(fs.readFileSync(path.join(mrsRoot,'orca-plugin.json'),'utf8'));
mrs.manifestVersion=2;mrs.execution='sandboxed-ui';mrs.engines.orca='>=1.4.245';mrs.version='0.2.1';
fs.rmSync(mrsOut,{recursive:true,force:true});fs.mkdirSync(path.join(mrsOut,'panel'),{recursive:true});
fs.writeFileSync(path.join(mrsOut,'orca-plugin.json'),JSON.stringify(mrs,null,2)+'\n');
fs.copyFileSync(path.join(mrsRoot,'panel/index.html'),path.join(mrsOut,'panel/index.html'));
fs.writeFileSync(path.join(mrsOut,'README.md'),'# MRs Panel Prototype\n\nGenerated from ../mrs-panel for Orca 1.4.245+. Sample data and session-only filters; live providers, persistent filters and native review sessions are unavailable. Edit the source panel and run npm run package:marketplace.\n');
console.log('Packaged modern MRs prototype; HTML matches the stock-compatible source.');
