"""Render and test the built, self-contained page in Chromium.
This test uses set_content: it does not need network or navigation privileges.
Requires Python Playwright plus Chromium. It does not test a public deployment.
"""
import argparse, json, os, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--screenshots',default=str(ROOT/'previews'));args=parser.parse_args()
shots=Path(args.screenshots);shots.mkdir(parents=True,exist_ok=True)
html=(ROOT/'dist'/'index.html').read_text(encoding='utf-8')
executable=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
report=[];errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=executable,args=['--no-sandbox'])
 def page_at(width,height,**kwargs):
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,**kwargs)
  page.set_default_timeout(5000);page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load');page.wait_for_timeout(600)
  return page
 page=page_at(1440,900)
 assert page.evaluate('typeof window.MiaoheVisual')=='object'
 assert page.locator('h1').get_attribute('aria-label')=='渺见未来，核聚价值'
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 assert page.evaluate('Array.from(document.images).every(x=>x.complete && x.naturalWidth>0)')
 page.screenshot(path=str(shots/'desktop-home.png'))
 page.locator('#motion-toggle').click();assert page.locator('#motion-toggle').get_attribute('aria-pressed')=='true'
 assert page.evaluate('MiaoheVisual.getState().paused')
 first=page.locator('#universe').evaluate('(c)=>c.toDataURL()');page.wait_for_timeout(250)
 assert first==page.locator('#universe').evaluate('(c)=>c.toDataURL()'),'pause did not stop drawing'
 page.locator('#rain-toggle').click();assert page.locator('#rain-toggle').get_attribute('aria-pressed')=='true'
 assert page.evaluate('MiaoheVisual.getState().rain')
 page.locator('#rain-toggle').click();page.locator('#motion-toggle').click()
 page.locator('.desktop-nav a[href="#about"]').click();page.wait_for_timeout(1500)
 assert page.locator('.desktop-nav a[href="#about"]').get_attribute('aria-current')=='location'
 page.screenshot(path=str(shots/'desktop-about.png'))
 page.locator('.desktop-nav a[href="#projects"]').click();page.wait_for_timeout(1500)
 assert abs(page.locator('#projects').bounding_box()['y'])<5
 page.screenshot(path=str(shots/'desktop-project.png'))
 page.locator('#project-info').click();assert page.locator('#project-dialog').is_visible()
 page.keyboard.press('Escape');assert not page.locator('#project-dialog').is_visible()
 page.locator('#copy-project').click();page.wait_for_timeout(100)
 assert '复制' in page.locator('#toast').inner_text()
 page.locator('.desktop-nav a[href="#future"]').click();page.wait_for_timeout(2900)
 page.screenshot(path=str(shots/'desktop-future.png'))
 assert not errors,errors
 report.append('1440x900: assets, scene navigation, canvas, pause, rain, modal, copy feedback, console passed')
 page.close()
 for width,height in [(1024,768),(768,1024),(390,844),(320,740)]:
  page=page_at(width,height)
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'overflow {width}'
  if width==390:page.screenshot(path=str(shots/'mobile-home.png'))
  if width<761:
   page.locator('.menu-toggle').click();assert page.locator('#mobile-nav').is_visible()
   page.locator('#mobile-nav a[href="#projects"]').click();page.wait_for_timeout(1300)
   assert not page.locator('#mobile-nav').is_visible()
   assert abs(page.locator('#projects').bounding_box()['y'])<5
  if width==390:
   page.screenshot(path=str(shots/'mobile-project.png'))
   page.locator('#projects').screenshot(path=str(shots/'mobile-project-full.png'))
  report.append(f'{width}x{height}: no horizontal overflow; mobile navigation passed where applicable')
  page.close()
 reduced=page_at(1440,900,reduced_motion='reduce')
 assert reduced.evaluate('MiaoheVisual.getState().reduced')
 assert reduced.evaluate('MiaoheVisual.getState().paused')
 assert reduced.locator('#motion-toggle').is_disabled()
 report.append('reduced-motion: static render and motion controls passed')
 nojs=browser.new_context(java_script_enabled=False);np=nojs.new_page();np.set_content(html,wait_until='load')
 assert np.locator('h1').is_visible()
 assert np.locator('#projects .pixel-button').get_attribute('href')=='https://tokenhub-tunnel.apps.gdmuna.com/'
 report.append('no JavaScript: content and project entry remain available')
 assert not errors,errors
 browser.close()
(shots/'test-report.json').write_text(json.dumps({'mode':'isolated Chromium, HTML injected in memory; no external navigation','passed':report,'page_errors':errors},ensure_ascii=False,indent=2),encoding='utf-8')
print('\n'.join(report))
