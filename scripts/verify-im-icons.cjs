const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const {hostModule}=require('./host-contract.cjs');
const root=path.resolve(__dirname,'..');
const api=path.join(process.env.ORCA_APP_PATH||'/Applications/Orca.app','Contents/Resources/app.asar.unpacked/out/shared/plugins');
const {parsePluginManifest}=hostModule(api,'manifest/plugin-manifest','plugin-manifest');
const {parsePluginIconThemeArtifact,isPlausiblePluginIconSvg}=hostModule(api,'artifacts/plugin-icon-theme-artifact','plugin-icon-theme-artifact');
(async()=>{
 const sources=[];
 for(const plugin of ['goland-style','jetbrains-icons','im-material-icons']){
  const dir=path.join(root,'plugins',plugin),manifest=JSON.parse(fs.readFileSync(path.join(dir,'orca-plugin.json')));
  const parsed=parsePluginManifest(manifest);assert(parsed.ok,JSON.stringify(parsed));
  for(const entry of manifest.contributes.iconThemes||[])parsePluginIconThemeArtifact(fs.readFileSync(path.join(dir,entry.path),'utf8'));
  if(plugin==='goland-style')continue;
  const provenance=JSON.parse(fs.readFileSync(path.join(dir,'provenance.json')));
  for(const record of provenance.assets.filter(x=>x.localPath.endsWith('.svg'))){
   const bytes=fs.readFileSync(path.join(dir,record.localPath)),svg=bytes.toString();
   assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256);
   assert(isPlausiblePluginIconSvg(svg),record.localPath);
   sources.push({plugin,path:record.localPath,svg});
  }
 }
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined),headless:true});
 try{
  const page=await browser.newPage();
  const results=await page.evaluate(async sources=>{
   const allowed=new Set(['svg','path','rect','circle','ellipse','line','polyline','polygon','g','defs','linearGradient','radialGradient','stop','clipPath','mask','title','desc']);
   const results=[];
   for(const source of sources){
    const doc=new DOMParser().parseFromString(source.svg,'image/svg+xml');
    if(doc.querySelector('parsererror'))throw Error(source.path+': invalid XML');
    for(const node of doc.querySelectorAll('*')){
     if(!allowed.has(node.localName))throw Error(source.path+': unsafe element '+node.localName);
     for(const a of node.attributes){
      if(a.namespaceURI==='http://www.w3.org/2000/xmlns/'||a.name==='xml:space')continue;
      if(a.localName==='style' && a.value.trim()==='isolation:isolate')continue;
      if(/^on/i.test(a.name)||['href','src','style'].includes(a.localName)||/https?:|data:|javascript:/i.test(a.value))throw Error(source.path+': unsafe attribute '+a.name);
     }
    }
    const image=new Image();image.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(source.svg)));await image.decode();
    const canvas=document.createElement('canvas');canvas.width=canvas.height=16;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,16,16);
    if(!Array.from(ctx.getImageData(0,0,16,16).data).some((v,i)=>i%4===3&&v>0))throw Error(source.path+': invisible SVG');
    results.push({plugin:source.plugin,path:source.path,visible:true});
   }
   return results;
  },sources);
  fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
  fs.writeFileSync(path.join(root,'artifacts/im-icons-verification.json'),JSON.stringify({host:'Orca 1.4.245',method:'Installed manifest/artifact parser, pinned hashes, SVG XML safety and browser pixel readback. No native installation claimed.',results},null,2)+'\n');
  await page.goto('file://'+path.join(root,'plugins/im-material-icons/preview.html'));
  await page.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));
  for(const width of [360,768,1440]){await page.setViewportSize({width,height:1000});assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));}
  await page.locator('main').screenshot({path:path.join(root,'previews/im-material-icons.png')});
  console.log('PASS: modern manifests and icon artifacts accepted by installed Orca; '+results.length+' SVGs hashed, safely parsed and visibly rendered; preview fits 360/768/1440px');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
