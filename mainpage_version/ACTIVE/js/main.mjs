import {progressFor, sampleCamera, damp} from './camera-path.mjs';

const root=document.documentElement;
const canvas=document.getElementById('world');
const chapters=[...document.querySelectorAll('[data-chapter]')];
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const colors=matchMedia('(forced-colors: active)');
let renderer, camera, world, raf=0, last=0, current=0, desired=0, starts=[], maxScroll=0, dirty=true, disposed=false;

function measure() {
  const anchorOffset=parseFloat(getComputedStyle(root).scrollPaddingTop)||0;
  starts=chapters.map(el=>Math.max(0,el.getBoundingClientRect().top+scrollY-anchorOffset));
  maxScroll=Math.max(0,document.documentElement.scrollHeight-innerHeight);
  desired=progressFor(scrollY,starts,maxScroll);
}
function navigation() {
  // Anchor scrolling rounds to device pixels; tolerate a one-pixel boundary gap.
  let index=0;
  starts.forEach((start,i)=>{if(scrollY+1>=start)index=i;});
  document.querySelectorAll('nav a').forEach((a,i)=>{if(i===index)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
}
function focusDestination() {
  let id;
  try {id=decodeURIComponent(location.hash.slice(1));} catch {return;}
  const target=document.getElementById(id);
  if(target) target.focus({preventScroll:true});
}
window.addEventListener('hashchange',()=>{focusDestination();measure();navigation();dirty=true;schedule();});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{requestAnimationFrame(focusDestination);}));

function resize() {
  measure();navigation();
  if(renderer && camera){
    const narrow=innerWidth<=700;
    renderer.setPixelRatio(Math.min(devicePixelRatio,narrow?1:1.5));
    renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/innerHeight;
    // Shift the view to place the landmark beside desktop text or above mobile text.
    viewComposition(narrow);
    camera.updateProjectionMatrix();
  }
  dirty=true;schedule();
}
function viewComposition(narrow=innerWidth<=700) {
  const introBlend=Math.max(0,1-current/.25);
  camera.setViewOffset(innerWidth,innerHeight,narrow?0:innerWidth*(-.19+.39*introBlend),narrow?innerHeight*.21:0,innerWidth,innerHeight);
}
function schedule() {
  if(!raf && !disposed && renderer && camera && world && !document.hidden && !colors.matches)raf=requestAnimationFrame(frame);
}
function frame(now) {
  raf=0;
  if(disposed||document.hidden||colors.matches)return;
  const dt=last?Math.max(0,(now-last)/1000):0;last=now;
  const target=motion.matches?0:desired;
  current=motion.matches?0:damp(current,target,dt);
  if(Math.abs(current-target)<.00001)current=target;
  const sample=sampleCamera(current,innerWidth<=700);
  camera.position.set(...sample.position);camera.lookAt(...sample.target);camera.fov=sample.fov;viewComposition();camera.updateProjectionMatrix();
  const animateClock=!motion.matches && current<.19 && current!==target;
  if(animateClock)world.update(Math.min(dt,.05));
  if(dirty||animateClock||current!==target){renderer.render(world.scene,camera);dirty=false;}
  if(animateClock||current!==target)schedule();
}
function fallback() {
  cancelAnimationFrame(raf);raf=0;disposed=true;
  root.dataset.renderMode='fallback';
  world?.dispose();renderer?.dispose();
}
function preference() {
  if(colors.matches){cancelAnimationFrame(raf);raf=0;} else {last=0;dirty=true;schedule();}
  if(motion.matches){current=0;dirty=true;schedule();}
}
window.addEventListener('scroll',()=>{measure();navigation();dirty=true;schedule();},{passive:true});
window.addEventListener('resize',resize);
new ResizeObserver(()=>resize()).observe(document.querySelector('main'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=0;dirty=true;schedule();}});
motion.addEventListener('change',preference);colors.addEventListener('change',preference);
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);raf=0;});
window.addEventListener('pageshow',()=>{last=0;resize();});
measure();navigation();
root.dataset.renderMode='loading';
try {
  const [THREE,{createWorld}]=await Promise.all([import('../assets/vendor/three.module.js'),import('./world.mjs')]);
  if(disposed)throw new Error('Scene initialization was cancelled.');
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  const {RoomEnvironment}=await import('../assets/vendor/RoomEnvironment.js');
  if(disposed)throw new Error('Scene initialization was cancelled.');
  const pmrem=new THREE.PMREMGenerator(renderer);
  const roomEnvironment=new RoomEnvironment(renderer);
  const reflection=pmrem.fromScene(roomEnvironment,.04);roomEnvironment.dispose();pmrem.dispose();
  camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.15,350);
  try {world=await createWorld();if(disposed)throw new Error('Scene initialization was cancelled.');} catch(error) {reflection.dispose();throw error;}
  world.scene.environment=reflection.texture;
  const disposeWorld=world.dispose;world.dispose=()=>{disposeWorld();reflection.dispose();};
  current=motion.matches?0:progressFor(scrollY,starts,maxScroll);
  resize();
  const sample=sampleCamera(current,innerWidth<=700);camera.position.set(...sample.position);camera.lookAt(...sample.target);camera.fov=sample.fov;viewComposition();camera.updateProjectionMatrix();
  renderer.render(world.scene,camera);root.dataset.renderMode='webgl';
} catch(error) {
  fallback();console.warn('The observatory is using its readable background fallback.',error.message);
}
