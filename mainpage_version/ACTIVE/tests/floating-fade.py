"""Real GPU pixels verify a stage can fade after its first opaque render."""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=browser.new_page()
 page.goto('http://127.0.0.1:8123/mainpage_version/ACTIVE/')
 page.wait_for_function("document.documentElement.dataset.renderMode==='webgl'",timeout=90000)
 pixels=page.evaluate("""async () => {
  const THREE=await import('./assets/vendor/three.module.js');
  const {createWorld}=await import('./js/world.mjs?v=floating-1');const world=await createWorld();
  const material=world.scene.getObjectByName('workstation').children[0].material;
  const probe=new THREE.Scene();probe.background=new THREE.Color('#ffffff');probe.add(new THREE.AmbientLight('#ffffff',2));
  const geometry=new THREE.PlaneGeometry(2,2);probe.add(new THREE.Mesh(geometry,material));
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=3;
  const renderer=new THREE.WebGLRenderer({preserveDrawingBuffer:true});renderer.setSize(32,32);
  const gl=renderer.getContext();
  function read(progress){world.compose(progress);renderer.render(probe,camera);const pixel=new Uint8Array(4);gl.readPixels(16,16,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);return [...pixel];}
  const result={opaque:read(.5),half:read(.625),reverse:read(.5),secondHalf:read(.625)};
  geometry.dispose();world.dispose();renderer.dispose();return result;
 }""")
 browser.close()
 print(pixels,flush=True)
 assert sum(pixels['half'][:3])>sum(pixels['opaque'][:3])+45,'Compiled opaque stage material must visibly fade toward the white backdrop'
 assert pixels['reverse']==pixels['opaque'],'Reverse scroll restores the opaque subject'
 assert pixels['secondHalf']==pixels['half'],'Repeated transition preserves the same fade'
 print('Real WebGL stage fade and reverse-transition pixels passed')
