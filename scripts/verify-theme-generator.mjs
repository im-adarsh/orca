import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'im-theme-generator-'));
try{
 for(const relative of ['scripts/generate-popular-themes.mjs','presets/popular-theme-palettes.json','presets/global-theme-design.json','presets/goland-style.json','orca-plugin.json','setup/index.html','themes','docs/popular-theme-adaptations.json']){
  const destination=path.join(temp,relative);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.cpSync(path.join(root,relative),destination,{recursive:true});
 }
 const run=()=>execFileSync(process.execPath,[path.join(temp,'scripts/generate-popular-themes.mjs')],{cwd:temp,stdio:'pipe'});
 function snapshot(){
  const result={};
  function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else result[path.relative(temp,file)]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}}
  walk(temp);return result;
 }
 run();const first=snapshot();run();assert.deepEqual(snapshot(),first,'Repeated generation must be byte-for-byte deterministic');
 const config=path.join(temp,'presets/global-theme-design.json'),bad=JSON.parse(fs.readFileSync(config));bad.themes[0].accent='#INVALID';fs.writeFileSync(config,JSON.stringify(bad));
 const before=snapshot();const rejected=spawnSync(process.execPath,[path.join(temp,'scripts/generate-popular-themes.mjs')],{cwd:temp,encoding:'utf8'});
 assert.notEqual(rejected.status,0,'Malformed external color must be rejected');assert.match(rejected.stderr,/invalid design accent/);assert.deepEqual(snapshot(),before,'Rejected directions must not partially overwrite generated themes');
 console.log('PASS: generator is repeatable and malformed design data cannot partially overwrite the collection');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
