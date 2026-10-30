const $=id=>document.getElementById(id);
let snapshot={connections:[],views:[]},items=[],cursor=null,generation=0,busy=false;
const host=(method,params)=>window.orca.host.call(method,params);
const invoke=params=>host('worker.invokeOwn',{commandId:'inbox',args:params});
function element(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
function error(error,target='errors'){$(target).textContent=error?.message||String(error);}
let activeFilters=normalizeFilters(),pendingField=null;
const filterFields={status:'Status',author:'Author',assignee:'Assignee',reviewer:'Reviewer',repository:'Repository',labels:'Labels',draft:'Draft',connectionIds:'Connection',search:'Text'};
const filterChoices={status:[['open','Open'],['merged','Merged'],['closed','Closed'],['all','Any status']],draft:[['draft','Draft'],['ready','Ready for review'],['any','Any']]};
function closeFilterMenu(){$('filter-menu').hidden=true;$('filter-input').setAttribute('aria-expanded','false');}
function focusFilterInput(){$('filter-input').focus();closeFilterMenu();}
function reconcileSavedFilter(){const view=snapshot.views.find(v=>v.id===$('saved-view').value);if(view&&JSON.stringify(normalizeFilters(view.filters))!==JSON.stringify(activeFilters))$('saved-view').value='';$('delete-view').hidden=!$('saved-view').value;}
function filterValueLabel(key,value){if(key==='connectionIds')return value.map(id=>snapshot.connections.find(c=>c.id===id)?.name||id).join(', ');return filterChoices[key]?.find(c=>c[0]===value)?.[1]||value;}
function renderFilterTokens(){
 $('filter-tokens').replaceChildren();
 for(const [key,label] of Object.entries(filterFields)){
  const value=activeFilters[key];if(!value||!value.length||key==='status'&&value==='all'||key==='draft'&&value==='any')continue;
  const chip=element('span',undefined,'filter-token'),edit=element('button'),remove=element('button','×','remove-token');
  edit.append(element('span',label,'token-label'),element('span','=' ,'token-operator'),element('span',filterValueLabel(key,value),'token-value'));edit.setAttribute('aria-label','Edit '+label+' filter');edit.onclick=()=>chooseFilterField(key);
  remove.setAttribute('aria-label','Remove '+label+' filter');remove.onclick=()=>{activeFilters=normalizeFilters({...activeFilters,[key]:key==='status'?'all':key==='draft'?'any':key==='connectionIds'?[]:''});clearFilterDraft();renderFilterTokens();load();focusFilterInput();};
  chip.append(edit,remove);$('filter-tokens').append(chip);
 }
 reconcileSavedFilter();
}
function clearFilterDraft(){pendingField=null;$('filter-input').value='';$('filter-input').placeholder='Search or add a filter…';$('filter-field').hidden=true;closeFilterMenu();}
function restoreFilters(value){activeFilters=normalizeFilters(value);clearFilterDraft();renderFilterTokens();}
function filters(){
 const text=$('filter-input').value.trim();if(!text&&!pendingField)return normalizeFilters(activeFilters);
 const key=pendingField||'search';if(!text&&key!=='search')throw Error('Enter a value for '+filterFields[key]+'.');
 return normalizeFilters({...activeFilters,[key]:key==='connectionIds'?[text]:text});
}
function commitFilterDraft(){const next=filters();restoreFilters(next);return next;}
function chooseFilterField(key){pendingField=key;$('filter-field').textContent=filterFields[key]+' =';$('filter-field').hidden=false;const value=activeFilters[key];$('filter-input').value=Array.isArray(value)?value[0]||'':value||'';$('filter-input').placeholder=['author','assignee','reviewer'].includes(key)?'Username or @me':key==='repository'?'owner/repository':'Enter a value…';$('filter-input').focus();$('filter-input').select();showFilterMenu();}
function showFilterMenu(){
 const menu=$('filter-menu');menu.replaceChildren();const query=$('filter-input').value.toLowerCase();
 const options=pendingField?(filterChoices[pendingField]||(['author','assignee','reviewer'].includes(pendingField)?[['@me','@me · My username']]:pendingField==='connectionIds'?snapshot.connections.map(c=>[c.id,c.name+' · '+c.username]):pendingField==='repository'?[...new Set(items.map(i=>i.repository))].slice(0,20).map(v=>[v,v]):pendingField==='labels'?[...new Set(items.flatMap(i=>i.labels))].slice(0,20).map(v=>[v,v]):[])):Object.entries(filterFields);
 for(const [value,label] of options){if(query&&!filterChoices[pendingField]&&!label.toLowerCase().includes(query)&&!value.toLowerCase().includes(query))continue;const option=element('button',label,'filter-option');option.type='button';option.setAttribute('role','option');option.setAttribute('aria-selected','false');if(!pendingField)option.dataset.filterField=value;option.onclick=()=>{if(!pendingField){chooseFilterField(value);return;}$('filter-input').value=value;load();focusFilterInput();};menu.append(option);}
 menu.prepend(element('div',pendingField?'Choose '+filterFields[pendingField].toLowerCase()+' or enter a value':'Add a filter','filter-menu-heading'));
 menu.append(element('p',pendingField?'Enter to apply · Escape to cancel':'Type text and press Enter to search','filter-menu-hint'));menu.hidden=false;$('filter-input').setAttribute('aria-expanded','true');
}
$('filter-input').addEventListener('focus',showFilterMenu);
$('filter-input').addEventListener('click',showFilterMenu);
$('filter-input').addEventListener('input',()=>{if(!pendingField){const match=$('filter-input').value.match(/^([a-z]+)\s*[:=]\s*(.*)$/i);if(match&&Object.hasOwn(filterFields,match[1].toLowerCase())){const key=match[1].toLowerCase(),value=match[2];chooseFilterField(key);$('filter-input').value=value;}}showFilterMenu();});
$('filter-input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();load();}if(e.key==='Escape'){e.preventDefault();clearFilterDraft();}if(e.key==='ArrowDown'){e.preventDefault();showFilterMenu();$('filter-menu').querySelector('button')?.focus();}});
$('filter-menu').addEventListener('keydown',e=>{const buttons=[...$('filter-menu').querySelectorAll('button')],index=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();buttons[(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}if(e.key==='Escape'){e.preventDefault();closeFilterMenu();$('filter-input').focus();closeFilterMenu();}});
$('add-filter').onclick=()=>{clearFilterDraft();$('filter-input').focus();showFilterMenu();};
document.addEventListener('click',e=>{if(!e.composedPath().includes(document.querySelector('.filter-control')))closeFilterMenu();});
function markBusy(value){busy=value;document.body.classList.toggle('busy',value);for(const id of ['refresh','apply','more'])$(id).disabled=value;}
function updateState(state){
 snapshot=state;const view=$('saved-view').value;
 $('saved-view').replaceChildren(new Option('Saved filters',''));
 $('connection-pills').replaceChildren();$('connection-list').replaceChildren();
 for(const c of state.connections){
  $('connection-pills').append(element('span',c.name+' · '+c.username));
  const entry=element('div',undefined,'connection-entry'),info=element('div');
  info.append(element('strong',c.name),element('p',c.baseUrl+' · '+c.username));
  const remove=element('button','Disconnect');remove.addEventListener('click',async()=>{remove.disabled=true;try{const next=await invoke({operation:'disconnect',connectionId:c.id});generation++;markBusy(false);items=[];cursor=null;updateState(next);render();$('status').textContent='Connection removed. Refresh to load requests.';}catch(e){error(e,'dialog-error');remove.disabled=false;}});
  entry.append(info,remove);$('connection-list').append(entry);
 }
 for(const view of state.views)$('saved-view').add(new Option(view.name,view.id));
 activeFilters=normalizeFilters({...activeFilters,connectionIds:activeFilters.connectionIds.filter(id=>state.connections.some(c=>c.id===id))});renderFilterTokens();
 if(state.views.some(v=>v.id===view))$('saved-view').value=view;
 reconcileSavedFilter();
}
function relative(value){const n=Math.max(0,Date.now()-Date.parse(value));if(!Number.isFinite(n))return '';const minutes=Math.floor(n/60000);return minutes<1?'just now':minutes<60?minutes+'m':minutes<1440?Math.floor(minutes/60)+'h':Math.floor(minutes/1440)+'d';}
function render(){
 $('requests').replaceChildren();$('more').hidden=!cursor;
 if(!items.length){const empty=element('section',undefined,'empty');empty.append(element('h2',snapshot.connections.length?'No matching merge requests':'Connect your first Git host'),element('p',snapshot.connections.length?'Try different filters or refresh the list.':'Use GitHub, GitLab, or self-hosted GitLab to build your review queue.'));if(!snapshot.connections.length){const button=element('button','Connect account','primary');button.onclick=openConnections;empty.append(button);}$('requests').append(empty);return;}
 for(const group of groupRequests(items)){
  const section=element('details',undefined,'repo-group');section.open=true;section.dataset.repository=group.repository;
  const summary=element('summary');summary.append(element('span',group.repository),element('span',String(group.items.length)+' loaded','count'));
  const connection=snapshot.connections.find(c=>c.id===group.connectionId);summary.append(element('span',(connection?.name||'')+' · '+new URL(group.host).host,'host'));section.append(summary);
  for(const item of group.items){
   const row=element('article',undefined,'request'),content=element('div');
   content.append(element('div',item.title,'request-title'));const meta=element('div',undefined,'meta');
   meta.append(element('span',(item.provider==='gitlab'?'!':'#')+item.number),element('span',item.draft?'Draft':item.status[0].toUpperCase()+item.status.slice(1)));
   for(const label of item.labels)meta.append(element('span',label,'tag'));content.append(meta);
   const actions=element('div',undefined,'actions'),review=element('button','Review locally'),link=element('button','↗','open-link');link.setAttribute('aria-label','Open '+item.title+' in provider');
   review.onclick=async()=>{review.disabled=true;try{await host('reviews.openLocal',{provider:item.provider,url:item.url,title:item.title});$('status').textContent='Choose your agent and chat or terminal in the workspace composer.';}catch(e){error(e);}finally{review.disabled=false;}};
   link.onclick=async()=>{try{await host('links.openExternal',{url:item.url});}catch(e){error(e);}};
   actions.append(review,link);row.append(element('span',item.draft?'◌':'⑂','symbol'),content,element('span',item.author,'author'),element('span',relative(item.updatedAt),'updated'),actions);section.append(row);
  }
  $('requests').append(section);
 }
}
async function load(append=false){
 const request=++generation;markBusy(false);let f;try{f=commitFilterDraft();}catch(e){error(e);$('status').textContent='Correct the filters, then apply them.';return;}
 if(!snapshot.connections.length){items=[];cursor=null;render();$('status').textContent='No accounts connected.';return;}
 if(!append){items=[];cursor=null;render();}const pageCursor=append?cursor:undefined;
 $('errors').textContent='';$('status').textContent='Loading merge requests…';markBusy(true);
 try{const result=await invoke({operation:'list',filters:f,...(pageCursor?{cursor:pageCursor}:{})});if(request!==generation)return;
  const byId=new Map((append?items:[]).map(item=>[item.id,item]));for(const item of result.items)byId.set(item.id,item);items=[...byId.values()];cursor=result.cursor;render();
  $('status').textContent=items.length+' requests loaded · '+groupRequests(items).length+' repository groups'+(cursor?' · more available':'')+(result.limited?' · provider search limit reached; narrow your filters':'');
  $('errors').textContent=result.errors.map(e=>(snapshot.connections.find(c=>c.id===e.connectionId)?.name||'Connection')+': '+e.message).join('\n');
 }catch(e){if(request===generation){error(e);$('status').textContent='Could not load requests. Refresh to retry.';}}finally{if(request===generation)markBusy(false);}
}
function openConnections(){$('dialog-error').textContent='';$('connections').showModal();$('connection-name').focus();}
function closeConnections(){$('token').value='';$('connections').close();}
for(const id of ['connect','manage'])$(id).onclick=openConnections;
for(const id of ['close-dialog','cancel-dialog'])$(id).onclick=closeConnections;
$('connections').addEventListener('close',()=>{$('token').value='';});
$('provider').onchange=()=>{$('base-url').value=$('provider').value==='github'?'https://github.com':'https://gitlab.com';};
$('save-connection').onclick=async()=>{
 const button=$('save-connection');button.disabled=true;button.textContent='Testing connection…';$('dialog-error').textContent='';
 try{const state=await invoke({operation:'connect',provider:$('provider').value,name:$('connection-name').value,baseUrl:$('base-url').value,token:$('token').value});$('token').value='';updateState(state);closeConnections();await load();}catch(e){error(e,'dialog-error');}finally{button.disabled=false;button.textContent='Test & connect';}
};
$('refresh').onclick=()=>load();$('apply').onclick=()=>load();$('more').onclick=()=>load(true);
$('reset').onclick=()=>{restoreFilters({});load();};
$('save-view').onclick=()=>{$('view-editor').hidden=false;$('view-name').focus();};$('cancel-view').onclick=()=>{$('view-editor').hidden=true;};
$('confirm-view').onclick=async()=>{try{updateState(await invoke({operation:'saveView',name:$('view-name').value,filters:commitFilterDraft()}));$('view-editor').hidden=true;$('view-name').value='';await load();}catch(e){error(e);}};
$('saved-view').onchange=()=>{const view=snapshot.views.find(v=>v.id===$('saved-view').value);$('delete-view').hidden=!view;if(view){restoreFilters(view.filters);load();}};
$('delete-view').onclick=async()=>{try{updateState(await invoke({operation:'deleteView',id:$('saved-view').value}));}catch(e){error(e);}};
async function start(){
 if(!window.orca?.host?.has('worker.invokeOwn')){$('status').textContent='This plugin requires Orca with the native MRs host patch.';for(const button of document.querySelectorAll('button'))button.disabled=true;return;}
 try{const state=await invoke({operation:'state'});updateState(state);restoreFilters(state.filters);await load();}catch(e){error(e);$('status').textContent='Open the plugin review screen in Orca and check its permissions.';}
}
start();
