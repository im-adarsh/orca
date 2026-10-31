import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest=read('orca-plugin.json');
const expected=['dracula','one-dark-pro','one-light','catppuccin-mocha','catppuccin-latte','tokyo-night','nord','github-dark','github-light','gruvbox-dark','gruvbox-light','solarized-dark','solarized-light','rose-pine','rose-pine-dawn','night-owl','night-owl-light','ayu-dark','ayu-light','monokai','kanagawa-wave','kanagawa-lotus','material-theme-palenight','synthwave-84','dark-plus','light-plus'].map(n=>'im-'+n);
assert.equal(manifest.contributes.themes.length,39,'All 26 additions plus 13 existing themes must be registered');
const input=read('presets/popular-theme-palettes.json');
assert.equal(input.themes.length,expected.length);
assert.equal(new Set(input.themes.map(t=>t.family)).size,16,'Keep the requested sixteen family groups');
const L=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>(Math.max(L(a),L(b))+.05)/(Math.min(L(a),L(b))+.05);
for(const entry of manifest.contributes.themes){
 const t=read(entry.path).tokens;
 assert(ratio(t['--sidebar-accent'],t['--sidebar'])>=1.2,entry.id+': selected fill visible without preview stripe');
 assert(ratio(t['--sidebar'],t['--editor-surface'])>=1.1,entry.id+': structural shades');
 assert(ratio(t['--ring'],t['--background'])>=3,entry.id+': focus accent');
}
for(const id of expected){
 const entry=manifest.contributes.themes.find(t=>t.id===id);assert(entry,id);
 const source=input.themes.find(t=>t.id===id);assert(source,id);
 const app=read(entry.path),t=app.tokens;
 assert.equal(app.base,source.mode,id+': preserve source mode');
 assert.equal(t['--editor-surface'].toLowerCase(),source.colors['editor.background'].toLowerCase(),id+': preserve source editor background');
 assert(ratio(t['--sidebar-accent'],t['--sidebar'])>=1.2,id+': selected fill must remain distinct without a stripe');
 assert(ratio(t['--sidebar'],t['--editor-surface'])>=1.1,id+': structural shades must be perceptible');
 assert(ratio(t['--ring'],t['--background'])>=3,id+': focus accent visibility');
 const terminal=manifest.contributes.terminalThemes.find(t=>t.id===id+'-terminal');assert(terminal,id);
 assert.equal(read(terminal.path).terminal.background,t['--editor-surface']);
}
assert(fs.existsSync(path.join(root,'licenses/Shiki-Themes-MIT.txt')));
const provenance=read('docs/popular-theme-sources.json');
assert.equal(provenance.package.version,'4.5.0');
assert(provenance.rea.parentEvidenceId.startsWith('ev_'));
assert.equal(crypto.createHash('sha256').update(gunzipSync(fs.readFileSync(path.join(root,provenance.rea.evidencePath)))).digest('hex'),provenance.rea.evidenceSha256,'Portable REA evidence must retain its exact bytes');
assert.equal(provenance.themes.length,26);
assert.equal(provenance.themes.find(t=>t.source==='one-light').upstreamRepository,'https://github.com/akamud/vscode-theme-onelight');
for(const record of Object.values(provenance.upstreamLicenses))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,record.path))).digest('hex'),record.sha256,'Retain exact original notices');
const profile=read('presets/goland-style.json');
assert.deepEqual(profile.themePairs.map(p=>p.app).sort(),manifest.contributes.themes.map(p=>p.label).sort());
console.log('PASS: 26 source-derived popular themes, 39 complete pairs, visible shades/selections, license and REA provenance');
