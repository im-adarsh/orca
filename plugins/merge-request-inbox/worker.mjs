import {randomUUID} from 'node:crypto';
import {validateConnection,identity,listRequests} from './providers.mjs';
import {normalizeFilters} from './model.mjs';

export function createInbox(orca,{fetcher=fetch}={}){
 let queue=Promise.resolve(),listingSequence=0;const cursors=new Map();
 const call=(method,params)=>orca.host.call(method,params);
 const read=async(key,fallback)=>(await call('storage.get',{key})).value??fallback;
 const write=async(key,value)=>{if(Buffer.byteLength(JSON.stringify(value))>(key==='views'?18000:6000))throw Error('Saved data is too large. Shorten filters or remove unused connections/views.');await call('storage.set',{key,value});};
 const state=async()=>({connections:await read('connections',[]),views:await read('views',[]),filters:await read('filters',normalizeFilters())});
 async function mutate(p){
  if(p.operation==='connect'){
   const connections=await read('connections',[]);if(connections.length>=10)throw Error('Use at most 10 connections.');
   const connection={...validateConnection(p),id:randomUUID()};const username=await identity(connection,p.token,fetcher);
   await call('secrets.set',{key:connection.id,value:p.token});
   try{await write('connections',[...connections,{...connection,username}]);}catch{await call('secrets.delete',{key:connection.id});throw Error('Could not save the connection. Check plugin storage.');}
  }else if(p.operation==='disconnect'){
   const connections=await read('connections',[]);if(!connections.some(c=>c.id===p.connectionId))throw Error('Connection not found.');
   // Remove metadata first: a failed vault deletion is safe to retry without exposing a live connection.
   await write('connections',connections.filter(c=>c.id!==p.connectionId));
   try{await call('secrets.delete',{key:p.connectionId});}catch{await write('connections',connections);throw Error('Could not remove the encrypted credential. Retry.');}
   cursors.clear();
  }else if(p.operation==='saveView'){
   const name=typeof p.name==='string'?p.name.trim():'';if(!name||name.length>80)throw Error('Use a view name up to 80 characters.');
   const views=await read('views',[]);if(views.length>=30&&!views.some(v=>v.name===name))throw Error('Use at most 30 saved views.');
   await write('views',[...views.filter(v=>v.name!==name),{id:randomUUID(),name,filters:normalizeFilters(p.filters)}]);
  }else if(p.operation==='deleteView'){
   const views=await read('views',[]);await write('views',views.filter(v=>v.id!==p.id));
  }else throw Error('Unknown operation.');
  return state();
 }
 async function list(p){
  const sequence=++listingSequence,filters=normalizeFilters(p.filters),key=JSON.stringify(filters);let connections=await read('connections',[]);
  if(filters.connectionIds.length)connections=connections.filter(c=>filters.connectionIds.includes(c.id));
  let pages=Object.fromEntries(connections.map(c=>[c.id,1]));
  let saved=null;
  if(p.cursor){saved=cursors.get(p.cursor);if(!saved||saved.key!==key||saved.expires<Date.now())throw Error('This page expired or has invalid filters. Refresh the list.');pages=saved.pages;}
  const results=saved?.pending?.length?saved.results:await Promise.all(connections.filter(c=>pages[c.id]).map(async c=>{
   try{
    const {value:token}=await call('secrets.get',{key:c.id});if(!token)throw Error('Reconnect this account; its encrypted credential is unavailable.');
    const expanded={...filters};for(const field of ['author','assignee','reviewer'])expanded[field]=expanded[field]==='@me'?c.username:expanded[field].replace(/^@/,'');
    const result=await listRequests(c,token,expanded,pages[c.id],fetcher);return {connectionId:c.id,...result};
   }catch(error){return {connectionId:c.id,error:String(error.message).slice(0,300)};}
  }));
  const remaining=saved?.pending?.length?[...saved.pending]:results.flatMap(r=>r.items||[]),items=[];let bytes=0;
  while(remaining.length){const size=Buffer.byteLength(JSON.stringify(remaining[0]));if(bytes+size>30000&&items.length)break;items.push(remaining.shift());bytes+=size;}
  const errors=results.filter(r=>r.error).map(r=>({connectionId:r.connectionId,message:r.error}));
  const nextPages=saved?.pending?.length?saved.pages:Object.fromEntries(results.filter(r=>r.nextPage).map(r=>[r.connectionId,r.nextPage]));let cursor=null;
  if(remaining.length||Object.keys(nextPages).length){cursor=randomUUID();cursors.set(cursor,{key,pages:nextPages,pending:remaining,results:results.map(({items,...metadata})=>metadata),expires:Date.now()+600000});while(cursors.size>30)cursors.delete(cursors.keys().next().value);}
  if(sequence===listingSequence)await write('filters',filters);
  return {items,errors,cursor,limited:results.some(r=>r.limited),connections:results.map(r=>({id:r.connectionId,total:r.total??null})),fetchedAt:new Date().toISOString()};
 }
 return async function dispatch(p={}){
  if(!p||typeof p!=='object'||Array.isArray(p))throw Error('Invalid operation.');
  if(p.operation==='state')return state();
  if(p.operation==='list')return list(p);
  const result=queue.then(()=>mutate(p));queue=result.catch(()=>{});return result;
 };
}

export default function activate(orca){
 const dispatch=createInbox(orca);
 orca.commands.register('inbox',dispatch);
}
