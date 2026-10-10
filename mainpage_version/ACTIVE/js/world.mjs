import * as THREE from '../assets/vendor/three.module.js';
import {buildLibrary} from './library.mjs?v=floating-1';

/** Four suspended objects, staged through a camera journey and changing atmosphere. */
export async function createWorld() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#101e2b');
  scene.fog = new THREE.FogExp2('#101e2b', .002);
  const bronze = new THREE.MeshStandardMaterial({color:'#a38150', metalness:.65, roughness:.48});
  const gold = new THREE.MeshStandardMaterial({color:'#d7b77b', metalness:.52, roughness:.38});
  const paleStone = new THREE.MeshStandardMaterial({color:'#938979', roughness:.9});
  const iron = new THREE.MeshStandardMaterial({color:'#35434a', metalness:.52, roughness:.55});
  const dark = new THREE.MeshStandardMaterial({color:'#192629', roughness:.85});
  const teal = new THREE.MeshStandardMaterial({color:'#4d8d86', emissive:'#38877d', emissiveIntensity:.65, metalness:.4, roughness:.4});
  const hands=[];
  function mesh(parent, geometry, material, position=[0,0,0], rotation=[0,0,0]) {
    const object=new THREE.Mesh(geometry,material);object.position.set(...position);object.rotation.set(...rotation);parent.add(object);return object;
  }
  function box(parent, size, position, material=stone) {return mesh(parent,new THREE.BoxGeometry(...size),material,position);}
  function cylinder(parent, top, bottom, height, position, material=bronze, segments=24) {
    return mesh(parent,new THREE.CylinderGeometry(top,bottom,height,segments),material,position);
  }
  function ring(parent, radius, thickness, position, material=bronze) {
    return mesh(parent,new THREE.TorusGeometry(radius,thickness,8,72),material,position);
  }
  function beam(parent, from, to, radius=.07, material=iron) {
    const a=new THREE.Vector3(...from), b=new THREE.Vector3(...to), delta=b.clone().sub(a);
    const object=cylinder(parent,radius,radius,delta.length(),a.clone().add(b).multiplyScalar(.5).toArray(),material,8);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return object;
  }
  function texture(draw, width=1024,height=1024) {
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    draw(canvas.getContext('2d'),width,height);
    const result=new THREE.CanvasTexture(canvas);result.colorSpace=THREE.SRGBColorSpace;return result;
  }
  function group(name,position) {const g=new THREE.Group();g.name=name;g.position.set(...position);scene.add(g);return g;}
  const clock=group('clock',[0,0,0]);
  await buildLibrary(scene,clock,hands);

  const station=group('station',[20,0,-4]);
  for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]]) beam(station,[x,0,z],[x*.65,14,z*.65],.095,iron);
  for(let y=1;y<14;y+=2) {
    for(const z of [-1,1]) {beam(station,[-1,y,z],[1,y+2,z],.055);beam(station,[1,y,z],[-1,y+2,z],.055);}
    for(const x of [-1,1]) beam(station,[x,y,-1],[x,y+2,1],.055);
  }
  for(let y=1;y<13;y+=.48) beam(station,[-.35,y,1.12],[.35,y,1.12],.035);
  for(let i=0;i<3;i++) {
    const antenna=new THREE.Group();antenna.position.set(Math.cos(i*Math.PI*2/3)*1.8,11,Math.sin(i*Math.PI*2/3)*1.8);antenna.rotation.y=-i*Math.PI*2/3;station.add(antenna);
    box(antenna,[.72,3.5,.32],[0,0,0],paleStone);box(antenna,[.82,.13,.4],[0,1.7,0],iron);
    beam(antenna,[0,-1.8,0],[0,-6,.35],.035,dark);
  }
  box(station,[2.2,2.8,1.3],[3.4,1.4,1.4],iron);
  box(station,[1.95,2.45,.05],[3.4,1.4,2.08],dark);
  for(let y=.6;y<2.5;y+=.2) box(station,[1.6,.025,.025],[3.4,y,2.13],bronze);
  box(station,[.25,.07,.04],[4.03,2.55,2.13],teal);

  const workstation=group('workstation',[36,0,-15]);
  workstation.rotation.y=-.14;
  box(workstation,[2.7,1.8,.17],[0,3.3,-.4],iron);
  const codeTexture=texture((ctx,w,h)=>{
    ctx.fillStyle='#10262c';ctx.fillRect(0,0,w,h);ctx.fillStyle='#649b92';ctx.fillRect(0,0,w,45);
    ctx.font='20px monospace';ctx.fillStyle='#def0db';ctx.fillText('OBSERVATORY / WORKBENCH',25,30);
    const lines=['// turn a question into a useful tool','const curiosity = true;','','function build(idea) {','  const data = explore(idea);','  return makeSomethingUseful(data);','}','','build("the next possibility");'];
    ctx.font='25px monospace';lines.forEach((line,i)=>{ctx.fillStyle=i===0?'#72958d':i%3===0?'#d7be85':'#8fd5c5';ctx.fillText(line,25,95+i*42);});
  },768,512);
  mesh(workstation,new THREE.PlaneGeometry(2.45,1.58),new THREE.MeshBasicMaterial({map:codeTexture}),[0,3.3,-.3]);
  // Detached keyboard, cursor, and code panels float around the main screen.
  box(workstation,[2.5,.055,.85],[0,2,.6],dark);
  for(let j=0;j<4;j++)for(let i=0;i<12;i++)box(workstation,[.15,.018,.1],[-1.05+i*.19,2.04,.3+j*.16],iron);
  box(workstation,[.25,.08,.38],[1.65,2.05,.55],dark);
  for(const [x,y,z,w,h] of [[-2.15,3.8,-1.1,1.3,.9],[1.9,2.8,.2,1.15,.8]]) {
    box(workstation,[w+.12,h+.12,.06],[x,y,z],iron);
    mesh(workstation,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:codeTexture,transparent:true,opacity:.6}),[x,y,z+.04]);
  }
  const telescope=group('telescope',[52,0,-31]);
  const planetTexture=texture((ctx,w,h)=>{ctx.fillStyle='#335261';ctx.fillRect(0,0,w,h);for(let y=0;y<h;y+=8){ctx.fillStyle=`rgba(128,168,174,${.07+.1*Math.sin(y*.08)})`;ctx.fillRect(0,y,w,5);}},512,256);
  mesh(telescope,new THREE.SphereGeometry(2.9,48,32),new THREE.MeshStandardMaterial({map:planetTexture,roughness:.85}),[0,5,0]);
  const orbit=ring(telescope,4.5,.045,[0,5,0],gold);orbit.rotation.set(1.05,.3,.18);
  mesh(telescope,new THREE.SphereGeometry(.55,24,16),paleStone,[4.3,6.2,1]);
  mesh(telescope,new THREE.SphereGeometry(.3,20,12),bronze,[-4,3.8,0]);
  const positions=[];let seed=17;
  for(let i=0;i<500;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed/4294967296;seed=(seed*1664525+1013904223)>>>0;const y=seed/4294967296;seed=(seed*1664525+1013904223)>>>0;positions.push((x-.5)*95,(y-.5)*65+5,-10-seed/4294967296*55);}
  const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  telescope.add(new THREE.Points(stars,new THREE.PointsMaterial({color:'#d1dae9',size:.07,transparent:true,opacity:.85})));

  // A camera-independent gradient replaces architecture and blends between chapters.
  const atmosphereMaterial=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,
    uniforms:{upper:{value:new THREE.Color()},lower:{value:new THREE.Color()},accent:{value:new THREE.Color()},space:{value:0}},
    vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.0);}',
    fragmentShader:`varying vec2 vUv;uniform vec3 upper;uniform vec3 lower;uniform vec3 accent;uniform float space;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec3 color=mix(lower,upper,smoothstep(0.,1.,vUv.y));
        vec2 p=vUv-vec2(.4,.58);p.x*=1.25;
        float mist=exp(-dot(p,p)*6.)*(.8+.2*sin(vUv.x*13.+vUv.y*7.));
        color+=accent*mist*.35;
        vec2 cell=floor(vUv*vec2(500.,320.));vec2 local=fract(vUv*vec2(500.,320.))-.5;
        float star=step(.997,hash(cell))*exp(-dot(local,local)*70.);
        color+=vec3(.4,.48,.65)*star*space;
        gl_FragColor=vec4(color,1.);
        #include <colorspace_fragment>
      }`});
  const atmosphere=new THREE.Mesh(new THREE.PlaneGeometry(2,2),atmosphereMaterial);atmosphere.frustumCulled=false;atmosphere.renderOrder=-1000;scene.add(atmosphere);
  const palettes=[['#120e18','#080a13','#60351a'],['#091a30','#060c1b','#16486f'],['#082824','#061416','#17685f'],['#171127','#060811','#403369']].map(values=>values.map(value=>new THREE.Color(value)));
  const stages=[clock,station,workstation,telescope];
  const stageMaterials=stages.map(stage=>{
    const originals=new Map();
    stage.traverse(object=>{if(object.material){object.material=(Array.isArray(object.material)?object.material:[object.material]).map(material=>{if(!originals.has(material))originals.set(material,material.clone());return originals.get(material);});if(object.material.length===1)object.material=object.material[0];}});
    return [...originals.values()].map(material=>({material,opacity:material.opacity,transparent:material.transparent}));
  });
  scene.add(new THREE.HemisphereLight('#adc9cd','#514332',.5));
  const moon=new THREE.DirectionalLight('#bacfdb',.8);moon.position.set(-18,35,20);scene.add(moon);
  const warm=new THREE.DirectionalLight('#d7a564',.8);warm.position.set(10,12,10);scene.add(warm);
  const fill=new THREE.DirectionalLight('#77b7b0',1.1);fill.position.set(60,15,-30);scene.add(fill);
  return {
    scene,
    compose(progress) {
      const scaled=Math.min(3,Math.max(0,progress*4)),i=Math.floor(scaled),j=Math.min(3,i+1),t=scaled-i,blend=t*t*(3-2*t);
      for(const [index,name] of ['upper','lower','accent'].entries())atmosphereMaterial.uniforms[name].value.copy(palettes[i][index]).lerp(palettes[j][index],blend);
      atmosphereMaterial.uniforms.space.value=Math.max(0,scaled-2);
      stages.forEach((stage,index)=>{
        const distance=Math.abs(scaled-index),weight=distance>=1?0:1-distance*distance*(3-2*distance);
        stage.visible=weight>.005;
        for(const item of stageMaterials[index]){
          item.material.opacity=item.opacity*weight;
          const transparent=item.transparent||weight<.999;
          if(item.material.transparent!==transparent){item.material.transparent=transparent;item.material.needsUpdate=true;}
          item.material.depthWrite=!transparent;
        }
      });
    },
    update(dtSeconds) {for(const item of hands) item.object.rotation.z+=item.speed*dtSeconds;},
    dispose() {
      const geometries=new Set(), materials=new Set(), textures=new Set();
      scene.traverse(object=>{object.shadow?.dispose();if(object.isInstancedMesh)object.dispose();if(object.geometry)geometries.add(object.geometry);if(object.material)for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);});
      for(const material of materials)for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
      geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());
    },
  };
}
