const fs = require('node:fs');
const path = require('node:path');
// These two extraction profiles cover the inspected 1.4.244 and 1.4.245 builds.
// Unknown renderer layouts fail closed so verification cannot silently use a copied filter.
function hostFilterSource(assets) {
  const file = fs.readdirSync(assets).find(n => /^document-theme-.*\.js$/.test(n));
  const source = fs.readFileSync(path.join(assets,file),'utf8');
  for (const [startMark,endMark,name] of [
    ['var tt=[[','var J,ut=','lt'],
    ['var _t=[[','var X,Tt=','wt']
  ]) {
    const start = source.indexOf(startMark), end = source.indexOf(endMark,start);
    if (start >= 0 && end > start) return source.slice(start,end)+';globalThis.hostFilter='+name+';';
  }
  throw Error('Host renderer changed; review filter extraction');
}
function hostModule(api,modern,legacy) {
  return require(path.join(api,fs.existsSync(path.join(api,modern+'.js'))?modern:legacy));
}
module.exports = {hostFilterSource,hostModule};
