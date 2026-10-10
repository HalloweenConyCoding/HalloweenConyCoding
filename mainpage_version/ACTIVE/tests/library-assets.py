"""Browser integration: a separate GLB loads, and a failed model leaves usable HTML."""
from playwright.sync_api import sync_playwright
URL='http://127.0.0.1:8123/mainpage_version/ACTIVE/'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=b.new_page(viewport={'width':1440,'height':900})
 responses=[];errors=[]
 page.on('response',lambda r:responses.append((r.url,r.status)))
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(URL)
 page.wait_for_function("document.documentElement.dataset.renderMode !== 'loading'",timeout=90000)
 assert any(url.endswith('/assets/models/astronomical-clock.glb') and status==200 for url,status in responses),'Separate clock GLB must be fetched successfully'
 assert page.locator('html').get_attribute('data-render-mode')=='webgl','Model must render in real WebGL'
 assert not errors,errors
 page.close()
 page=b.new_page()
 page.route('**/assets/models/astronomical-clock.glb',lambda route:route.abort())
 page.goto(URL)
 page.wait_for_function("document.documentElement.dataset.renderMode === 'fallback'",timeout=60000)
 assert page.locator('h1').is_visible(),'Failed model retains portfolio heading'
 page.get_by_role('link',name='03 Creation').click()
 assert page.locator('#coding').is_visible(),'Failed model retains chapter navigation'
 page.close()
 page=b.new_page()
 def lose_context_during_load(route):
  page.evaluate("document.getElementById('world').dispatchEvent(new Event('webglcontextlost',{cancelable:true}))")
  route.continue_()
 def finish_initialization(route):
  response=route.fetch();route.fulfill(response=response,body=response.text()+'\nwindow.__initializationFinished=true;')
 page.route('**/js/main.mjs',finish_initialization)
 page.route('**/assets/models/astronomical-clock.glb',lose_context_during_load)
 page.goto(URL)
 page.wait_for_function("document.documentElement.dataset.renderMode === 'fallback'",timeout=60000)
 page.wait_for_function("window.__initializationFinished === true",timeout=60000)
 assert page.locator('html').get_attribute('data-render-mode')=='fallback','Context loss during model loading must never re-enable the disposed renderer'
 b.close()
 print('Clock GLB load and failed-model fallback checks passed')
