import * as THREE from '../assets/vendor/three.module.js';
import {weatheredSurface} from './clock.mjs';
import {buildLibrary} from './library.mjs';

/** One observatory, assembled from geometry rather than rendered background pictures. */
export async function createWorld() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#101e2b');
  scene.fog = new THREE.FogExp2('#101e2b', .009);
  const bronze = new THREE.MeshStandardMaterial({color:'#a38150', metalness:.65, roughness:.48});
  const gold = new THREE.MeshStandardMaterial({color:'#d7b77b', metalness:.52, roughness:.38});
  const paving=weatheredSurface('stone',24);
  const stone = new THREE.MeshStandardMaterial({color:'#696655',map:paving,bumpMap:paving,bumpScale:.035,roughness:.96});
  const paleStone = new THREE.MeshStandardMaterial({color:'#938979', roughness:.9});
  const iron = new THREE.MeshStandardMaterial({color:'#35434a', metalness:.52, roughness:.55});
  const dark = new THREE.MeshStandardMaterial({color:'#192629', roughness:.85});
  const teal = new THREE.MeshStandardMaterial({color:'#4d8d86', emissive:'#38877d', emissiveIntensity:.65, metalness:.4, roughness:.4});
  const glow = new THREE.MeshBasicMaterial({color:'#efc68c'});
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
  function lamp(parent,x,y,z) {
    cylinder(parent,.13,.23,2,[x,y+1,z],bronze,12);
    box(parent,[.32,.5,.32],[x,y+2.1,z],glow);
    cylinder(parent,.38,.22,.16,[x,y+2.45,z],bronze,12);
  }
  function column(parent,x,z,height=8) {
    cylinder(parent,.5,.58,height,[x,height/2,z],paleStone,12);
    box(parent,[1.35,.3,1.35],[x,.15,z],stone);
    box(parent,[1.3,.35,1.3],[x,height,z],paleStone);
  }

  const courtyard=group('courtyard',[27,-.35,-15]);
  box(courtyard,[96,.6,88],[0,0,0],stone);

  const clock=group('clock',[0,0,0]);
  await buildLibrary(scene,clock,hands);

  const station=group('station',[20,0,-4]);
  box(station,[5,.55,5],[0,.28,0],paleStone);
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
  box(station,[.25,.07,.04],[4.03,2.55,2.13],teal);lamp(station,-2.8,0,2.5);

  const observatory=group('observatory',[35,0,-30]);
  box(observatory,[23,.55,17],[0,.28,0],paleStone);
  for(const x of [-10,10]) for(const z of [-7,0,7]) column(observatory,x,z,9);
  for(const z of [-7,7]) box(observatory,[23,.75,1.7],[0,9,z],stone);
  for(const x of [-10,10]) box(observatory,[1.7,.75,16],[x,9,0],stone);
  // Open colonnade keeps the camera approach unobstructed.
  const dome=mesh(observatory,new THREE.SphereGeometry(10,32,16,0,Math.PI*2,0,Math.PI/2),bronze,[0,9.4,0]);
  dome.scale.z=.78;
  const ribs=mesh(observatory,new THREE.SphereGeometry(10.08,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:'#bd9b60',wireframe:true,transparent:true,opacity:.28}),[0,9.4,0]);ribs.scale.z=.78;
  cylinder(observatory,.08,.08,2,[0,20,0],gold);mesh(observatory,new THREE.SphereGeometry(.27,12,8),gold,[0,21,0]);

  const workstation=group('workstation',[36,0,-15]);
  box(workstation,[9,.3,7],[0,.15,0],paleStone);
  const desk=box(workstation,[5,.25,2.4],[0,2.05,0],bronze);
  for(const x of [-2.1,2.1]) for(const z of [-.8,.8]) box(workstation,[.15,2,.15],[x,1,z],iron);
  box(workstation,[2.7,1.8,.17],[0,3.3,-.4],iron);
  const codeTexture=texture((ctx,w,h)=>{
    ctx.fillStyle='#10262c';ctx.fillRect(0,0,w,h);ctx.fillStyle='#649b92';ctx.fillRect(0,0,w,45);
    ctx.font='20px monospace';ctx.fillStyle='#def0db';ctx.fillText('OBSERVATORY / WORKBENCH',25,30);
    const lines=['// turn a question into a useful tool','const curiosity = true;','','function build(idea) {','  const data = explore(idea);','  return makeSomethingUseful(data);','}','','build("the next possibility");'];
    ctx.font='25px monospace';lines.forEach((line,i)=>{ctx.fillStyle=i===0?'#72958d':i%3===0?'#d7be85':'#8fd5c5';ctx.fillText(line,25,95+i*42);});
  },768,512);
  mesh(workstation,new THREE.PlaneGeometry(2.45,1.58),new THREE.MeshBasicMaterial({map:codeTexture}),[0,3.3,-.3]);
  box(workstation,[.15,.5,.16],[0,2.4,-.4],iron);box(workstation,[.8,.08,.5],[0,2.18,-.3],iron);
  box(workstation,[1.8,.05,.65],[0,2.21,.5],dark);
  for(let j=0;j<4;j++) box(workstation,[1.5,.018,.01],[0,2.24,.28+j*.12],bronze);
  box(workstation,[.25,.08,.38],[1.25,2.22,.5],dark);
  cylinder(workstation,.7,.7,.16,[0,1.2,2.3],dark);cylinder(workstation,.07,.15,1.15,[0,.6,2.3],iron);
  lamp(workstation,2,1.9,-.6);
  // Architectural framing around an open entrance behind the workstation.
  for(const x of [-5,5]) column(workstation,x,-3.4,7);
  const arch=ring(workstation,5,.24,[0,7,-3.4],paleStone);arch.geometry.dispose();arch.geometry=new THREE.TorusGeometry(5,.24,8,36,Math.PI);
  for(const x of [-5,5]) box(workstation,[.8,7,.8],[x,3.5,-3.4],stone);

  const telescope=group('telescope',[52,0,-29]);
  box(telescope,[12,.5,10],[0,.25,0],paleStone);
  for(const x of [-1.1,1.1]) beam(telescope,[x,.6,1],[0,3,0],.1,bronze);
  beam(telescope,[0,.6,-1.3],[0,3,0],.1,bronze);
  cylinder(telescope,.22,.32,1.2,[0,3,0],bronze);
  const scope=new THREE.Group();scope.position.set(0,3.7,0);scope.rotation.set(-Math.PI/4,.25,0);telescope.add(scope);
  const tube=cylinder(scope,.55,.43,4.5,[0,0,0],bronze,32);tube.rotation.x=Math.PI/2;
  for(const z of [-2.25,-1.4,1.4,2.25]) ring(scope,.57,.065,[0,0,z],gold);
  cylinder(scope,.22,.22,.5,[0,-.25,2.5],iron).rotation.x=Math.PI/2;
  mesh(scope,new THREE.CircleGeometry(.49,32),teal,[0,0,-2.27],[0,Math.PI,0]);
  for(let x=-5;x<=5;x+=2.5) {cylinder(telescope,.14,.2,1.8,[x,1.3,-4.5],stone,8);mesh(telescope,new THREE.SphereGeometry(.24,10,8),gold,[x,2.25,-4.5]);}
  box(telescope,[12,.22,.4],[0,2.1,-4.5],paleStone);lamp(telescope,5,.3,2.8);lamp(telescope,-5,.3,2.8);

  // Sparse cypress silhouettes and lanterns add depth without a dense scene.
  for(const [x,z] of [[-12,-12],[12,-23],[60,-15],[63,-40],[-6,-35],[21,-40]]) {
    cylinder(scene,.18,.3,3,[x,1.5,z],bronze,8);
    mesh(scene,new THREE.ConeGeometry(1.7,7,10),new THREE.MeshStandardMaterial({color:'#263c34',roughness:1}),[x,5.2,z]);
  }
  for(const [x,z] of [[9,1],[17,-15],[29,-7],[44,-20],[59,-25]]) lamp(scene,x,0,z);

  const positions=[];let seed=17;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<700;i++) positions.push((random()-.5)*300,random()*95+22,-35-random()*150);
  const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:'#d1dacb',size:.14,sizeAttenuation:true,transparent:true,opacity:.85})));
  const planetTexture=texture((ctx,w,h)=>{ctx.fillStyle='#335261';ctx.fillRect(0,0,w,h);for(let y=0;y<h;y+=8){ctx.fillStyle=`rgba(128,168,174,${.07+.1*Math.sin(y*.08)})`;ctx.fillRect(0,y,w,5);}},512,256);
  mesh(scene,new THREE.SphereGeometry(5.5,40,24),new THREE.MeshStandardMaterial({map:planetTexture,roughness:.95}),[54,23,-64]);
  mesh(scene,new THREE.SphereGeometry(1.1,20,12),paleStone,[65,18,-62]);

  scene.add(new THREE.HemisphereLight('#adc9cd','#514332',.5));
  const moon=new THREE.DirectionalLight('#bacfdb',.8);moon.position.set(-18,35,20);scene.add(moon);
  const warm=new THREE.DirectionalLight('#d7a564',.8);warm.position.set(10,12,10);scene.add(warm);
  const fill=new THREE.DirectionalLight('#77b7b0',1.1);fill.position.set(60,15,-30);scene.add(fill);
  return {
    scene,
    update(dtSeconds) {for(const item of hands) item.object.rotation.z+=item.speed*dtSeconds;},
    dispose() {
      const geometries=new Set(), materials=new Set(), textures=new Set();
      scene.traverse(object=>{object.shadow?.dispose();if(object.isInstancedMesh)object.dispose();if(object.geometry)geometries.add(object.geometry);if(object.material)for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);});
      for(const material of materials)for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
      geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());
    },
  };
}
