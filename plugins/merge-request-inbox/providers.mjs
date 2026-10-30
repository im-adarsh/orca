import {normalizeFilters} from './model.mjs';
export const PAGE_SIZE=20;

export function validateConnection(input){
 if(!input||!['github','gitlab'].includes(input.provider))throw Error('Choose GitHub or GitLab.');
 const url=new URL(input.baseUrl|| (input.provider==='github'?'https://github.com':'https://gitlab.com'));
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('Use an HTTPS server URL without credentials, query or fragment.');
 const baseUrl=url.href.replace(/\/+$/,'');
 const name=String(input.name||url.host).trim();
 if(!name||name.length>80||/[\u0000-\u001f]/.test(name))throw Error('Use a connection name up to 80 characters.');
 return {provider:input.provider,baseUrl,name,...(input.id?{id:input.id}:{})};
}

function apiBase(connection){
 return connection.provider==='github'?(connection.baseUrl==='https://github.com'?'https://api.github.com':connection.baseUrl+'/api/v3'):connection.baseUrl+'/api/v4';
}

async function request(connection,token,path,fetcher){
 if(typeof token!=='string'||!token.trim()||token.length>8192||/[\r\n]/.test(token))throw Error('Enter a valid access token.');
 let response;
 try{response=await fetcher(apiBase(connection)+path,{headers:{Accept:'application/json',Authorization:'Bearer '+token,...(connection.provider==='github'?{'X-GitHub-Api-Version':'2022-11-28'}:{})},redirect:'error',signal:AbortSignal.timeout(15000)});}catch{throw Error('Could not reach '+new URL(connection.baseUrl).host+'. Check the address, network and TLS trust.');}
 if(response.status===401)throw Error('Authentication failed. Replace the access token.');
 if(response.status===429||response.status===403&&response.headers.get('x-ratelimit-remaining')==='0')throw Error('Provider rate limit reached. Retry after '+(response.headers.get('retry-after')||'the reset time')+'.');
 if(response.status===403)throw Error('Access denied. Check token scopes and repository access.');
 if(response.status===404)throw Error('Repository or API endpoint not found. Check the server URL and repository path.');
 if(!response.ok)throw Error('Provider request failed (HTTP '+response.status+').');
 const reader=response.body?.getReader();let bytes=0,text='';const decoder=new TextDecoder();
 if(!reader)throw Error('Provider returned an empty response.');
 try{while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>2*1024*1024)throw Error('Provider response is too large. Narrow the repository filter.');text+=decoder.decode(chunk.value,{stream:true});}text+=decoder.decode();}finally{await reader.cancel().catch(()=>{});}
 let body;try{body=JSON.parse(text);}catch{throw Error('Provider returned invalid JSON. Check the API server URL.');}
 return {body,headers:response.headers};
}

export async function identity(connection,token,fetcher=fetch){
 const {body}=await request(validateConnection(connection),token,'/user',fetcher);
 const username=connection.provider==='github'?body.login:body.username;
 if(typeof username!=='string'||!username||username.length>100)throw Error('The server did not return an authenticated username.');
 return username;
}

function row(connection,item){
 const github=connection.provider==='github';
 if(!item||github&&!item.pull_request)return null;
 const rawUrl=github?item.html_url:item.web_url;let url;try{url=new URL(rawUrl);}catch{return null;}
 const base=new URL(connection.baseUrl);
 if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname.replace(/\/$/,'')+'/'))return null;
 if(github?!/\/pull\/\d+$/.test(url.pathname):! /\/-\/merge_requests\/\d+$/.test(url.pathname))return null;
 const repository=github?url.pathname.split('/').slice(1,-2).join('/'):decodeURIComponent(url.pathname.slice(base.pathname.replace(/\/$/,'').length).split('/-/merge_requests/')[0].replace(/^\//,''));
 const number=github?item.number:item.iid;
 if(!Number.isSafeInteger(number)||number<1||!repository)return null;
 const status=github?(item.pull_request.merged_at?'merged':item.state==='open'?'open':'closed'):(item.state==='merged'?'merged':item.state==='opened'?'open':'closed');
 return {id:JSON.stringify([connection.id,repository,number]),connectionId:connection.id,provider:connection.provider,host:connection.baseUrl,repository,number,title:String(item.title||'Untitled').slice(0,512),url:url.href,status,draft:Boolean(item.draft||item.work_in_progress),author:String(github?item.user?.login||'':item.author?.username||'').slice(0,100),labels:(Array.isArray(item.labels)?item.labels:[]).slice(0,8).map(label=>String(typeof label==='string'?label:label.name||'').slice(0,60)),updatedAt:String(item.updated_at||'').slice(0,30)};
}

export async function listRequests(input,token,inputFilters={},page=1,fetcher=fetch){
 const connection={...validateConnection(input),id:input.id};const f=normalizeFilters(inputFilters);
 if(!Number.isInteger(page)||page<1||page>1000)throw Error('Invalid page.');
 let path;
 if(connection.provider==='github'){
  if(f.repository&&f.repository.split('/').length!==2)throw Error('GitHub repositories use owner/repository.');
  const q=['is:pr',f.status==='open'?'is:open':f.status==='merged'?'is:merged':f.status==='closed'?'is:closed is:unmerged':''];
  if(f.search)q.push(JSON.stringify(f.search));
  for(const [key,qualifier]of [['repository','repo'],['author','author'],['assignee','assignee'],['reviewer','review-requested']])if(f[key])q.push(qualifier+':'+f[key]);
  for(const label of f.labels.split(',').map(x=>x.trim()).filter(Boolean))q.push('label:'+JSON.stringify(label));
  if(f.draft!=='any')q.push('draft:'+(f.draft==='draft'));
  path='/search/issues?'+new URLSearchParams({q:q.filter(Boolean).join(' '),sort:'updated',order:'desc',per_page:String(PAGE_SIZE),page:String(page)});
 }else{
  const params=new URLSearchParams({scope:'all',order_by:'updated_at',sort:'desc',per_page:String(PAGE_SIZE),page:String(page)});
  if(f.status!=='all')params.set('state',f.status==='open'?'opened':f.status);
  for(const [key,param]of [['author','author_username'],['assignee','assignee_username[]'],['reviewer','reviewer_username'],['labels','labels'],['search','search']])if(f[key])params.set(param,f[key]);
  if(f.draft!=='any')params.set('wip',f.draft==='draft'?'yes':'no');
  path=(f.repository?'/projects/'+encodeURIComponent(f.repository):'')+'/merge_requests?'+params;
 }
 const {body,headers}=await request(connection,token,path,fetcher);
 const data=connection.provider==='github'?body.items:body;
 if(!Array.isArray(data))throw Error('The server returned an unexpected request list.');
 const items=data.map(item=>row(connection,item)).filter(Boolean);
 const github=connection.provider==='github';const count=github?body.total_count:Number(headers.get('x-total')||NaN);
 const total=Number.isSafeInteger(count)&&count>=0?count:null;
 const next=github?(total===null?data.length===PAGE_SIZE:page*PAGE_SIZE<Math.min(total,1000)):headers.has('x-next-page')?Boolean(headers.get('x-next-page')):data.length===PAGE_SIZE;
 return {items,nextPage:next?page+1:null,total,limited:Boolean(github&&(body.incomplete_results||total>1000))};
}
