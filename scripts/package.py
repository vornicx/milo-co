from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]
with ZipFile(root/'milo-co-shopify.zip','w',ZIP_DEFLATED) as z:
 for directory in ['assets','config','layout','locales','sections','snippets','templates']:
  for f in (root/directory).rglob('*'):
   if f.is_file(): z.write(f,f.relative_to(root))
print('milo-co-shopify.zip')
