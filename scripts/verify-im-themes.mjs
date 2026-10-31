import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest = read('orca-plugin.json');
assert(!manifest.contributes.themes.some(t => t.id === 'islands-darcula'), 'Consolidate the redundant Darcula variant');
for (const family of ['themes','terminalThemes']) {
  const entries = manifest.contributes[family];
  assert(entries.every(t => /^im-[a-z0-9-]+$/.test(t.label)), 'Every theme choice needs an im name');
  assert.equal(new Set(entries.map(t => t.label)).size, entries.length);
  assert.equal(new Set(entries.map(t => JSON.stringify(read(t.path)))).size, entries.length, 'No identical palette artifacts');
}
for (const id of ['im-ember','im-daylight']) assert(manifest.contributes.themes.some(t => t.id === id), id);
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]); }
for (const plugin of ['jetbrains-icons','im-material-icons']) {
  const dir = path.join(root,'plugins',plugin);
  const assets = walk(path.join(dir,'assets')).filter(p => p.endsWith('.svg'));
  const hashes = assets.map(p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'));
  assert.equal(new Set(hashes).size, hashes.length, plugin+': duplicated SVG bytes');
  const m = read('plugins/'+plugin+'/orca-plugin.json');
  assert(m.contributes.iconThemes.every(t => t.title.startsWith('im-')));
  for (const entry of m.contributes.iconThemes) {
    const t = JSON.parse(fs.readFileSync(path.join(dir,entry.path)));
    assert(Object.keys(t.fileExtensions).length >= 70);
    for (const group of ['icons','fileNames','fileExtensions']) for (const p of Object.values(t[group])) {
      assert(!path.isAbsolute(p) && !p.split('/').includes('..'));
      assert(fs.existsSync(path.join(dir,p)), p);
    }
  }
}
console.log('PASS: im names, canonical palettes, complete icon mappings and unique SVG assets');
