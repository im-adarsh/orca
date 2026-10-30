const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'panel/index.html'),'utf8');
const host=require('/Applications/Orca.app/Contents/Resources/app.asar.unpacked/out/shared/plugins/plugin-panel-shell.js');
assert(!/<link\b|<iframe\b|https?:\/\//i.test(html));
assert.match(html,/SAMPLE MODE/);
(async()=>{
 const chrome=process.env.CHROME_PATH||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined);
 const browser=await chromium.launch({executablePath:chrome,headless:true});
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url()))errors.push('Remote request: '+r.url())});
  const palettes=[
   {name:'new light',scheme:'light',tokens:'--orca-background:#f7f8fa;--orca-foreground:#17202b;--orca-card:#ffffff;--orca-border:#adb5bd;--orca-muted-foreground:#465260;--orca-primary:#175cd3',expected:['rgb(247, 248, 250)','rgb(23, 32, 43)','rgb(23, 92, 211)']},
   {name:'new dark',scheme:'dark',tokens:'--orca-background:#1e1f22;--orca-foreground:#dfe1e5;--orca-card:#2b2d30;--orca-border:#65676b;--orca-muted-foreground:#a7a9ad;--orca-primary:#7aabff',expected:['rgb(30, 31, 34)','rgb(223, 225, 229)','rgb(122, 171, 255)']},
   {name:'stock light',scheme:'light',tokens:'--background:#fafafa;--foreground:#222222;--card:#ffffff;--border:#aaaaaa;--muted-foreground:#555555;--primary:#245ab0',expected:['rgb(250, 250, 250)','rgb(34, 34, 34)','rgb(36, 90, 176)']},
   {name:'stock dark',scheme:'dark',tokens:'--background:#202124;--foreground:#eeeeee;--card:#303136;--border:#777777;--muted-foreground:#bbbbbb;--primary:#88b5ff',expected:['rgb(32, 33, 36)','rgb(238, 238, 238)','rgb(136, 181, 255)']}
  ];
  async function mount(palette,width){
   await page.setViewportSize({width,height:800});
   const wrapped=host.buildPluginPanelShellHtml(html).replaceAll(host.PANEL_SHELL_COLOR_SCHEME_PLACEHOLDER,palette.scheme).replaceAll(host.PANEL_SHELL_TOKENS_PLACEHOLDER,palette.tokens);
   await page.setContent('<iframe sandbox="allow-scripts" style="display:block;width:100%;height:800px;border:0"></iframe>');
   await page.locator('iframe').evaluate((el,content)=>{el.srcdoc=content},wrapped);
   const frame=page.frameLocator('iframe');await frame.locator('#result-count').getByText('5 of 5').waitFor();return frame;
  }
  for(const palette of palettes)for(const width of [240,320,360,480]){
   await page.emulateMedia({colorScheme:palette.scheme==='light'?'dark':'light'});
   const frame=await mount(palette,width);
   assert.equal(await frame.locator('.repo').count(),3,palette.name);
   assert.equal(await frame.locator('.mr').count(),5,palette.name);
   const top=await frame.locator('.mr').first().evaluate(el=>el.getBoundingClientRect().top);
   assert(top<=210,palette.name+' first row at '+top);
   const colors=await frame.locator('body').evaluate(el=>[getComputedStyle(el).backgroundColor,getComputedStyle(el).color,getComputedStyle(document.querySelector('#search')).outlineColor]);
   await frame.locator('#search').focus();await page.keyboard.press('Tab');
   const focus=await frame.locator('#filter-menu summary').evaluate(el=>getComputedStyle(el).outlineColor);
   assert.deepEqual([colors[0],colors[1],focus],palette.expected,palette.name);
   const controls=await frame.locator('body').evaluate(()=>[getComputedStyle(document.querySelector('input')).backgroundColor,getComputedStyle(document.documentElement).colorScheme]);
   assert.equal(controls[1],palette.scheme);
   assert.equal(controls[0],palette.name.includes('light')?'rgb(255, 255, 255)':palette.name==='new dark'?'rgb(43, 45, 48)':'rgb(48, 49, 54)');
   assert.equal(await frame.locator('body').evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,palette.name+' '+width+' overflow');
   await frame.locator('#filter-menu summary').click();
   const menuBounds=await frame.locator('#filter-menu .menu-body').evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,width:innerWidth}));
   assert(menuBounds.left>=0&&menuBounds.right<=menuBounds.width,palette.name+' '+width+' filter menu clipped');
   await frame.locator('#filter-menu summary').click();
  }
  const frame=await mount(palettes[0],320);
  const add=async(key,val)=>{await frame.locator('#filter-menu summary').click();await frame.getByLabel('Filter by').selectOption(key);await frame.getByLabel('Value').selectOption(val);await frame.getByRole('button',{name:'Add filter'}).click();await frame.locator('#filter-menu summary').click()};
  await add('status','Open');assert.equal(await frame.locator('.mr').count(),2);
  await add('status','Draft');assert.equal(await frame.locator('.mr').count(),3);
  await add('provider','GitLab');assert.equal(await frame.locator('.mr').count(),1);
  await frame.getByRole('button',{name:'Remove Provider: GitLab filter'}).click();assert.equal(await frame.locator('.mr').count(),3);
  await frame.locator('#view-menu summary').click();
  await frame.getByLabel('View name').fill('Review queue');await frame.getByRole('button',{name:'Save view'}).click();
  await frame.locator('#view-menu summary').click();
  await frame.getByRole('button',{name:'Remove Status: Open filter'}).click();assert.equal(await frame.locator('.mr').count(),1);
  await frame.locator('#view-menu summary').click();await frame.getByRole('button',{name:'Apply view'}).click();assert.equal(await frame.locator('.mr').count(),3);
  await frame.locator('#view-menu summary').click();
  await frame.locator('#filter-menu summary').focus();await frame.locator('#filter-menu summary').press('Enter');
  assert.equal(await frame.locator('#filter-menu').getAttribute('open'),'');
  await frame.getByLabel('Filter by').press('Escape');
  assert.equal(await frame.locator('#filter-menu').getAttribute('open'),null);
  assert.equal(await frame.locator('#filter-menu summary').evaluate(el=>document.activeElement===el),true);
  await frame.getByRole('button',{name:'Remove Status: Open filter'}).click();
  await frame.getByRole('button',{name:'Remove Status: Draft filter'}).click();
  await frame.locator('.repo-title').first().click();assert.equal(await frame.locator('.mr').count(),3);
  await frame.locator('.repo-title').first().click();assert.equal(await frame.locator('.mr').count(),5);
  await frame.getByRole('button',{name:'Add checkout validation details'}).click();
  assert.equal(await frame.locator('#detail-view').isVisible(),true);
  await frame.getByRole('button',{name:'← Requests'}).click();
  assert.equal(await frame.locator('#list-view').isVisible(),true);
  await frame.getByLabel('Search sample requests').fill('checkout');assert.equal(await frame.locator('.mr').count(),1);
  await frame.getByLabel('Search sample requests').fill('');
  await frame.locator('#filter-menu summary').click();
  const github='is:pr "https://example.test/a?b=c" -label:stale (review:required OR draft:true) updated:2024-01-01..2024-12-31 future:kept';
  await frame.getByLabel('Query text (unchecked)').fill(github);
  await frame.getByRole('button',{name:'Apply query'}).click();
  assert.equal(await frame.locator('.mr').count(),0);
  assert.equal(await frame.locator('#results').innerText(),'Not executed in sample mode — requires live provider data.');
  assert.equal(await frame.locator('#provider-query').inputValue(),github);
  for(const invalid of ['https://api.github.com/search/issues?q=token%3Dsecret','/search/issues?q=x']){
   await frame.getByLabel('Query text (unchecked)').fill(invalid);
   await frame.getByRole('button',{name:'Apply query'}).click();
   assert.match(await frame.locator('#query-error').innerText(),/endpoint/);
   assert.equal(await frame.locator('#query-error').innerText().then(text=>text.includes('secret')),false);
   assert.equal(await frame.locator('#results').innerText(),'Not executed in sample mode — requires live provider data.');
  }
  await frame.getByLabel('Provider query · sample mode').selectOption('GitLab');
  const gitlab='state=opened&labels[]=one&labels[]=two&not[author_username]=bot&reviewer_id=7&reviewer_id=8&future_filter=x%2By';
  await frame.getByLabel('Query text (unchecked)').fill(gitlab);
  await frame.getByRole('button',{name:'Apply query'}).click();
  assert.equal(await frame.locator('#provider-query').inputValue(),gitlab);
  assert.equal(await frame.locator('#query-error').innerText(),'');
  for(const invalid of ['private_token=secret','%70rivate_token=secret','state=opened&password=secret','state=opened&broken','https://gitlab.example/api/v4/merge_requests?state=opened']){
   await frame.getByLabel('Query text (unchecked)').fill(invalid);
   await frame.getByRole('button',{name:'Apply query'}).click();
   assert.notEqual(await frame.locator('#query-error').innerText(),'');
   assert.equal(await frame.locator('#query-error').innerText().then(text=>text.includes('secret')),false);
   assert.equal(await frame.locator('#results').innerText(),'Not executed in sample mode — requires live provider data.');
  }
  await frame.getByRole('button',{name:'Clear query'}).click();
  assert.equal(await frame.locator('.mr').count(),5);
  await frame.locator('#filter-menu summary').click();
  assert.deepEqual(errors,[]);
  const screenshotFrame=await mount(palettes[1],360);
  await screenshotFrame.locator('#filter-menu summary').click();
  await page.screenshot({path:path.join(root,'screenshots','mrs-sidebar-sample.png'),fullPage:true});
  console.log('MRs panel passed compact layout, filtering, provider query safety, sample state, views, keyboard, detail, themes, sandbox, and responsive widths.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
