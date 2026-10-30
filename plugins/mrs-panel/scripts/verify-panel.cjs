const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'panel/index.html'),'utf8');
const host=require('/Applications/Orca.app/Contents/Resources/app.asar.unpacked/out/shared/plugins/plugin-panel-shell.js');
assert(!/<link\b|<iframe\b/i.test(html));
assert(!/https?:\/\//i.test(html));
assert.match(html,/SAMPLE MODE/);assert.match(html,/SESSION ONLY/);
(async()=>{
 const chrome=process.env.CHROME_PATH||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined);
 const browser=await chromium.launch({executablePath:chrome,headless:true});
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url()))errors.push('Remote request: '+r.url())});
  const palettes=[
   {name:'new light',scheme:'light',tokens:'--orca-background:#f7f8fa;--orca-foreground:#17202b;--orca-card:#ffffff;--orca-border:#adb5bd;--orca-muted-foreground:#465260;--orca-primary:#175cd3',expected:['rgb(247, 248, 250)','rgb(255, 255, 255)','rgb(23, 32, 43)','rgb(23, 92, 211)']},
   {name:'new dark',scheme:'dark',tokens:'--orca-background:#1e1f22;--orca-foreground:#dfe1e5;--orca-card:#2b2d30;--orca-border:#65676b;--orca-muted-foreground:#a7a9ad;--orca-primary:#7aabff',expected:['rgb(30, 31, 34)','rgb(43, 45, 48)','rgb(223, 225, 229)','rgb(122, 171, 255)']},
   {name:'stock light',scheme:'light',tokens:'--background:#fafafa;--foreground:#222222;--card:#ffffff;--border:#aaaaaa;--muted-foreground:#555555;--primary:#245ab0',expected:['rgb(250, 250, 250)','rgb(255, 255, 255)','rgb(34, 34, 34)','rgb(36, 90, 176)']},
   {name:'stock dark',scheme:'dark',tokens:'--background:#202124;--foreground:#eeeeee;--card:#303136;--border:#777777;--muted-foreground:#bbbbbb;--primary:#88b5ff',expected:['rgb(32, 33, 36)','rgb(48, 49, 54)','rgb(238, 238, 238)','rgb(136, 181, 255)']}
  ];
  async function mount(palette,width){
   await page.setViewportSize({width,height:800});
   const wrapped=host.buildPluginPanelShellHtml(html).replaceAll(host.PANEL_SHELL_COLOR_SCHEME_PLACEHOLDER,palette.scheme).replaceAll(host.PANEL_SHELL_TOKENS_PLACEHOLDER,palette.tokens);
   await page.setContent('<iframe sandbox="allow-scripts" style="display:block;width:100%;height:800px;border:0"></iframe>');
   await page.locator('iframe').evaluate((el,content)=>{el.srcdoc=content},wrapped);
   const frame=page.frameLocator('iframe');await frame.locator('#result-count').getByText('5 of 5').waitFor();return frame;
  }
  for(const palette of palettes)for(const width of [240,320,480]){
   const frame=await mount(palette,width);
   assert.equal(await frame.locator('.repo').count(),3,palette.name);
   assert.equal(await frame.locator('.mr').count(),5,palette.name);
   await frame.locator('#filter-value').focus();
   await page.keyboard.press('Tab');
   const colors=await frame.locator('body').evaluate(el=>{const c=s=>getComputedStyle(s);return[c(el).backgroundColor,c(document.querySelector('.repo-title')).backgroundColor,c(el).color,c(document.querySelector('#add-filter')).outlineColor]});
   assert.deepEqual(colors,palette.expected,palette.name);
   const overflow=await frame.locator('body').evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   assert(!overflow,palette.name+' overflows '+width);
  }
  const frame=await mount(palettes[0],320);
  const add=async(key,val)=>{await frame.getByLabel('Filter by').selectOption(key);await frame.getByLabel('Value').selectOption(val);await frame.getByRole('button',{name:'Add filter'}).click()};
  await add('status','Open');assert.equal(await frame.locator('.mr').count(),2);assert.equal(await frame.locator('.repo').count(),2);
  await add('status','Draft');assert.equal(await frame.locator('.mr').count(),3);
  await add('provider','GitLab');assert.equal(await frame.locator('.mr').count(),1);assert.equal(await frame.locator('.repo-title').innerText(),'acme / backend · 1');
  await frame.getByRole('button',{name:'Remove Provider: GitLab filter'}).click();assert.equal(await frame.locator('.mr').count(),3);
  await frame.getByLabel('Preset name').fill('Review queue');await frame.getByRole('button',{name:'Save preset'}).click();
  await add('author','Inez');assert.equal(await frame.locator('.mr').count(),0);assert.match(await frame.locator('.empty').innerText(),/No sample MRs/);
  await frame.getByRole('button',{name:'Apply preset'}).click();assert.equal(await frame.locator('.mr').count(),3);
  await frame.getByRole('button',{name:'Remove Status: Open filter'}).click();assert.equal(await frame.locator('.mr').count(),1);
  await frame.getByRole('button',{name:'Remove Status: Draft filter'}).click();assert.equal(await frame.locator('.mr').count(),5);
  for(const [key,val,count] of [['assignee','Mira',2],['reviewer','Lee',2],['repo','tools / cli',1]]){
   await frame.getByLabel('Filter by').selectOption(key);await frame.getByLabel('Value').selectOption(val);await frame.getByLabel('Value').press('Enter');
   assert.equal(await frame.locator('.mr').count(),count);
   await frame.getByRole('button',{name:'Remove '+({assignee:'Assignee',reviewer:'Reviewer',repo:'Repository'}[key])+': '+val+' filter'}).click();
  }
  await frame.getByLabel('Filter by').focus();await frame.getByLabel('Filter by').press('Tab');
  assert.equal(await frame.locator('#filter-value').evaluate(el=>document.activeElement===el),true);
  await frame.getByLabel('Value').press('Escape');assert.equal(await frame.locator('.mr').count(),5);
  assert.equal(await frame.getByRole('button',{name:'Add filter'}).count(),1);
  assert.deepEqual(errors,[]);
  await mount(palettes[1],320);
  await page.setViewportSize({width:320,height:800});
  await page.frameLocator('iframe').getByLabel('Value').selectOption('Open');
  await page.frameLocator('iframe').getByRole('button',{name:'Add filter'}).click();
  await page.screenshot({path:path.join(root,'screenshots','mrs-sidebar-sample.png'),fullPage:true});
  console.log('MRs panel passed stock CSP/opaque iframe, filters, grouping, presets, keyboard, themes, and responsive widths.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
