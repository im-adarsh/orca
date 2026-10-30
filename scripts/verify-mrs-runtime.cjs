const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { _electron } = require('playwright');
const root = path.resolve(__dirname, '..');
const host = process.argv[2];
if (!host) throw Error('Pass the built, patched Orca source checkout.');
const hostRoot = path.resolve(host);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'mrs-runtime-'));
const esbuild = require(path.join(hostRoot, 'node_modules/esbuild'));
esbuild.buildSync({stdin: {contents: `export * from './tests/e2e/helpers/electron-home-isolation'; export * from './tests/e2e/helpers/electron-launch-args'; export * from './tests/e2e/helpers/e2e-completed-onboarding-profile'; export * from './tests/e2e/helpers/electron-process-shutdown';`, resolveDir: hostRoot, loader: 'ts'}, bundle: true, platform: 'node', format: 'cjs', outfile: path.join(temp, 'helpers.cjs')});
const helpers = require(path.join(temp, 'helpers.cjs'));
(async () => {
  fs.writeFileSync(path.join(temp, 'orca-data.json'), JSON.stringify(helpers.getE2ECompletedOnboardingProfile()));
  const inherited = {...process.env};
  delete inherited.ELECTRON_RUN_AS_NODE;
  delete inherited.ORCA_USER_DATA_PATH;
  const isolation = helpers.createElectronHomeIsolation({inheritedEnv: inherited, launchEnv: {}, extraEnv: {ORCA_BACKGROUND_LAUNCH: '1'}, userDataDir: temp});
  let app, child, passed = false;
  try {
    app = await _electron.launch({executablePath: require(path.join(hostRoot, 'node_modules/electron')), args: helpers.getOrcaElectronLaunchArgs(path.join(hostRoot, 'out/main/index.js'), false), env: {...isolation.env, NODE_ENV: 'development', ORCA_E2E_HEADLESS: '1'}, timeout: 120000});
    child = app.process();
    child.stderr.on('data', data => fs.appendFileSync(path.join(temp, 'electron.log'), data));
    helpers.assertElectronResolvedIsolatedHome(await app.evaluate(({app}) => app.getPath('home')), isolation);
    const page = await app.firstWindow({timeout: 120000});
    await page.waitForFunction(() => Boolean(window.__store), null, {timeout: 60000});
    const pluginKey = await page.evaluate(async pluginPath => {
      const settings = await window.api.settings.set({pluginSystemEnabled: true});
      window.__store.setState({settings});
      await window.api.plugins.refresh();
      const installed = await window.api.plugins.install({kind: 'local-path', path: pluginPath});
      if (!installed.ok) throw Error(installed.error);
      const listed = await window.api.plugins.refresh();
      const plugin = listed.find(entry => entry.pluginKey === installed.pluginKey);
      if (!plugin?.consentFingerprint) throw Error('No reviewable plugin fingerprint');
      await window.api.plugins.consent({pluginKey: plugin.pluginKey, reviewedFingerprint: plugin.consentFingerprint, decision: 'approve'});
      await window.api.plugins.refresh();
      return plugin.pluginKey;
    }, path.join(root, 'plugins/merge-request-inbox'));
    const entry = page.getByRole('button', {name: 'MRs', exact: true});
    await entry.waitFor({timeout: 30000});
    assert.equal(await entry.count(), 1);
    await entry.click();
    const frame = page.frameLocator('iframe[title="MRs"]');
    await frame.getByText('Connect your first Git host').waitFor({timeout: 30000});
    assert.equal(await frame.locator('#connect').count(), 1);
    const windows = await app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows().map(window => ({visible: window.isVisible(), focused: window.isFocused()})));
    assert(windows.every(window => !window.visible && !window.focused), 'Verification must keep every native window hidden');
    await page.screenshot({path: path.join(root, 'previews/mrs-native-runtime.png')});
    await page.evaluate(async key => { await window.api.plugins.setEnabled({pluginKey: key, enabled: false}); }, pluginKey);
    await page.locator('iframe[title="MRs"]').waitFor({state: 'detached', timeout: 30000});
    passed = true;
    console.log('Native MRs: isolated hidden desktop, real plugin install/consent, one navigation entry, worker empty state and disable fallback passed.');
  } catch (error) {
    console.error('Runtime verification failed; isolated diagnostics:', temp);
    throw error;
  } finally {
    if (app) await helpers.closeElectronAppForE2E(app, {cleanupDaemonsForUserDataDir: temp});
    // Keep the isolated profile if shutdown is incomplete; never delete an active app profile.
    if (passed && (!app || child?.exitCode !== null)) fs.rmSync(temp, {recursive: true, force: true});
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
