#!/usr/bin/env python3
"""Rebuild declarative maps and the contact sheet from the bundled pinned SVG set."""
from pathlib import Path
import hashlib,json,html
root=Path(__file__).resolve().parents[1]
provenance=json.loads((root/'provenance.json').read_text())
provenance['assets']=[a for a in provenance['assets'] if a['origin']!='Original']
# Available community file-type artwork is intentionally used only for its matching category.
groups={
 'text':'txt log text nfo', 'markdown':'md markdown mdx', 'rst':'rst rest',
 'javaScript':'js jsx mjs cjs', 'typeScript':'ts tsx mts cts', 'java':'java', 'javaClass':'class',
 'Csharp':'cs csx', 'c':'c', 'h':'h', 'cpp':'cc cpp cxx c++ hpp hh hxx',
 'css':'css scss sass less styl', 'html':'html htm', 'xhtml':'xhtml',
 'json':'json jsonc json5 geojson ipynb-json', 'yaml':'yaml yml', 'xml':'xml xaml plist svg',
 'toml':'toml', 'properties':'properties ini cfg conf env cnf', 'config':'config lock settings',
 'archive':'zip gz bz2 xz tar tgz 7z rar jar war ear zst',
 'image':'png jpg jpeg gif webp bmp ico icns avif tif tiff heic',
 'binaryData':'bin dat db sqlite sqlite3 so dylib dll exe wasm o a lib',
 'shell':'sh bash zsh fish command ps1 bat cmd', 'sql':'sql ddl', 'docker':'dockerfile',
 'terraform':'tf tfvars', 'gradle':'gradle', 'groovy':'groovy gvy',
 'graphql':'graphql gql', 'vue':'vue', 'swiftLang':'swift', 'perl':'pl pm',
 'font':'ttf otf woff woff2', 'csv':'csv tsv', 'patch':'patch diff', 'sourceMap':'map',
 'jupyter':'ipynb', 'dtd':'dtd', 'xsdFile':'xsd', 'wsdlFile':'wsdl', 'http':'http rest-http',
 'jsp':'jsp', 'jspx':'jspx',
 'regexp':'regex regexp', 'go':'go',
 'code-fallback':'py pyi pyw rb rake rs kt kts dart lua r ex exs erl hrl hs lhs clj cljs cljc edn scala sc sml ml mli fs fsx fsi php phtml svelte nim zig v sol proto',
}
name_categories={
 '.gitignore':'gitignore','.gitattributes':'gitignore','.gitmodules':'gitignore','.gitkeep':'gitignore',
 '.editorconfig':'editorConfig','.env':'config','.env.local':'config','.env.example':'config','.env.production':'config',
 '.npmrc':'config','.nvmrc':'config','.yarnrc':'config','.yarnrc.yml':'yaml','.prettierrc':'config','.prettierrc.json':'json',
 '.eslintrc':'config','.eslintrc.json':'json','.eslintrc.js':'javaScript','eslint.config.js':'javaScript','eslint.config.mjs':'javaScript',
 'package.json':'json','package-lock.json':'json','tsconfig.json':'json','jsconfig.json':'json','composer.json':'json',
 'deno.json':'json','deno.jsonc':'json','biome.json':'json','components.json':'json','angular.json':'json',
 'dockerfile':'docker','containerfile':'docker','docker-compose.yml':'yaml','docker-compose.yaml':'yaml','compose.yml':'yaml','compose.yaml':'yaml',
 'makefile':'config','gnumakefile':'config','cmakelists.txt':'config','justfile':'config','jenkinsfile':'config','procfile':'config',
 'go.mod':'go','go.sum':'go','go.work':'go','go.work.sum':'go',
 'cargo.toml':'toml','cargo.lock':'config','pyproject.toml':'toml','poetry.lock':'config','requirements.txt':'text','pipfile':'config','pipfile.lock':'json',
 'gemfile':'code-fallback','gemfile.lock':'config','rakefile':'code-fallback','pubspec.yaml':'yaml','pubspec.lock':'yaml',
 'build.gradle':'gradle','settings.gradle':'gradle','gradlew':'shell','gradlew.bat':'shell','pom.xml':'xml','manifest.mf':'manifest',
 'readme':'text','readme.md':'markdown','readme.rst':'rst','changelog.md':'markdown','contributing.md':'markdown','agents.md':'markdown','claude.md':'markdown',
 'license':'text','license.txt':'text','license.md':'markdown','notice':'text','notice.txt':'text','copying':'text',
 '.htaccess':'htaccess','.htpasswd':'config','robots.txt':'text','favicon.ico':'image','bun.lock':'config','yarn.lock':'config','pnpm-lock.yaml':'yaml',
 'workspace.xml':'xml','modules.xml':'xml','config.json':'json','config.yaml':'yaml','config.yml':'yaml',
}
variants=[('new-ui-dark','JetBrains New UI Dark','new-ui',True),('new-ui-light','JetBrains New UI Light','new-ui',False),('classic-dark','JetBrains Classic Dark','classic',True),('classic-light','JetBrains Classic Light','classic',False)]
originals={}
for id,title,family,dark in variants:
 line=('#CED0D6' if dark else '#6C707E') if family=='new-ui' else ('#AEB8C2' if dark else '#70777D')
 fill=('#43454A' if dark else '#EBECF0') if family=='new-ui' else ('#697883' if dark else '#9AA7B0')
 accent='#56A8F5' if dark else '#087E8B'
 drawings={
  'go':f'<path d="M7.1 5.7A2.7 2.7 0 1 0 7.1 10V8H5" stroke="{accent}"/><circle cx="11.4" cy="8" r="2.6" stroke="{accent}"/>',
  'code-fallback':f'<path d="M9.5 1.5H3.5v13h9V5zM9.5 1.5V5h3" stroke="{line}"/><path d="m6 7-2 2 2 2m4-4 2 2-2 2" stroke="{accent}"/>',
  'folder-open':f'<path d="M1.5 5.5v-2h4l2 2h5v2" fill="{fill}" stroke="{line}"/><path d="m1.5 6.5 2 7h10l1-7z" fill="{fill}" stroke="{line}"/>',
 }
 for kind,paths in drawings.items():
  rel=f'assets/original/{id}/{kind}.svg';p=root/rel;p.parent.mkdir(parents=True,exist_ok=True)
  data=f'<!-- Original artwork by im-adarsh; Apache-2.0. No JetBrains or GoLand artwork used. -->\n<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">{paths}</svg>\n'.encode();p.write_bytes(data)
  originals[rel]={'origin':'Original','localPath':rel,'author':'im-adarsh','license':'Apache-2.0','sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'description':{'go':'Original geometric G/o glyph; not the GoLand or Go logo','code-fallback':'Neutral code document for languages lacking community file-type artwork','folder-open':'Original expanded folder indicator'}[kind]}
used=set();report=[];theme_records=[]
for id,title,family,dark in variants:
 fallbacks={}
 def pick(category):
  if category in ['go','code-fallback','folder-open']:return f'assets/original/{id}/{category}.svg'
  candidates=[category]
  if category=='xsdFile':candidates=['xsd' if family=='new-ui' else 'xsdFile']
  if category=='wsdlFile':candidates=['wsdl' if family=='new-ui' else 'wsdlFile']
  if category in ['markdown','rst','csv','shell','sql','terraform','toml','docker','gitignore','editorConfig','gradle','font','patch','sourceMap'] and family=='classic':candidates=[category,'config' if category in ['docker','gitignore','editorConfig','gradle','terraform','toml'] else 'text']
  if category in ['typeScript','c','h','cpp','groovy','graphql','vue','swiftLang','perl'] and family=='classic':
   fallbacks[category]='original neutral code document';return f'assets/original/{id}/code-fallback.svg'
  for cat in candidates:
   for suffix in (['_dark',''] if dark else ['']):
    rel=f'assets/{family}/{cat}{suffix}.svg'
    if (root/rel).is_file():
     if cat!=category:fallbacks[category]=cat
     return rel
  fallbacks[category]='unknown';return f'assets/{family}/unknown'+('_dark' if dark and (root/f'assets/{family}/unknown_dark.svg').exists() else '')+'.svg'
 extensions={ext:pick(cat) for cat,extensions in groups.items() for ext in extensions.split()}
 names={name:pick(cat) for name,cat in name_categories.items()}
 artifact={'schemaVersion':1,'icons':{'file':pick('unknown'),'folder':pick('folder'),'folder-open':pick('folder-open')},'fileNames':names,'fileExtensions':extensions}
 dest=root/f'themes/{id}.json';dest.parent.mkdir(exist_ok=True);dest.write_text(json.dumps(artifact,indent=2)+'\n')
 paths=set(artifact['icons'].values())|set(names.values())|set(extensions.values());used.update(paths)
 report.append({'id':id,'title':title,'mode':'dark' if dark else 'light','mappings':3+len(names)+len(extensions),'fileNames':len(names),'fileExtensions':len(extensions),'uniqueSvgs':len(paths),'fallbackCategories':fallbacks})
 theme_records.append({'id':id,'title':title,'path':f'themes/{id}.json'})
# Ship only referenced SVGs, plus the original licensing files.
kept=[]
for record in provenance['assets']:
 rel=record['localPath']
 if not rel.endswith('.svg') or rel in used:kept.append(record)
 else:(root/rel).unlink()
kept.extend(originals[rel] for rel in sorted(used) if rel in originals)
provenance['assets']=sorted(kept,key=lambda x:x['localPath']);provenance['mappingSummary']=report
provenance['notes']=['JetBrains SVGs and upstream license/notice are copied without modification from the pinned commit.','Dark themes prefer upstream _dark.svg; files with no upstream dark variant use the upstream shared variant.','Go, neutral code fallback, and expanded folder SVGs are original geometric artwork, not proprietary GoLand/Go icons.','Classic themes use their own community file-type artwork; absent categories use a documented classic neutral fallback rather than New UI artwork.','Maps are per-file and per-extension only; Orca does not support folder-name mappings in this contract.']
(root/'provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
manifest={'manifestVersion':2,'id':'jetbrains-icons','publisher':'im-adarsh','name':'JetBrains File Icons','version':'1.0.1','execution':'data','description':'Pinned Apache-licensed JetBrains New UI and Classic file icons, with light/dark choices and clearly identified original fallbacks.','license':'Apache-2.0','repository':'https://github.com/im-adarsh/orca','engines':{'orca':'>=1.4.245'},'contributes':{'iconThemes':theme_records},'capabilities':[]}
(root/'orca-plugin.json').write_text(json.dumps(manifest,indent=2)+'\n')
# Static local contact sheet, using only the artifacts shipped with this plugin.
sections=[]
for record in report:
 artifact=json.loads((root/f"themes/{record['id']}.json").read_text());samples=[('file',artifact['icons']['file']),('folder',artifact['icons']['folder']),('folder open',artifact['icons']['folder-open'])]+[(name,artifact['fileNames'].get(name.lower()) or artifact['fileExtensions'].get(name.rsplit('.',1)[-1]) or artifact['icons']['file']) for name in ['main.go','go.mod','main.ts','main.js','App.tsx','Main.java','model.py','lib.rs','main.c','Main.kt','app.dart','main.swift','Cargo.toml','package.json','Dockerfile','Makefile','.gitignore','.editorconfig','README.md','styles.css','index.html','schema.graphql','query.sql','config.yaml','config.xml','logo.png','bundle.zip','database.sqlite','index.map','notebook.ipynb','index.jsp','view.jspx']]
 sections.append('<section class="'+record['mode']+'"><h2>'+html.escape(record['title'])+'</h2><p>'+str(record['mappings'])+' mappings · '+str(record['uniqueSvgs'])+' SVGs</p><div class="grid">'+''.join('<div><img src="'+html.escape(rel)+'" alt=""><span>'+html.escape(name)+'</span></div>' for name,rel in samples)+'</div></section>')
page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JetBrains File Icons · Contact sheet</title><style>*{box-sizing:border-box}body{margin:0;padding:28px;background:#dfe1e5;font:14px/1.5 system-ui,sans-serif;color:#27282e}h1{margin:0 0 6px}body>p{margin:0 0 24px}main{display:grid;grid-template-columns:1fr 1fr;gap:24px}section{padding:24px;border-radius:12px}.dark{background:#1e1f22;color:#dfe1e5}.light{background:#fff;color:#27282e}h2{margin:0;font-size:18px}section p{opacity:.7;margin:4px 0 20px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.grid div{display:flex;gap:10px;align-items:center;min-width:0}.grid img{width:16px;height:16px;flex-shrink:0}.grid span{overflow-wrap:anywhere;font-family:ui-monospace,monospace;font-size:12px}@media(max-width:850px){main{grid-template-columns:1fr}}@media(max-width:420px){body{padding:12px}section{padding:18px}.grid{grid-template-columns:1fr}}</style><h1>JetBrains File Icons</h1><p>Local SVG previews · New UI and Classic · Original Go and neutral code fallbacks are documented in README.</p><main>'+''.join(sections)+'</main></html>'
(root/'preview.html').write_text(page)
print(json.dumps(report,indent=2))
