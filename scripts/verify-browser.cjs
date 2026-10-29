const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const root=path.resolve(__dirname,'..');
 const chrome=process.env.CHROME_PATH || (process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined);
 const browser=await chromium.launch({executablePath:chrome,headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:1100},deviceScaleFactor:1});
 fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+root+'/setup/index.html');
 const ids=await page.locator('#palette option').evaluateAll(options=>options.map(o=>({id:o.value,name:o.textContent})));
 const assets=path.join(process.env.ORCA_APP_PATH || '/Applications/Orca.app','Contents/Resources/app.asar.unpacked/out/renderer/assets');
 const source=fs.readFileSync(path.join(assets,fs.readdirSync(assets).find(n=>/^document-theme-.*\.js$/.test(n))),'utf8');
 const start=source.indexOf('var tt=[['),end=source.indexOf('var J,ut=',start);
 if(start<0||end<0)throw Error('Host renderer changed; review filter extraction');
 await page.addScriptTag({content:source.slice(start,end)+';window.hostFilter=lt;'});
 const cards=[];
 for(const {id,name} of ids){
  await page.selectOption('#palette',id);
  const result=await page.evaluate(()=>{
   const p=JSON.parse(document.querySelector('#palettes').textContent).find(p=>p.id===document.documentElement.dataset.theme);
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d',{willReadFrequently:true});
   function probe(value){if(!CSS.supports('color',value))return null;ctx.clearRect(0,0,1,1);ctx.fillStyle=value;ctx.fillRect(0,0,1,1);const v=Array.from(ctx.getImageData(0,0,1,1).data);v[3]/=255;return v;}
   const filtered=window.hostFilter(p.tokens,p.tokens,probe);
   const editor=getComputedStyle(document.querySelector('.editor')).backgroundColor;
   const terminal=getComputedStyle(document.querySelector('.terminal')).backgroundColor;
   const surfaces=['body','.titlebar','.files','.editor','.terminal','.footer','.card'].map(selector=>getComputedStyle(document.querySelector(selector)).backgroundColor);
   return {tokens:Object.keys(filtered).length,editor,terminal,surfaces,theme:document.documentElement.dataset.theme,mode:getComputedStyle(document.documentElement).colorScheme};
  });
  if(result.tokens!==37||new Set(result.surfaces).size!==1||result.theme!==id)throw Error(name+JSON.stringify(result));
  const png=await page.locator('.workspace').screenshot();cards.push({name,png:png.toString('base64')});
  console.log(name+': browser retained all 37 tokens; all seven preview surfaces match');
 }
 for(const width of [360,768]){await page.setViewportSize({width,height:1000});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Horizontal overflow at '+width);}
 await page.setViewportSize({width:1280,height:1100});
 await page.selectOption('#palette','jetbrains-dark');
 await page.evaluate(()=>document.fonts.ready);
 const fullHeight=await page.evaluate(()=>document.documentElement.scrollHeight);
 await page.setViewportSize({width:1280,height:fullHeight});
 await page.screenshot({path:path.join(root,'artifacts/setup-desktop.png')});
 // Exercise the same CSP and opaque-origin frame wrapper used by installed plugins.
 const host=require(path.resolve(assets,'../../shared/plugins/plugin-panel-shell.js'));
 let wrapped=host.buildPluginPanelShellHtml(fs.readFileSync(path.join(root,'setup/index.html'),'utf8'));
 wrapped=wrapped.replaceAll(host.PANEL_SHELL_COLOR_SCHEME_PLACEHOLDER,'dark').replaceAll(host.PANEL_SHELL_TOKENS_PLACEHOLDER,'');
 const shell=await browser.newPage({viewport:{width:420,height:1000}});
 shell.on('pageerror',e=>errors.push(e.message));
 await shell.setContent('<iframe id="host-panel" sandbox="allow-scripts" style="width:100%;height:940px;border:0"></iframe>');
 await shell.locator('#host-panel').evaluate((el,html)=>{el.srcdoc=html},wrapped);
 const frame=shell.frameLocator('#host-panel');
 const sourcePalettes=await page.locator('#palettes').evaluate(el=>JSON.parse(el.textContent));
 for(const p of sourcePalettes){
  const sharedTokens=Object.entries(p.tokens).filter(([k])=>host.PANEL_DESIGN_TOKEN_ALLOWLIST.includes(k));
  const html=host.buildPluginPanelShellHtml(fs.readFileSync(path.join(root,'setup/index.html'),'utf8')).replaceAll(host.PANEL_SHELL_COLOR_SCHEME_PLACEHOLDER,p.base).replaceAll(host.PANEL_SHELL_TOKENS_PLACEHOLDER,sharedTokens.map(([k,v])=>k+':'+v).join(';'));
  await shell.locator('#host-panel').evaluate((el,html)=>{el.srcdoc=html},html);
  await frame.locator('#palette').waitFor();
  const initial=await frame.locator('#palette').inputValue();
  if(initial!==p.id)throw Error('Setup panel did not inherit host theme '+p.id);
 }
 for(const {id,name} of ids){
  await frame.locator('#palette').selectOption(id);
  const matched=await frame.locator('.workspace').evaluate(el=>{
   const root=el.ownerDocument;
   return getComputedStyle(root.querySelector('.editor')).backgroundColor===getComputedStyle(root.querySelector('.terminal')).backgroundColor && root.documentElement.scrollWidth<=innerWidth;
  });
  if(!matched)throw Error('Sandbox preview mismatch or overflow: '+name);
 }
 await frame.locator('#palette').selectOption('jetbrains-dark');
 await shell.screenshot({path:path.join(root,'artifacts/setup-sandbox.png')});
 console.log('Installed Orca CSP and sandbox wrapper: all theme choices work without overflow.');
if(errors.length)throw Error(errors.join('\n'));
 const sheet=await browser.newPage({viewport:{width:1440,height:1360},deviceScaleFactor:1});
 const html='<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:36px;background:#e8eaed;color:#25282f;font:15px Inter,Arial,sans-serif}h1{margin:0 0 10px;font-size:28px}p{margin:0 0 24px;color:#555c67}main{display:grid;grid-template-columns:1fr 1fr;gap:26px}h2{font-size:19px;margin:0 0 10px}img{width:100%;display:block;border-radius:7px}footer{margin-top:24px;color:#555c67;font-size:12px}</style></head><body><h1>GoLand Style for Orca</h1><p>Twelve matched app and terminal palettes · Renderer-verified on Orca 1.4.244</p><main>'+cards.map(c=>'<article><h2>'+c.name+'</h2><img src="data:image/png;base64,'+c.png+'"></article>').join('')+'</main><footer>Rendered setup-panel previews. Orca controls the actual app layout; fonts and opacity are selected in its settings.</footer></body></html>';
 await sheet.setContent(html);await sheet.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 await sheet.locator('body').screenshot({path:path.join(root,'previews/themes.png')});
 console.log('Setup panel verified at desktop, tablet, and narrow widths; no browser script errors.');
 } finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
