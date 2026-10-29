#!/usr/bin/env node
import fs from 'node:fs';
import {spawn} from 'node:child_process';
const flags=new Set(['profile','agent','worktree','task','model','effort','surface','cli']);
try {
 const options={};
 for(let i=2;i<process.argv.length;i++){
  const arg=process.argv[i];
  if(arg==='--help'){console.log('node scripts/launch-profile.mjs --profile implementer|reviewer|debugger --agent <id> [--worktree <selector>] [--task <text>] [--model <id> --effort <level>] [--surface chat|terminal] [--dry-run] [--cli <executable>]');process.exit(0)}
  if(arg==='--dry-run'){options.dryRun=true;continue}
  const key=arg.slice(2);if(!arg.startsWith('--')||!flags.has(key)||!process.argv[i+1]||process.argv[i+1].startsWith('--'))throw Error('Unknown or missing option: '+arg);
  if(Object.hasOwn(options,key))throw Error('Duplicate option: '+arg);options[key]=process.argv[++i];
 }
 const profiles=JSON.parse(fs.readFileSync(new URL('../profiles/developer-profiles.json',import.meta.url),'utf8')).profiles;
 const profile=profiles.find(p=>p.id===options.profile);if(!profile)throw Error('Choose a known --profile: '+profiles.map(p=>p.id).join(', '));
 if(!options.agent||!/^[a-z0-9][a-z0-9._-]*$/i.test(options.agent))throw Error('Specify a known Orca --agent id.');
 if(options.effort&&!options.model)throw Error('--effort requires --model.');
 if(options.surface&&!['chat','terminal'].includes(options.surface))throw Error('--surface must be chat or terminal.');
 const prompt=profile.prompt+(options.task?'\n\nTask:\n'+options.task:'');if(Buffer.byteLength(prompt)>24000)throw Error('Task is too long; put additional context in a repository file.');
 const args=['agent','launch','--agent',options.agent,'--prompt',prompt];
 for(const key of ['worktree','model','effort','surface'])if(options[key])args.push('--'+key,options[key]);args.push('--json');
 const command=options.cli||process.env.ORCA_CLI_COMMAND||(process.platform==='linux'&&!process.env.ORCA_TERMINAL_ID?'orca-ide':'orca');
 if(options.dryRun)console.log(JSON.stringify({command,args},null,2));
 else {
  const child=spawn(command,args,{stdio:'inherit',shell:false});
  child.on('error',e=>{console.error('Could not start Orca CLI: '+e.message);process.exitCode=1});
  child.on('exit',(code,signal)=>{if(signal)console.error('Orca CLI exited on signal '+signal);process.exitCode=code??1});
 }
}catch(e){console.error(e.message);process.exitCode=1}
