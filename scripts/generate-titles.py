"""Optional asset-authoring utility. Outputs vector artwork, never font files.
Requires Pillow and a locally installed Chinese typeface. Not needed to run the site.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import os, html
root = Path(__file__).resolve().parents[1]
font_path = os.environ.get('CJK_FONT', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc')
font = ImageFont.truetype(font_path, 20, index=2 if font_path.endswith('.ttc') else 0)
latin = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 18)
items = {
 'slogan-1':('渺见未来',font,3), 'slogan-2':('核聚价值',font,3),
 'brand-title':('渺核科技',font,2), 'about-1':('从微小处',font,3), 'about-2':('构建无限可能',font,3),
 'tokenhub':('TokenHub',latin,0), 'future-1':('未来',font,3), 'future-2':('不止想象',font,3),
}
for name,(text,f,gap) in items.items():
 width=int(sum(f.getlength(c) for c in text)+gap*(len(text)-1)+4)
 image=Image.new('L',(width,30)); draw=ImageDraw.Draw(image); x=1
 if f is latin:
  draw.text((1,1),text,font=f,fill=255,anchor='lt')
 else:
  for c in text:
   draw.text((x,1),c,font=f,fill=255,anchor='lt');x+=f.getlength(c)+gap
 box=image.getbbox(); image=image.crop(box)
 commands=[]
 for y in range(image.height):
  x=0
  while x<image.width:
   if image.getpixel((x,y))>95:
    start=x
    while x<image.width and image.getpixel((x,y))>95: x+=1
    commands.append(f'M{start} {y}h{x-start}v1H{start}z')
   else:x+=1
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {image.width} {image.height}" shape-rendering="crispEdges" role="img" aria-label="{html.escape(text)}"><path fill="#f3f2ed" d="'+''.join(commands)+'"/></svg>'
 (root/'assets'/f'{name}.svg').write_text(svg)
print('Created',len(items),'pixel title artworks.')
