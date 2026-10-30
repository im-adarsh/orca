const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {hashPluginTree} = require('./catalog-hash.cjs');
const root = path.resolve(__dirname, '..');
const commit = process.argv[2];
if (!/^[0-9a-f]{40}$/.test(commit || '')) throw Error('Supply the full committed package SHA.');
const ref = 'v' + JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).version;
const catalogPath = path.join(root, 'orca-catalog.json');
const previous = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath)).plugins : [];
const packages = [
  ['plugins/goland-style', ['themes', 'appearance']],
  ['plugins/jetbrains-icons', ['icons', 'appearance']],
  ['plugins/merge-request-inbox', ['developer-tools']]
];
const entries = packages.map(([relative, categories]) => {
  if (execFileSync('git', ['status', '--porcelain', '--', relative], {cwd: root, encoding: 'utf8'}).trim() ||
      execFileSync('git', ['diff', commit, '--', relative], {cwd: root, encoding: 'utf8'}).trim()) {
    throw Error('Commit the exact package contents before generating the catalog: ' + relative);
  }
  const folder = path.join(root, relative);
  const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'orca-plugin.json')));
  const id = manifest.publisher + '.' + manifest.id;
  const older = previous.find(entry => entry.id === id)?.releases || [];
  const contentHash = hashPluginTree(folder).hash;
  const existing = older.find(release => release.version === manifest.version);
  if (existing && existing.contentHash !== contentHash) throw Error('Bump the changed package version: ' + id);
  const release = existing || {version: manifest.version, commit, contentHash, execution: manifest.execution,
    minimumOrca: manifest.engines.orca.slice(2), name: manifest.name};
  return {id, source: {kind: 'git', url: 'https://github.com/im-adarsh/orca.git', ref, path: relative},
    description: manifest.description, categories,
    releases: [release, ...older.filter(item => item.version !== manifest.version)]};
});
entries.push(JSON.parse(fs.readFileSync(path.join(root, 'marketplace/upstream-excalidraw.json'))));
fs.writeFileSync(catalogPath, JSON.stringify({
  $schema: 'https://raw.githubusercontent.com/stablyai/orca/main/docs/schemas/plugins/orca-catalog.v2.schema.json',
  catalogVersion: 2, name: 'Adarsh Orca Marketplace', owner: 'im-adarsh', plugins: entries
}, null, 2) + '\n');
console.log('Generated ' + entries.length + ' pinned catalog entries for ' + ref + '. Existing releases retain their hashes.');
