import fs from 'node:fs';
const base=new URL('../plugins/merge-request-inbox/',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,base),'utf8');
const script=read('model.mjs').replaceAll('export ','')+'\n'+read('panel.js');
const html=read('panel-template.html').replace('/*__STYLES__*/',read('panel.css')).replace('/*__SCRIPT__*/',script.replaceAll('</script','<\\/script'));
const out=new URL('panel.html',base);
if(process.argv.includes('--check')){if(!fs.existsSync(out)||fs.readFileSync(out,'utf8')!==html)throw Error('MRs panel is stale. Run npm run build:mrs.');}else fs.writeFileSync(out,html);
console.log('MRs panel '+(process.argv.includes('--check')?'is current.':'built.'));
