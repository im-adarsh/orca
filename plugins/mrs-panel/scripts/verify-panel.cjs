const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'panel/index.html'), 'utf8');
const host = require('/Applications/Orca.app/Contents/Resources/app.asar.unpacked/out/shared/plugins/plugin-panel-shell.js');
assert(!/<script\b|<link\b|<iframe\b/i.test(html), 'Prototype must be self-contained in the panel sandbox');
assert(!/https?:\/\//i.test(html), 'Prototype must not request remote assets');
assert.match(html, /SAMPLE MODE/);
assert.match(html, /Live merge requests are unavailable/);

(async () => {
  const chrome = process.env.CHROME_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined);
  const browser = await chromium.launch({executablePath: chrome, headless: true});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (/^https?:/.test(r.url())) errors.push('Remote request: ' + r.url()); });
    const wrapped = host.buildPluginPanelShellHtml(html)
      .replaceAll(host.PANEL_SHELL_COLOR_SCHEME_PLACEHOLDER, 'dark')
      .replaceAll(host.PANEL_SHELL_TOKENS_PLACEHOLDER,
        '--orca-background:#1e1f22;--orca-foreground:#dfe1e5;--orca-card:#2b2d30;--orca-border:#555;--orca-muted-foreground:#a7a9ad');
    for (const width of [240, 320, 480]) {
      await page.setViewportSize({width, height: 800});
      await page.setContent('<iframe sandbox="allow-scripts" style="display:block;width:100%;height:800px;border:0"></iframe>');
      await page.locator('iframe').evaluate((el, content) => { el.srcdoc = content; }, wrapped);
      const frame = page.frameLocator('iframe');
      await frame.getByRole('heading', {name: 'MRs'}).waitFor();
      assert.equal(await frame.locator('.repo').count(), 2);
      assert.equal(await frame.locator('.mr').count(), 3);
      const overflow = await frame.locator('body').evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert(!overflow, `Panel overflows at ${width}px`);
    }
    assert.deepEqual(errors, []);
    console.log('MRs prototype passed host CSP/sandbox rendering at 240, 320, and 480px.');
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
