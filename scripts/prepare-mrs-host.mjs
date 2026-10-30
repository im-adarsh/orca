import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));

export function prepareMrsHost(checkout,{apply=false}={}){
 const contract=JSON.parse(fs.readFileSync(path.join(root,'host/contract.json'),'utf8'));
 const patch=path.join(root,'host/native-mrs.patch');
 if(createHash('sha256').update(fs.readFileSync(patch)).digest('hex')!==contract.patchSha256)throw Error('Host patch hash does not match its contract.');
 const cwd=fs.realpathSync(path.resolve(checkout));
 const git=(args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 if(fs.realpathSync(git(['rev-parse','--show-toplevel']))!==cwd)throw Error('Pass the root of the Orca host checkout.');
 if(git(['rev-parse','HEAD'])!==contract.baseCommit)throw Error('Use the exact Orca base commit '+contract.baseCommit+'. No files were changed.');
 const reverse=spawnSync('git',['apply','--reverse','--check',patch],{cwd,stdio:'pipe'});
 if(reverse.status===0)return {status:'already-applied',checkout:cwd,version:contract.hostVersion};
 if(git(['status','--porcelain','--untracked-files=normal']))throw Error('Use a clean host checkout. Existing changes were preserved.');
 try{git(['apply','--check',patch]);}catch{throw Error('The native MRs patch does not apply cleanly. No files were changed.');}
 if(apply)git(['apply',patch]);
 return {status:apply?'applied':'compatible',checkout:cwd,version:contract.hostVersion};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const args=process.argv.slice(2),checkout=args.find(arg=>!arg.startsWith('--'));
 if(!checkout||args.some(arg=>arg.startsWith('--')&&arg!=='--apply')){console.error('Usage: node scripts/prepare-mrs-host.mjs /absolute/orca-host [--apply]');process.exitCode=1;}
 else try{console.log(JSON.stringify(prepareMrsHost(checkout,{apply:args.includes('--apply')}),null,2));}catch(error){console.error(error.message);process.exitCode=1;}
}
