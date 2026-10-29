// Hash-compatible transcription for a valid portable plugin tree.
// Source 41bfe43ebb9213e0aebb84455faa1cc3585a5e5a/src/main/plugins/plugin-content-hash.ts
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function hashPluginTree(root){
 const files=[];let entries=0,totalBytes=0;
 function walk(dir){
  const names=fs.readdirSync(dir).sort((a,b)=>a<b?-1:a>b?1:0);
  for(const name of names){
   if(dir===root&&name==='.git')continue;
   if(++entries>2000)throw Error('plugin exceeds 2000-entry limit');
   const full=path.join(dir,name),stat=fs.lstatSync(full);
   if(stat.isSymbolicLink())throw Error('symlink not allowed');
   if(stat.isDirectory())walk(full);
   else if(stat.isFile()){totalBytes+=stat.size;if(totalBytes>50*1024*1024)throw Error('plugin exceeds50MiB');files.push({full,size:stat.size})}
   else throw Error('unsupported plugin entry type');
  }
 }
 walk(root);const hash=crypto.createHash('sha256');hash.update('orca-plugin-tree-v1\0');
 function length(n){const b=Buffer.alloc(8);b.writeBigUInt64BE(BigInt(n));hash.update(b)}
 for(const file of files){const rel=path.relative(root,file.full).replaceAll('\\','/');const bytes=fs.readFileSync(file.full);if(bytes.length!==file.size)throw Error('file changed');length(Buffer.byteLength(rel,'utf8'));hash.update(rel,'utf8');length(bytes.length);hash.update(bytes)}
 return {hash:hash.digest('hex'),fileCount:files.length,totalBytes};
}
module.exports={hashPluginTree};
if(require.main===module)console.log(JSON.stringify(hashPluginTree(path.resolve(process.argv[2])),null,2));
