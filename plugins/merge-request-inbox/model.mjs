export function groupRequests(items) {
 const groups=new Map();
 for(const item of items){
  const key=JSON.stringify([item.connectionId,item.host,item.repository]);
  if(!groups.has(key))groups.set(key,{key,connectionId:item.connectionId,host:item.host,repository:item.repository,items:[]});
  groups.get(key).items.push(item);
 }
 for(const group of groups.values())group.items.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
 return [...groups.values()].sort((a,b)=>String(b.items[0].updatedAt).localeCompare(String(a.items[0].updatedAt))||a.key.localeCompare(b.key));
}

export function normalizeFilters(input={}) {
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid filters.');
 const allowed=['status','draft','repository','author','assignee','reviewer','labels','search','connectionIds'];
 if(Object.keys(input).some(key=>!allowed.includes(key)))throw Error('Unknown filter.');
 const value={status:'open',draft:'any',repository:'',author:'',assignee:'',reviewer:'',labels:'',search:'',connectionIds:[],...input};
 if(!['open','closed','merged','all'].includes(value.status)||!['any','draft','ready'].includes(value.draft))throw Error('Invalid request status.');
 for(const key of ['repository','author','assignee','reviewer','labels','search']){
  if(typeof value[key]!=='string'||value[key].length>256||/[\u0000-\u001f\u007f]/.test(value[key]))throw Error('Invalid '+key+' filter.');
  value[key]=value[key].trim();
 }
 for(const key of ['author','assignee','reviewer'])if(value[key]&&!/^[A-Za-z0-9_.@-]{1,100}$/.test(value[key]))throw Error('Use a provider username for '+key+'.');
 if(value.repository&&!/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)+$/.test(value.repository))throw Error('Use a repository path such as owner/repository.');
 if(!Array.isArray(value.connectionIds)||value.connectionIds.length>20||value.connectionIds.some(id=>typeof id!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(id)))throw Error('Invalid connection selection.');
 return value;
}
