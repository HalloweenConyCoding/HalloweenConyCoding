"""Functional checks for the nested portfolio entry; requires local HTTP serving."""
import argparse
import json
import hashlib
import math
from pathlib import Path
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:8123'
URL = BASE + '/mainpage_version/ACTIVE/'
checks = 0

def check(value, message):
    global checks
    assert value, message
    checks += 1

def content(browser):
    context = browser.new_context(java_script_enabled=False)
    page = context.new_page()
    response = page.goto(URL, wait_until='load')
    check(response.status == 200 and page.locator('[data-chapter]').count() == 4, 'Four chapters must exist')
    check(page.locator('main').count() == 1, 'One main landmark')
    check('Chatchon' in page.locator('h1').inner_text(), 'Name heading')
    page.locator('.skills summary').click()
    text = page.locator('main').inner_text()
    check(all(term in text for term in ['AIS','Python','SQL','Radio Planning','CodeSnippet','Task Planner','CONY']), 'Portfolio content retained')
    page.locator('.biography summary').click()
    check('Chulalongkorn University' in page.locator('.biography').inner_text(), 'Biography retained')
    for link in page.locator('a[href]').all():
        href = link.get_attribute('href')
        if href.startswith('#'):
            check(page.locator(href).count() == 1, 'Anchor destination: ' + href)
        elif not urlparse(href).scheme:
            check(context.request.get(urljoin(URL,href)).status == 200, 'Local destination: ' + href)
    for width,height in [(1440,900),(390,844),(320,740),(844,390)]:
        page.set_viewport_size({'width':width,'height':height})
        check(page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'No overflow at {width}x{height}')
        check(page.get_by_role('navigation',name='Chapters').is_visible(), 'Navigation available without JavaScript')
    check(page.get_by_role('link',name='LinkedIn',exact=True).count() == 1, 'Contact link')
    context.close()

def journey(browser):
    context=browser.new_context(viewport={'width':1440,'height':900})
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda error: errors.append(str(error)))
    page.on('console',lambda message: errors.append(message.text) if message.type=='error' else None)
    page.goto(URL,wait_until='load')
    page.wait_for_function("document.documentElement.dataset.renderMode === 'webgl'")
    check(page.evaluate("document.documentElement.dataset.renderMode") == 'webgl', 'Actual WebGL initialization required')
    page.wait_for_timeout(350)
    canvas=page.locator('#world')
    rendered=canvas.screenshot(timeout=90000)
    page.evaluate("document.getElementById('world').style.visibility='hidden'")
    fallback=page.screenshot(timeout=90000)
    page.evaluate("document.getElementById('world').style.visibility=''")
    check(hashlib.sha256(rendered).digest()!=hashlib.sha256(fallback).digest(),'Rendered canvas differs from CSS fallback')
    groups=page.evaluate("""async () => {const {createWorld}=await import('./js/world.mjs');const world=await createWorld(); const names=['clock','station','workstation','telescope'].filter(name=>world.scene.getObjectByName(name));world.dispose();return names;}""")
    check(len(groups)==4,'All four landmarks are real scene objects')
    floating=page.evaluate("""async () => {const {createWorld}=await import('./js/world.mjs');const world=await createWorld();const rooms=['library','courtyard','observatory'].filter(name=>world.scene.getObjectByName(name));const isolated=[];if(world.compose)for(const p of [0,.25,.5,.75]){world.compose(p);isolated.push(['clock','station','workstation','telescope'].filter(name=>world.scene.getObjectByName(name).visible));}world.dispose();return {rooms,isolated};}""")
    check(not floating['rooms'],'Floating journey has no room architecture')
    check(floating['isolated']==[['clock'],['station'],['workstation'],['telescope']],'Each chapter brings forward its own object')
    output=Path('/tmp/observatory-review');output.mkdir(exist_ok=True)
    views=[]
    for chapter in ['intro','telecom','coding','explore']:
        page.get_by_role('navigation',name='Chapters').locator(f'a[href="#{chapter}"]').click()
        page.wait_for_function('(id) => document.activeElement.id === id',arg=chapter)
        check(page.evaluate('location.hash')=='#'+chapter,'Chapter navigation: '+chapter)
        page.wait_for_function("(id) => document.querySelector('nav a[aria-current]')?.hash === '#'+id",arg=chapter)
        check(page.get_by_role('navigation',name='Chapters').locator(f'a[href="#{chapter}"]').get_attribute('aria-current')=='location','Current chapter agrees with anchor: '+chapter)
        page.wait_for_timeout(850)
        page.screenshot(timeout=90000,path=str(output/f'desktop-{chapter}.png'))
        views.append(hashlib.sha256(canvas.screenshot(timeout=90000)).hexdigest())
    check(len(set(views))==4,'Four distinct rendered camera views')
    intro_link=page.get_by_role('navigation',name='Chapters').locator('a[href="#intro"]')
    intro_link.focus();intro_link.press('Enter')
    page.wait_for_function("document.activeElement.id === 'intro'")
    check(page.evaluate("location.hash === '#intro'"),'Keyboard activates chapter link')
    check(page.evaluate("document.activeElement.id === 'intro'"),'Keyboard navigation focuses destination')
    page.keyboard.press('Tab')
    check(page.evaluate("document.activeElement.matches('a, summary')"),'Keyboard continues into useful content')
    page.get_by_role('navigation',name='Chapters').locator('a[href="#intro"]').click()
    check(page.evaluate('scrollY')<150,'Reverse navigation returns to intro')
    page.goto(URL+'#coding',wait_until='load')
    check(page.evaluate("location.hash === '#coding' && scrollY > 500"),'Direct coding deep link')
    page.reload(wait_until='load')
    check(page.evaluate("location.hash === '#coding' && scrollY > 500"),'Reload restores chapter')
    for width,height in [(390,844),(844,390)]:
        page.set_viewport_size({'width':width,'height':height})
        check(page.evaluate('document.documentElement.scrollWidth <= innerWidth'),'Resize has no overflow')
        for chapter in ['intro','telecom','coding','explore']:
            page.get_by_role('navigation',name='Chapters').locator(f'a[href="#{chapter}"]').click()
            page.wait_for_timeout(700)
            if width==390:page.screenshot(timeout=90000,path=str(output/f'mobile-{chapter}.png'))
    check(not errors,'No browser JavaScript errors: '+str(errors))
    context.close()

