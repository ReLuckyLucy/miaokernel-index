/** Build a genuinely self-contained HTML. No bundler or dependencies. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let html=await readFile(path.join(root,'index.html'),'utf8');
const css=await readFile(path.join(root,'styles.css'),'utf8');
html=html.replace('<link rel="stylesheet" href="styles.css">',()=>'<style>\n'+css+'\n</style>');
for(const name of ['core','visuals','app']){
 const js=await readFile(path.join(root,'js',name+'.js'),'utf8');
 html=html.replace(new RegExp(`^[ \\t]*<script defer src="js/${name}\\.js"></script>(?:\\r?\\n|$)`,'m'),'');
 html=html.replace('</body>',()=>`<script>\n${js.replace(/<\/script/gi,'<\\/script')}\n</script>\n</body>`);
}
const assets=[...new Set([...html.matchAll(/(?:src|href)="(assets\/[^"\s]+)"/g)].map(m=>m[1]))];
for(const name of assets){
 const bytes=await readFile(path.join(root,name));
 html=html.replaceAll(`"${name}"`,`"data:image/svg+xml;base64,${bytes.toString('base64')}"`);
}
await mkdir(path.join(root,'dist'),{recursive:true});
await writeFile(path.join(root,'dist','index.html'),html);
console.log(`Built dist/index.html — ${Math.ceil(Buffer.byteLength(html)/1024)} KB, all assets embedded.`);
