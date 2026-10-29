import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const launcher=path.join(root,'scripts/launch-profile.mjs');
assert(fs.existsSync(launcher),'Developer profile launcher must exist');
const task="Investigate literal $(touch /tmp/orca-profile-unsafe) and 'quotes' without interpreting them";
const preview=spawnSync(process.execPath,[launcher,'--profile','reviewer','--agent','codex','--worktree','active','--task',task,'--dry-run'],{encoding:'utf8'});
assert.equal(preview.status,0,preview.stderr);const invocation=JSON.parse(preview.stdout);
assert.deepEqual(invocation.args.slice(0,4),['agent','launch','--agent','codex']);
assert(invocation.args[invocation.args.indexOf('--prompt')+1].includes(task));
assert.equal(invocation.args[invocation.args.indexOf('--worktree')+1],'active');
assert(!invocation.args.includes('--focus'),'Launch must not steal focus by default');
const invalid=spawnSync(process.execPath,[launcher,'--profile','../../README','--agent','codex','--dry-run'],{encoding:'utf8'});assert.notEqual(invalid.status,0);
const noModel=spawnSync(process.execPath,[launcher,'--profile','reviewer','--agent','codex','--effort','high','--dry-run'],{encoding:'utf8'});assert.notEqual(noModel.status,0);
// A real child process proves that shell metacharacters stay a single argument.
if(process.platform!=='win32'){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'orca-profile-test-'));const fake=path.join(temp,'orca-test');const out=path.join(temp,'argv.json');
 fs.writeFileSync(fake,'#!/usr/bin/env node\nrequire("fs").writeFileSync(process.env.PROFILE_TEST_OUTPUT,JSON.stringify(process.argv.slice(2)));\n',{mode:0o700});
 const result=spawnSync(process.execPath,[launcher,'--profile','reviewer','--agent','codex','--task',task,'--cli',fake],{encoding:'utf8',env:{...process.env,PROFILE_TEST_OUTPUT:out}});
 assert.equal(result.status,0,result.stderr);const args=JSON.parse(fs.readFileSync(out));assert(args[args.indexOf('--prompt')+1].includes(task));
 fs.rmSync(temp,{recursive:true,force:true});
}
console.log('Profile launcher preserves arguments, rejects invalid selections, and launches without a shell.');
