import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const pending=new Map();
const read=p=>JSON.parse(pending.get(p)??fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,v)=>pending.set(p,JSON.stringify(v,null,2)+'\n');
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const hex=v=>'#'+v.map(n=>Math.round(Math.max(0,Math.min(255,n))).toString(16).padStart(2,'0')).join('').toUpperCase();
function mix(a,b,amount){const x=rgb(a),y=rgb(b);return hex(x.map((n,i)=>n+(y[i]-n)*amount));}
function opaque(value,base){
 assert(typeof value==='string'&&/^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(value),'Unsupported source color: '+value);
 let h=value.slice(1);if(h.length===3)h=h.split('').map(c=>c+c).join('');
 return h.length===8?mix(base,'#'+h.slice(0,6),parseInt(h.slice(6),16)/255):('#'+h).toUpperCase();
}
function luminance(h){return rgb(h).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function readable(color,surfaces,dark,minimum=4.5){
 for(let i=0;i<=255;i++){
  const candidate=mix(color,dark?'#FFFFFF':'#000000',i/255);
  if(surfaces.every(bg=>contrast(candidate,bg)>=minimum))return candidate;
 }
 throw Error('Cannot make source color readable against chosen surfaces');
}
function foreground(background){return contrast(background,'#FFFFFF')>=contrast(background,'#000000')?'#FFFFFF':'#000000';}
function layer(value,editor,dark,role){
 let color=opaque(value,editor);
 if(!dark&&role!=='sidebar'&&luminance(color)<luminance(editor))color='#FFFFFF';
 if(role==='sidebar'&&contrast(color,editor)<1.12){
  for(let i=1;i<=100;i++){
   color=mix(editor,dark?'#FFFFFF':'#000000',i/100);
   if(contrast(color,editor)>=1.12)break;
  }
 }
 // Keep the complete range cohesive; the host rejects extreme surface/text pairings.
 while(contrast(color,editor)>1.45)color=mix(color,editor,.06);
 return color;
}
const input=read('presets/popular-theme-palettes.json').themes;
const directions=read('presets/global-theme-design.json').themes;
assert.equal(new Set(input.map(t=>t.id)).size,26,'Expected 26 distinct inputs');
for(const source of input){assert(/^im-[a-z0-9-]+$/.test(source.id),'Unsafe theme id');assert(['dark','light'].includes(source.mode),'Invalid source mode');}
assert.deepEqual(directions.map(t=>t.id).sort(),input.map(t=>t.id).sort(),'Superdesign must cover every source');
for(const spec of directions)for(const key of ['accent','sidebar','card','popover','selection'])assert(/^#[\da-f]{6}$/i.test(spec[key]),spec.id+': invalid design '+key);
const manifest=read('orca-plugin.json');
const additions=new Set(input.map(t=>t.id));
const entries=manifest.contributes.themes.filter(t=>!additions.has(t.id));
assert.equal(entries.length,13,'Preserve the thirteen existing choices');
const ansi=['black','red','green','yellow','blue','magenta','cyan','white','brightBlack','brightRed','brightGreen','brightYellow','brightBlue','brightMagenta','brightCyan','brightWhite'];
const fallbackDark=read('themes/im-ember-terminal.json').terminal;
const fallbackLight=read('themes/im-daylight-terminal.json').terminal;
const adaptations=[];
for(const source of [
 ...entries.map(entry=>{const app=read(entry.path);return{id:entry.id,label:entry.label,mode:app.base,existing:app,terminal:read(entry.path.replace('.json','-terminal.json')).terminal};}),
 ...input
]){
 const dark=source.mode==='dark',raw=source.colors||{},existing=source.existing?.tokens;
 const editor=opaque(raw['editor.background']||existing['--editor-surface'],'#000000');
 const spec=directions.find(t=>t.id===source.id)||{};
 const proposedAccent=opaque(spec.accent||source.accent||existing['--primary'],editor);
 let sidebar=layer(spec.sidebar||mix(editor,dark?'#FFFFFF':'#000000',dark?.07:.07),editor,dark,'sidebar');
 let card=layer(spec.card||mix(editor,'#FFFFFF',dark?.09:1),editor,dark,'card');
 let popover=layer(spec.popover||mix(editor,'#FFFFFF',dark?.12:1),editor,dark,'popover');
 while(Math.max(...[sidebar,editor,card,popover].map(luminance))+.05>1.8*(Math.min(...[sidebar,editor,card,popover].map(luminance))+.05)){
  card=mix(card,editor,.06);popover=mix(popover,editor,.06);
 }
 const primary=readable(proposedAccent,[sidebar,editor],dark,3);
 // A hue-tinted fill carries selection in native hosts; no preview-only stripe is needed.
 let selection=mix(sidebar,primary,dark?.28:.22);
 for(let amount=dark?.29:.23;contrast(selection,sidebar)<1.28&&amount<=.7;amount+=.01)selection=mix(sidebar,primary,amount);
 assert(contrast(selection,sidebar)>=1.2,source.id+': selection separation');
 const secondary=mix(card,primary,dark?.03:.025);
 const surfaces=[sidebar,editor,card,popover,secondary,selection];
 const fg=readable(opaque(raw['editor.foreground']||existing?.['--foreground']||(dark?'#D4D4D4':'#303030'),editor),surfaces,dark);
 const muted=readable(opaque(raw.descriptionForeground||existing?.['--muted-foreground']||mix(editor,fg,.65),editor),surfaces,dark);
 const border=mix(sidebar,fg,dark?.23:.2),charts=existing?[1,2,3,4,5].map(n=>existing['--chart-'+n]):[primary,raw['terminal.ansiGreen'],raw['terminal.ansiYellow'],raw['terminal.ansiMagenta'],raw['terminal.ansiCyan']].map((c,i)=>opaque(c||[primary,'#6CA374','#B98A32','#AD78C9','#428E9B'][i],editor));
 const t={'--background':sidebar,'--editor-surface':editor,'--foreground':fg,'--card':card,'--card-foreground':fg,'--popover':popover,'--popover-foreground':fg,'--primary':primary,'--primary-foreground':foreground(primary),'--secondary':secondary,'--secondary-foreground':fg,'--muted':secondary,'--muted-foreground':muted,'--accent':selection,'--accent-foreground':fg,'--border':border,'--input':border,'--ring':primary};
 charts.forEach((c,i)=>t['--chart-'+(i+1)]=c);
 for(const prefix of ['sidebar','worktree-sidebar']){
  t['--'+prefix]=sidebar;t['--'+prefix+'-foreground']=fg;
  for(const [key,value]of Object.entries({accent:selection,'accent-foreground':fg,border,ring:primary}))t['--'+prefix+'-'+key]=value;
 }
 t['--sidebar-primary']=primary;t['--sidebar-primary-foreground']=foreground(primary);
 const terminal={background:editor,foreground:fg,cursor:primary,cursorAccent:foreground(primary),selectionBackground:selection,selectionForeground:fg};
 const fallbacks=[];
 for(const name of ansi){
  const key='terminal.ansi'+name[0].toUpperCase()+name.slice(1);
  let color=source.terminal?.[name]||raw[key];
  if(!color){
   color=raw['terminal.ansi'+name.replace(/^bright/,'').replace(/^./,c=>c.toUpperCase())]||(dark?fallbackDark:fallbackLight)[name];
   fallbacks.push(name);
  }
  color=opaque(color,editor);
  terminal[name]=['black','white','brightWhite'].includes(name)?color:readable(color,[editor],dark);
 }
 const entry={id:source.id,label:source.label||source.id,path:'themes/'+source.id+'.json'};
 write(entry.path,{base:source.mode,tokens:t});write(entry.path.replace('.json','-terminal.json'),{schemaVersion:1,mode:source.mode,terminal});
 adaptations.push({id:source.id,editor,mainAccent:primary,sourceAccent:proposedAccent,selection,terminalFallbacks:fallbacks});
 if(!source.existing)entries.push(entry);
}
manifest.contributes.themes=entries;
manifest.contributes.terminalThemes=entries.map(t=>({id:t.id+'-terminal',label:t.label,path:t.path.replace('.json','-terminal.json')}));
manifest.version='1.7.0';manifest.description=`${entries.length} layered im IDE-inspired app and terminal palettes, with clear selection accents and a portable setup guide.`;
write('orca-plugin.json',manifest);
const profile=read('presets/goland-style.json');profile.themePairs=entries.map(e=>({app:e.label,terminal:e.label,mode:read(e.path).base}));write('presets/goland-style.json',profile);
const palettes=entries.map(e=>({id:e.id,name:e.label,family:input.find(s=>s.id===e.id)?.family||'Originals',...read(e.path),terminal:read(e.path.replace('.json','-terminal.json')).terminal}));
const panelPath=path.join(root,'setup/index.html');
let panel=fs.readFileSync(panelPath,'utf8');
panel=panel.replace(/(<script id="palettes" type="application\/json">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(palettes)+b).replace(/(<script id="preset-data" type="application\/json">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(profile)+b);
panel=panel.replace('Marketplace · 1.6.0','Marketplace · 1.7.0').replace('Thirteen distinct palette pairs',entries.length+' distinct palette pairs');
pending.set('setup/index.html',panel);
write('docs/popular-theme-adaptations.json',{schemaVersion:1,notes:'Source editor surfaces retained; structural shades, accents and text adapted to host contrast. Missing terminal colors are explicit fallbacks. ANSI black/white preserved. No syntax-highlighting contribution implied.',themes:adaptations});
for(const [file,contents]of pending)fs.writeFileSync(path.join(root,file),contents);
console.log(`Generated ${entries.length} theme pairs from pinned data and Superdesign directions.`);
