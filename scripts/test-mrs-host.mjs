import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {prepareMrsHost} from './prepare-mrs-host.mjs';
const source=process.argv[2];if(!source)throw Error('Pass an Orca source checkout containing the pinned base commit.');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mrs-patch-test-')),target=path.join(temp,'host');
try{
 execFileSync('git',['clone','--shared','--no-checkout',path.resolve(source),target],{stdio:'pipe'});
 execFileSync('git',['-C',target,'checkout','--detach','400266a9ce259337ec46836c2a8e18a449d49f4a'],{stdio:'pipe'});
 const gitDir=path.join(target,'.git');
 const headFile=path.join(gitDir,'HEAD'),originalHead=fs.readFileSync(headFile,'utf8');
 // A valid alternate commit is not required: compatibility must reject any different HEAD.
 fs.writeFileSync(headFile,'0'.repeat(40)+'\n');
 assert.throws(()=>prepareMrsHost(target),/exact Orca base/);
 fs.writeFileSync(headFile,originalHead);
 assert.equal(prepareMrsHost(target).status,'compatible');
 fs.writeFileSync(path.join(target,'user-work.txt'),'preserve me');
 assert.throws(()=>prepareMrsHost(target,{apply:true}),/clean/);assert.equal(fs.readFileSync(path.join(target,'user-work.txt'),'utf8'),'preserve me');fs.unlinkSync(path.join(target,'user-work.txt'));
 assert.equal(prepareMrsHost(target,{apply:true}).status,'applied');
 assert.equal(prepareMrsHost(target,{apply:true}).status,'already-applied');
 assert.equal(JSON.parse(fs.readFileSync(path.join(target,'package.json'),'utf8')).version,'1.4.245-mrs.1');
 console.log('Host patch: exact-base dry run, dirty-checkout refusal, application and idempotence passed.');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