def resilience(browser):
    def instrument(page):
        page.add_init_script("""window.__scheduledFrames=0; window.__draws=0;
        window.__motionChanges=[];
        matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>window.__motionChanges.push(event.matches));
        const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
        window.__pendingFrames=new Set();
        window.requestAnimationFrame=fn=>{window.__scheduledFrames++;let id=request(time=>{window.__pendingFrames.delete(id);fn(time);});window.__pendingFrames.add(id);return id;};
        window.cancelAnimationFrame=id=>{window.__pendingFrames.delete(id);cancel(id);};
        for(const type of [WebGLRenderingContext,WebGL2RenderingContext]){
          for(const method of ['drawElements','drawArrays']){
            const original=type.prototype[method];type.prototype[method]=function(...args){window.__draws++;return original.apply(this,args);};
          }
        }""")
    # Idle first-scene rendering must stop; otherwise a rich scene monopolizes the GPU.
    context=browser.new_context(viewport={'width':1440,'height':900})
    page=context.new_page();instrument(page)
    page.goto(URL,wait_until='load');page.wait_for_function("document.documentElement.dataset.renderMode === 'webgl'")
    page.wait_for_function("window.__pendingFrames.size === 0",timeout=10000)
    frames=page.evaluate('window.__scheduledFrames');page.wait_for_timeout(250)
    check(page.evaluate('window.__scheduledFrames')==frames,'Settled intro stops scheduling')
    context.close()
    for failure in ['blocked-runtime','no-webgl','context-lost']:
        print('Checking fallback:',failure,flush=True)
        context=browser.new_context(viewport={'width':390,'height':844})
        page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        if failure=='blocked-runtime':page.route('**/assets/vendor/three.module.js',lambda route:route.abort())
        if failure=='no-webgl':page.add_init_script("const original=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args);};")
        page.goto(URL,wait_until='load')
        if failure=='context-lost':
            page.wait_for_function("document.documentElement.dataset.renderMode === 'webgl'")
            page.evaluate("document.getElementById('world').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()")
        page.wait_for_function("document.documentElement.dataset.renderMode === 'fallback'")
        check(page.get_by_role('link',name='LinkedIn',exact=True).count()==1,'Contact survives '+failure)
        page.get_by_role('navigation',name='Chapters').locator('a[href="#coding"]').click()
        check(page.evaluate("location.hash === '#coding'"),'Native navigation survives '+failure)
        check(not errors,'No uncaught errors in '+failure+': '+str(errors))
        context.close()
    context=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
    page=context.new_page();instrument(page);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(URL,wait_until='load');page.wait_for_function("document.documentElement.dataset.renderMode === 'webgl'")
    page.wait_for_function('window.__pendingFrames.size === 0');draws=page.evaluate('window.__draws');frames=page.evaluate('window.__scheduledFrames')
    page.wait_for_timeout(300)
    check(page.evaluate('window.__draws')==draws,'Reduced motion has no continuous drawing')
    check(page.evaluate('window.__scheduledFrames')==frames,'Reduced motion has no continuous scheduling')
    page.emulate_media(reduced_motion='no-preference');page.wait_for_function('(draws) => window.__draws > draws',arg=draws)
    check(page.evaluate('window.__draws')>draws,'Motion can resume after preference change')
    page.emulate_media(reduced_motion='reduce')
    page.wait_for_function('window.__motionChanges.at(-1) === true')
    page.wait_for_function('window.__pendingFrames.size === 0')
    draws=page.evaluate('window.__draws');page.wait_for_timeout(300)
    check(page.evaluate('window.__draws')==draws,'Dynamic reduced motion stops animation')
    page.emulate_media(forced_colors='active')
    check(not page.locator('#world').is_visible(),'Forced colors hides decorative canvas')
    page.emulate_media(forced_colors='none',reduced_motion='no-preference')
    page.wait_for_timeout(150)
    page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));")
    frames=page.evaluate('window.__scheduledFrames');page.wait_for_timeout(250)
    check(page.evaluate('window.__scheduledFrames')==frames,'Hidden document does not schedule frames')
    page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));")
    page.wait_for_timeout(100)
    check(page.evaluate('window.__scheduledFrames')>frames,'Visibility return resumes needed frames')
    page.get_by_role('navigation',name='Chapters').locator('a[href="#coding"]').click()
    page.wait_for_function("""() => {const count=window.__scheduledFrames;if(window.__lastFrameCount!==count){window.__lastFrameCount=count;window.__lastFrameChange=Date.now();return false;}return Date.now()-window.__lastFrameChange>1000;}""",polling=100,timeout=30000)
    frames=page.evaluate('window.__scheduledFrames');page.wait_for_timeout(250)
    check(page.evaluate('window.__scheduledFrames')==frames,'Settled nonanimated chapter stops scheduling')
    page.evaluate("location.hash = '%'");page.wait_for_timeout(100)
    check(not errors,'Unknown or malformed anchors cause no uncaught errors: '+str(errors))
    context.close()

