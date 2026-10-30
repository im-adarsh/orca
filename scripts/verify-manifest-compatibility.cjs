const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const installed = process.argv[2], newer = process.argv[3];
if (!installed || !newer) throw Error('Usage: node scripts/verify-manifest-compatibility.cjs <Orca.app> <newer-source-checkout>');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'orca-manifest-compat-'));
try {
  const stockParser = require(path.join(installed, 'Contents/Resources/app.asar.unpacked/out/shared/plugins/plugin-manifest.js'));
  require(path.join(newer, 'node_modules/esbuild')).buildSync({stdin: {
    contents: "export {parsePluginManifest} from './src/shared/plugins/manifest/plugin-manifest'; export {validateMarketplaceProvenance} from './src/main/plugins/catalog/plugin-marketplace-provenance';",
    resolveDir: path.resolve(newer), loader: 'ts'
  }, bundle: true, platform: 'node', format: 'cjs', outfile: path.join(temp, 'parser.cjs')});
  const newerParser = require(path.join(temp, 'parser.cjs'));
  const legacy = JSON.parse(fs.readFileSync(path.join(root, 'orca-plugin.json')));
  for (const [name, parser] of [['shipped Orca', stockParser], ['newer Orca', newerParser]]) {
    const result = parser.parsePluginManifest(legacy);
    assert(result.ok, `${name} rejects root package: ${result.error}`);
    console.log(`${name}: root theme manifest accepted`);
  }
  const modern = JSON.parse(fs.readFileSync(path.join(root, 'plugins/goland-style/orca-plugin.json')));
  assert.equal(modern.manifestVersion, 2, 'Generated modern package must remain format 2');
  const result = newerParser.parsePluginManifest(modern);
  assert(result.ok, 'Newer Orca rejects generated modern package: ' + result.error);
  console.log('Newer Orca: generated modern manifest accepted');
  const mrs = JSON.parse(fs.readFileSync(path.join(root, 'plugins/mrs-panel/orca-plugin.json')));
  assert.equal(mrs.manifestVersion, 1, 'Legacy MRs prototype must use the stock-compatible manifest format');
  assert.equal(mrs.engines.orca, '>=1.4.244', 'MRs panel must permit the installed stock Orca release');
  assert.equal(mrs.execution, undefined, 'Format 1 derives panel execution from its contributions');
  assert(stockParser.satisfiesOrcaEngineRange('1.4.244', mrs.engines.orca), 'Stock Orca does not meet MRs engine gate');
  for (const [name, parser] of [['shipped Orca', stockParser], ['newer Orca', newerParser]]) {
    const parsed = parser.parsePluginManifest(mrs);
    assert(parsed.ok, `${name} rejects MRs panel: ${parsed.error}`);
    assert.equal(parsed.manifest.contributes.panels.length, 1, `${name} lost the MRs panel contribution`);
    assert.equal(parsed.manifest.contributes.panels[0].icon, 'code', `${name} changed the panel icon`);
    console.log(`${name}: legacy MRs prototype manifest accepted`);
  }
  const publishedMrs = JSON.parse(fs.readFileSync(path.join(root, 'plugins/mrs-panel-modern/orca-plugin.json')));
  assert.equal(publishedMrs.manifestVersion, 2);
  assert.equal(publishedMrs.execution, 'sandboxed-ui');
  const publishedResult = newerParser.parsePluginManifest(publishedMrs);
  assert(publishedResult.ok, 'Newer Orca rejects modern MRs prototype: ' + publishedResult.error);
  assert.equal(fs.readFileSync(path.join(root, 'plugins/mrs-panel-modern/panel/index.html'), 'utf8'), fs.readFileSync(path.join(root, 'plugins/mrs-panel/panel/index.html'), 'utf8'), 'Published panel HTML drifted from the tested source');
  console.log('Newer Orca: modern MRs prototype accepted; panel HTML matches tested source');
  newerParser.validateMarketplaceProvenance(
    {source: {url: 'https://github.com/im-adarsh/orca.git'}},
    {marketplace: JSON.parse(fs.readFileSync(path.join(root, 'orca-catalog.json')))}
  );
  console.log('Newer Orca: catalog publisher provenance accepted');
} finally {
  fs.rmSync(temp, {recursive: true, force: true});
}
