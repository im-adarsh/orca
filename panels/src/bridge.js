const pending=new Map();let sequence=0;
function callHost(action,params={}){
 if(window.parent===window)return Promise.reject(Error('Open this panel inside Orca to choose a terminal.'));
 return new Promise((resolve,reject)=>{const requestId='developer-'+Date.now()+'-'+(++sequence);const timer=setTimeout(()=>{pending.delete(requestId);reject(Error('Orca did not respond. Refresh the terminal list and try again.'))},8000);pending.set(requestId,{resolve,reject,timer});window.parent.postMessage({type:'orca-panel-action',requestId,action,params},'*')});
}
window.addEventListener('message',event=>{if(event.source!==window.parent)return;const d=event.data;if(!d||d.type!=='orca-panel-action-result'||typeof d.requestId!=='string')return;const p=pending.get(d.requestId);if(!p)return;clearTimeout(p.timer);pending.delete(d.requestId);d.ok?p.resolve(d.value):p.reject(Error(d.error||'Orca refused the panel action.'))});
const terminalSelect=document.querySelector('#terminal'),pasteButton=document.querySelector('#paste'),status=document.querySelector('#status');
let busy=false;
function report(text){status.textContent=text}
async function refreshTerminals(){
 const chosen=terminalSelect.value;terminalSelect.replaceChildren(new Option('Choose a terminal',''));pasteButton.disabled=true;
 try{const context=await callHost('workspace.readContext');if(!context){report('Select a workspace in Orca, then refresh.');return}document.querySelector('#workspace').textContent=context.displayName+' · '+context.branch;for(const [i,t]of context.terminals.entries())terminalSelect.add(new Option('Terminal '+(i+1)+' · '+t.id,t.id));if([...terminalSelect.options].some(o=>o.value===chosen))terminalSelect.value=chosen;pasteButton.disabled=!terminalSelect.value;if(!context.terminals.length)report('Open a terminal in this workspace, then refresh.');else report('Choose the intended terminal. Nothing has been pasted.')}catch(e){report(e.message)}
}
terminalSelect.addEventListener('change',()=>{pasteButton.disabled=busy||!terminalSelect.value});
document.querySelector('#refresh').addEventListener('click',refreshTerminals);
pasteButton.addEventListener('click',async()=>{
 if(busy)return;const terminalId=terminalSelect.value;if(!terminalId)return;
 const raw=document.querySelector('#payload').value;const text=raw.replace(/[\r\n\t]+/g,' ').trim();
 if(!text||text.length>4096||/[\u0000-\u001f\u007f]/.test(text)){report('Use nonempty plain text, up to 4096 characters, without control characters.');return}
 busy=true;pasteButton.disabled=true;
 try{const context=await callHost('workspace.readContext');if(!context?.terminals.some(t=>t.id===terminalId)){terminalSelect.value='';throw Error('That terminal is no longer in the focused workspace. Refresh and choose again.')}const result=await callHost('terminal.sendText',{terminalId,text,enter:false});if(!result?.accepted)throw Error('The terminal did not accept the text.');report('Pasted as one line. Review it in the terminal and press Enter when ready.')}catch(e){report(e.message)}finally{busy=false;pasteButton.disabled=!terminalSelect.value}
});
refreshTerminals();