def camera_timing(browser):
    # Intercept only the rendering boundary; actual main.mjs runs its frame/damping logic.
    # The journey phase separately requires actual GPU rendering and screenshots.
    source=(Path(__file__).resolve().parents[1]/'js/main.mjs').read_text()
    instrumented=source.replace('renderer.render(world.scene,camera);',
        "if(window.__timeProbe && !motion.matches){window.__timeSamples.push({progress:current,clock:window.__probeClock});}else{renderer.render(world.scene,camera);}")
    for hz in [10,30,60]:
        context=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
        page=context.new_page();page.route('**/js/main.mjs*',lambda route:route.fulfill(body=instrumented,content_type='text/javascript'))
        page.goto(URL,wait_until='load');page.wait_for_function("document.documentElement.dataset.renderMode==='webgl'")
        page.evaluate("scrollTo(0,document.getElementById('coding').offsetTop-parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop))")
        page.wait_for_timeout(150)
        page.evaluate("""hz=>{window.__timeSamples=[];window.__probeClock=0;window.__timeProbe=true;const native=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>native(()=>{window.__probeClock+=1000/hz;fn(window.__probeClock);});}""",hz)
        page.emulate_media(reduced_motion='no-preference')
        page.wait_for_function('(hz)=>window.__timeSamples.length>=hz+1',arg=hz,polling=20)
        samples=page.evaluate('window.__timeSamples')
        expected=.5*(1-math.exp(-1/.18))
        check(abs(samples[hz]['progress']-expected)<1e-6,f'Integrated camera damping at {hz} FPS')
        context.close()

parser = argparse.ArgumentParser()
parser.add_argument('--phase', choices=['content','journey','resilience','timing','all'], default='all')
args = parser.parse_args()
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    content(browser)
    if args.phase in ['journey','all']: journey(browser)
    if args.phase in ['resilience','all']: resilience(browser)
    if args.phase in ['timing','all']: camera_timing(browser)
    browser.close()
print(json.dumps({'phase':args.phase,'passed_checks':checks}))
