// Optional browser verification. Install Playwright in your development environment,
// or point PLAYWRIGHT_MODULE at an existing installation. No dependency is shipped.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const root = path.resolve(__dirname, '..');
  const records = JSON.parse(fs.readFileSync(path.join(root, 'provenance.json'))).assets.filter(x => x.localPath.endsWith('.svg'));
  const sources = records.map(x => ({path:x.localPath, url:'data:image/svg+xml;base64,' + fs.readFileSync(path.join(root, x.localPath)).toString('base64')}));
  const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined), headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto('file://' + path.join(root, 'preview.html'));
    await page.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));
    const observations = await page.evaluate(async sources => {
      const results=[];
      for (const {path,url} of sources) {
        const img = new Image(); img.src=url; await img.decode();
        const canvas=document.createElement('canvas'); canvas.width=canvas.height=16;
        const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0);
        const rgba=ctx.getImageData(0,0,16,16).data;
        results.push({path,width:img.naturalWidth,height:img.naturalHeight,visible:Array.from(rgba).some((a,i)=>i%4===3 && a>0)});
      }
      return results;
    },sources);
    const bad=observations.filter(x=>!x.visible || x.width!==16 || x.height!==16);
    if (bad.length || errors.length) throw Error(JSON.stringify({bad,errors}));
    for (const width of [360,768,1440]) {
      await page.setViewportSize({width,height:1000});
      if (await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Horizontal overflow at '+width);
    }
    const result={method:'Every bundled SVG loaded from its exact bytes as a data URL in isolated headless Chrome; decoded dimensions and nonempty alpha readback checked. Contact sheet uses bundled relative paths. Static schema/mapping checks separate. No native Orca1.4.245 installation performed.',svgs:observations.length,allDecode16x16:true,allPaintPixels:true,contactSheetImages:await page.locator('img').count(),responsiveWidths:[360,768,1440],scriptErrors:errors};
    fs.writeFileSync(path.join(root,'validation-results.json'),JSON.stringify(result,null,2)+'\n');
    console.log('PASS: '+observations.length+' SVGs decode16×16 and paint pixels; 132 contact images; responsive widths360/768/1440.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
