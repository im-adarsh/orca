#!/usr/bin/env python3
"""Validate portable icon artifacts without launching Orca or loading remote content."""
import hashlib,json,re,sys,xml.etree.ElementTree as ET
from pathlib import Path
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'orca-plugin.json').read_text())
assert manifest['manifestVersion']==2 and manifest['execution']=='data'
assert manifest['publisher']=='im-adarsh' and manifest['id']=='jetbrains-icons'
assert manifest['engines']['orca']=='>=1.4.245'
assert not manifest.get('capabilities') and 'pluginApi' not in manifest and 'main' not in manifest
expected={'new-ui-dark','new-ui-light','classic-dark','classic-light'}
assert {t['id'] for t in manifest['contributes']['iconThemes']}==expected
provenance=json.loads((root/'provenance.json').read_text())
assets={p['localPath']:p for p in provenance['assets']}
for local,record in assets.items():
 p=root/local;data=p.read_bytes();assert hashlib.sha256(data).hexdigest()==record['sha256'],local
 if record['origin']=='JetBrains':
  assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==record['gitBlobSha1'],local
allowed={'svg','path','rect','circle','ellipse','line','polyline','polygon','g','defs','linearGradient','radialGradient','stop','clipPath','mask','title','desc'}
for rel in sorted(assets):
 if not rel.endswith('.svg'):continue
 data=(root/rel).read_bytes();assert len(data)<=65536,rel
 assert b'<!DOCTYPE' not in data and b'<!ENTITY' not in data,rel
 tree=ET.fromstring(data)
 assert tree.tag.split('}')[-1]=='svg',rel
 for el in tree.iter():
  tag=el.tag.split('}')[-1];assert tag in allowed,(rel,tag)
  for attr,value in el.attrib.items():
   key=attr.split('}')[-1].lower()
   assert not key.startswith('on'),(rel,key)
   assert key not in {'href','src','style'},(rel,key)
   assert not re.search(r'https?:|data:|javascript:|expression\s*\(',value,re.I),(rel,key,value)
   for ref in re.findall(r'url\s*\([^)]*\)',value,re.I):assert re.fullmatch(r'url\(\s*#[A-Za-z_][\w.-]*\s*\)',ref,re.I),(rel,key,value)
for entry in manifest['contributes']['iconThemes']:
 p=root/entry['path'];assert p.stat().st_size<=16384
 theme=json.loads(p.read_text());assert set(theme)=={'schemaVersion','icons','fileNames','fileExtensions'}
 assert theme['schemaVersion']==1
 assert set(theme['icons'])=={'file','folder','folder-open'}
 keys=list(theme['icons'])+list(theme['fileNames'])+list(theme['fileExtensions']);assert len(keys)<=512
 assert len(theme['fileNames'])>=35 and len(theme['fileExtensions'])>=70
 for family in ['fileNames','fileExtensions']:
  ks=list(theme[family]);assert len(ks)==len({k.lower() for k in ks})
 for k in theme['fileNames']:assert 0<len(k)<=128 and not re.search(r'[\\/\x00-\x1f]',k)
 for k in theme['fileExtensions']:assert re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9+._-]{0,31}',k)
 for rel in list(theme['icons'].values())+list(theme['fileNames'].values())+list(theme['fileExtensions'].values()):
  assert rel in assets,(entry['id'],rel)
  assert not Path(rel).is_absolute() and '..' not in Path(rel).parts and '\\' not in rel
 print(f"{entry['id']}: {len(keys)} mappings, {len(set(theme['icons'].values())|set(theme['fileNames'].values())|set(theme['fileExtensions'].values()))} SVGs")
assert 'Apache License' in (root/'LICENSE.txt').read_text()
assert 'JetBrains' in (root/'NOTICE.txt').read_text()
print(f"PASS: {len(expected)} themes; {len(assets)} provenance records; SVGs have no scripts, fonts or remote references")
