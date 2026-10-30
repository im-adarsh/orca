import test from 'node:test';
import assert from 'node:assert/strict';
import {validateConnection, identity, listRequests} from '../providers.mjs';
import {groupRequests} from '../model.mjs';

const github={id:'gh',provider:'github',baseUrl:'https://github.com',name:'GitHub'};
const gitlab={id:'gl',provider:'gitlab',baseUrl:'https://git.acme.test/team',name:'Company'};
const response=(body,headers={})=>new Response(JSON.stringify(body),{headers});
test('connections reject credentials, query strings and non-HTTPS',()=>{
 for(const baseUrl of ['http://git.test','https://me:secret@git.test','https://git.test?token=x','https://git.test/#x']) assert.throws(()=>validateConnection({...gitlab,baseUrl}));
 assert.equal(validateConnection({...gitlab,baseUrl:'https://git.acme.test/team/'}).baseUrl,gitlab.baseUrl);
});
test('GitHub filters exclude issues and distinguish closed from merged',async()=>{
 let request;await listRequests(github,'secret',{status:'closed',author:'alice',reviewer:'bob',repository:'acme/api',labels:'bug,needs review',draft:'ready',search:'retry "job"'},1,async(url,opts)=>{request={url:new URL(url),opts};return response({items:[],total_count:0})});
 const q=request.url.searchParams.get('q');
 for(const part of ['is:pr','is:closed','is:unmerged','author:alice','review-requested:bob','repo:acme/api','label:"needs review"','draft:false']) assert(q.includes(part),q);
 assert.equal(request.url.origin,'https://api.github.com');assert.equal(request.opts.headers.Authorization,'Bearer secret');assert.equal(request.opts.redirect,'error');
});
test('GitLab preserves instance prefix, nested project and username filters',async()=>{
 let url;await listRequests(gitlab,'token',{status:'merged',repository:'group/sub/api',author:'alice',assignee:'bob',reviewer:'carol',draft:'draft',labels:'bug'},2,async(u)=>{url=new URL(u);return response([])});
 assert.equal(url.pathname,'/team/api/v4/projects/group%2Fsub%2Fapi/merge_requests');
 assert.equal(url.searchParams.get('author_username'),'alice');assert.equal(url.searchParams.get('assignee_username[]'),'bob');assert.equal(url.searchParams.get('reviewer_username'),'carol');assert.equal(url.searchParams.get('wip'),'yes');assert.equal(url.searchParams.get('page'),'2');assert.equal(url.searchParams.get('state'),'merged');
});
test('pagination uses next-page headers without fetching unrelated links',async()=>{
 const result=await listRequests(gitlab,'token',{},1,async()=>response([],{ 'x-next-page':'2','x-total':'42'}));
 assert.equal(result.nextPage,2);assert.equal(result.total,42);
});
test('identity uses configured origin and GitHub Enterprise API prefix',async()=>{
 let url;const result=await identity({...github,baseUrl:'https://github.acme.test'},'token',async(u)=>{url=u;return response({login:'alice'})});
 assert.equal(url,'https://github.acme.test/api/v3/user');assert.equal(result,'alice');
});
test('bad usernames and query injection are rejected before network access',async()=>{
 let called=false;const fetcher=async()=>{called=true;return response({items:[]})};
 await assert.rejects(listRequests(github,'t',{author:'alice is:merged'},1,fetcher));assert.equal(called,false);
 await assert.rejects(listRequests(github,'t',{repository:'acme/api is:merged'},1,fetcher));
});
test('API errors are actionable and do not echo tokens or server content',async()=>{
 await assert.rejects(listRequests(github,'private-token',{},1,async()=>new Response('private-token <script>',{status:401})),e=>e.message.includes('token')&&!e.message.includes('private-token'));
 await assert.rejects(listRequests(github,'t',{},1,async()=>new Response('',{status:429,headers:{'retry-after':'15'}})),/rate limit/i);
});
test('normalizes GitHub PRs and never renders issue results or foreign links',async()=>{
 const item={number:7,title:'Fix',state:'closed',pull_request:{merged_at:'2026-10-01'},html_url:'https://github.com/acme/api/pull/7',repository_url:'https://api.github.com/repos/acme/api',user:{login:'alice'},labels:[{name:'bug'}],updated_at:'2026-10-01'};
 const result=await listRequests(github,'t',{},1,async()=>response({items:[item,{...item,number:8,pull_request:undefined},{...item,number:9,html_url:'https://foreign.test/pull/9'}],total_count:3}));
 assert.equal(result.items.length,1);assert.equal(result.items[0].status,'merged');assert.equal(result.items[0].repository,'acme/api');assert.equal(result.items[0].connectionId,'gh');
});
test('groups by repository AND host AND account, preserving newest group ordering',()=>{
 const item={repository:'acme/api',host:'https://github.com',connectionId:'a',updatedAt:'2026-10-01'};
 const groups=groupRequests([{...item,id:'1'},{...item,id:'2',connectionId:'b'},{...item,id:'3',host:'https://git.acme.test'},{...item,id:'4',repository:'acme/ui',updatedAt:'2026-10-02'},{...item,id:'5'}]);
 assert.equal(groups.length,4);assert.equal(groups[0].repository,'acme/ui');assert.equal(groups.find(g=>g.items.length===2).items.length,2);
});
