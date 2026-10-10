import * as THREE from '../assets/vendor/three.module.js';
import {GLTFLoader} from '../assets/vendor/GLTFLoader.js';
import {mergeGeometries} from '../assets/vendor/BufferGeometryUtils.js';

function canvasMap(draw,w=512,h=512) {
  const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;return map;
}
function woodMap() {
  return canvasMap((ctx,w,h)=>{
    ctx.fillStyle='#382217';ctx.fillRect(0,0,w,h);let seed=77;
    const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<1600;i++) {
      const x=rand()*w;ctx.strokeStyle=`rgba(${rand()>.5?'146,100,52':'15,8,4'},${rand()*.2})`;ctx.lineWidth=rand()*2+.3;ctx.beginPath();ctx.moveTo(x,0);
      for(let y=0;y<=h;y+=8)ctx.lineTo(x+Math.sin(y*.012+i)*3+Math.sin(y*.043+i)*.8,y);ctx.stroke();
    }
  });
}

/** An actual room and separately exported clock; no photographic backdrop. */
export async function buildLibrary(scene,clock,animations) {
  const gltf=await new GLTFLoader().loadAsync(new URL('../assets/models/astronomical-clock.glb',import.meta.url).href);
  clock.add(gltf.scene);clock.position.set(-1.6,0,1);
  for(const [name,speed] of [['MinuteHand',.007],['HourHand',.0006]]) {
    const object=gltf.scene.getObjectByName(name);if(object)animations.push({object,speed});
  }
  gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  const room=new THREE.Group();room.name='library';scene.add(room);
  const wood=new THREE.MeshStandardMaterial({map:woodMap(),roughness:.5});
  const walnut=new THREE.MeshStandardMaterial({color:'#20140e',roughness:.62});
  const brass=new THREE.MeshStandardMaterial({color:'#b38a43',metalness:.8,roughness:.34});
  const stone=new THREE.MeshStandardMaterial({color:'#303638',roughness:.88});
  const enamel=new THREE.MeshStandardMaterial({color:'#172b39',metalness:.25,roughness:.6});
  const parchment=new THREE.MeshStandardMaterial({color:'#bda77e',roughness:.9});
  // Merge fixed furniture by material; repeated books remain instanced.
  const batches=new Map();const transform=new THREE.Object3D();
  function part(geometry,mat,pos=[0,0,0],rot=[0,0,0]) {
    transform.position.set(...pos);transform.rotation.set(...rot);transform.scale.set(1,1,1);transform.updateMatrix();geometry.applyMatrix4(transform.matrix);
    if(!batches.has(mat))batches.set(mat,[]);batches.get(mat).push(geometry);
  }
  const box=(size,pos,mat=wood,rot=[0,0,0])=>part(new THREE.BoxGeometry(...size),mat,pos,rot);
  const torus=(r,t,pos,rot=[0,0,0],mat=brass)=>part(new THREE.TorusGeometry(r,t,6,48),mat,pos,rot);
  const cyl=(r,height,pos,mat=wood)=>part(new THREE.CylinderGeometry(r,r,height,16),mat,pos);
  function tube(points,r=.035,mat=brass) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));part(new THREE.TubeGeometry(curve,32,r,5,false),mat);
  }
  // Night-dark polished flagstones with visible grout and restrained reflections.
  const floorMap=canvasMap((ctx,w,h)=>{
    ctx.fillStyle='#181d21';ctx.fillRect(0,0,w,h);
    for(let y=0;y<4;y++)for(let x=0;x<4;x++){
      const v=(x+y)%2?55:37;ctx.fillStyle=`rgb(${v},${v+3},${v+5})`;ctx.fillRect(x*128+2,y*128+2,124,124);
      ctx.strokeStyle='rgba(171,167,139,.17)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x*128+12,y*128+80);ctx.bezierCurveTo(x*128+60,y*128+40,x*128+75,y*128+110,x*128+117,y*128+40);ctx.stroke();
    }
    let seed=412;for(let i=0;i<14000;i++){seed=(seed*1664525+1013904223)>>>0;const x=(seed>>>16)%w;seed=(seed*1664525+1013904223)>>>0;ctx.fillStyle=i%2?'rgba(10,15,18,.12)':'rgba(134,139,132,.09)';ctx.fillRect(x,(seed>>>16)%h,1+(seed%3),1+(seed%4));}
  });floorMap.wrapS=floorMap.wrapT=THREE.RepeatWrapping;floorMap.repeat.set(6,7);
  const floor=new THREE.MeshStandardMaterial({map:floorMap,roughness:.32,metalness:.15});
  box([34,.12,42],[-1,-.005,-9],floor);
  box([34,21,.5],[-1,10.5,-16],stone);
  // Seven tall walnut bookcases, with articulated cornices and inset side pillars.
  const bookPlacements=[];let seed=816;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function shelf(x,z,width=3.6,height=16) {
    box([width,height,.2],[x,height/2,z-.38],walnut);
    for(const dx of [-width/2,width/2]) {
      box([.23,height,1],[x+dx,height/2,z]);cyl(.11,height,[x+dx,height/2,z+.52],brass);
      box([.48,.22,1.25],[x+dx,.2,z]);box([.45,.23,1.25],[x+dx,height-.2,z]);
    }
    for(const [dy,w,d] of [[height,width+.55,1.3],[height+.25,width+.7,1.4],[.2,width+.35,1.25]])box([w,.18,d],[x,dy,z]);
    for(let y=.7;y<height-.6;y+=1.3) {
      box([width,.13,1],[x,y,z]);box([width,.025,.045],[x,y+.08,z+.51],brass);
      let xx=-width/2+.2;
      while(xx<width/2-.25) {
        const bw=.13+rand()*.16,bh=.65+rand()*.4;
        bookPlacements.push({pos:[x+xx+bw/2,y+.08+bh/2,z+.18],scale:[bw,bh,.55+rand()*.2],color:Math.floor(rand()*7),tilt:rand()>.93?(rand()-.5)*.2:0});xx+=bw+.025;
      }
    }
    // Pierced fan ornament above each cabinet.
    torus(.5,.024,[x,height+.32,z+.56]);
    for(let i=0;i<7;i++){const a=i*Math.PI/6;tube([[x,height+.3,z+.56],[x+Math.cos(a)*.5,height+.3+Math.sin(a)*.5,z+.56]],.016);}
  }
  for(const x of [-13,-9,-5,-1,3])shelf(x,-5.8,3.7,18);
  for(const x of [-13,-9,-5,-1,3])shelf(x,-14.6,3.7,20);
  // Book bindings with ribs, foil ornaments, and worn leather grain.
  const bookMap=canvasMap((ctx,w,h)=>{
    ctx.fillStyle='#e0cab0';ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#736555';for(let y=0;y<h;y+=3)ctx.fillRect(0,y,w,1);
    ctx.fillStyle='#5b4938';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#d7b870';ctx.lineWidth=5;
    for(const y of [25,60,150,360,440,480]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    ctx.lineWidth=3;ctx.strokeRect(30,175,w-60,145);ctx.font='28px Georgia';ctx.textAlign='center';ctx.fillStyle='#dcc28a';ctx.fillText('✦',w/2,245);ctx.font='14px Georgia';ctx.fillText('ASTRA',w/2,278);
    let s=83;for(let i=0;i<3500;i++){s=(s*1664525+1013904223)>>>0;const x=s%w;s=(s*1664525+1013904223)>>>0;ctx.fillStyle='rgba(25,13,8,.12)';ctx.fillRect(x,s%h,2,2);}
  },128,512);
  const palette=['#947047','#705842','#486354','#4c5c6c','#8c4936','#5c3f33','#777062'];
  for(let i=0;i<palette.length;i++) {
    const positions=bookPlacements.filter(b=>b.color===i);const books=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({map:bookMap,color:palette[i],roughness:.78}),positions.length);
    for(let j=0;j<positions.length;j++){const b=positions[j];transform.position.set(...b.pos);transform.scale.set(...b.scale);transform.rotation.set(0,0,b.tilt);transform.updateMatrix();books.setMatrixAt(j,transform.matrix);}
    books.castShadow=true;books.receiveShadow=true;room.add(books);
  }
  // Gothic window behind the text area. Tracery has geometric depth.
  const wx=10,wz=-15.55;
  const arch=new THREE.Shape();arch.moveTo(-3,0);arch.lineTo(-3,8);arch.quadraticCurveTo(-3,10,0,12);arch.quadraticCurveTo(3,10,3,8);arch.lineTo(3,0);arch.closePath();
  const glassMap=canvasMap((ctx,w,h)=>{
    const gradient=ctx.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#182e48');gradient.addColorStop(.5,'#88b8ca');gradient.addColorStop(1,'#294c6a');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=48)for(let x=0;x<w;x+=40){ctx.strokeStyle='#1a2c3f';ctx.lineWidth=3;ctx.strokeRect(x,y,40,48);ctx.fillStyle='rgba(171,211,228,.16)';ctx.fillRect(x+5,y+5,28,32);}
  });
  const windowGeometry=new THREE.ShapeGeometry(arch,32);
  const windowUV=windowGeometry.attributes.uv;for(let i=0;i<windowUV.count;i++)windowUV.setXY(i,(windowUV.getX(i)+3)/6,windowUV.getY(i)/12);
  const glass=new THREE.MeshBasicMaterial({map:glassMap,color:'#b7d6ee',toneMapped:false});part(windowGeometry,glass,[wx,3,wz]);
  for(const x of [-3,-1,1,3])box([.09,8,.12],[wx+x,7,wz+.06],stone);
  tube([[wx-3,3,wz+.1],[wx-3,11,wz+.1],[wx-2,13,wz+.1],[wx,15,wz+.1],[wx+2,13,wz+.1],[wx+3,11,wz+.1],[wx+3,3,wz+.1]],.16,stone);
  for(const x of [-1.5,1.5]) {
    tube([[wx+x-1.4,3,wz+.13],[wx+x-1.4,9,wz+.13],[wx+x,11.8,wz+.13],[wx+x+1.4,9,wz+.13],[wx+x+1.4,3,wz+.13]],.085,stone);
  }
  torus(1.35,.09,[wx,12.6,wz+.16],[0,0,0],stone);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;tube([[wx,12.6,wz+.18],[wx+Math.sin(a)*1.3,12.6+Math.cos(a)*1.3,wz+.18]],.065,stone);}
  // Tall ribbed pilasters give the room scale and separate cabinets/window bays.
  for(const x of [-15.5,5.8,14.5]) {
    box([.8,22,.9],[x,11,-14.8],stone);
    for(const dx of [-.3,0,.3])cyl(.08,20,[x+dx,10.8,-14.2],brass);
    box([1.6,.6,1.6],[x,2.5,-14.8],stone);box([1.5,.5,1.5],[x,18,-14.8],stone);
  }
  for(const z of [-7,-15]) {
    tube([[-15,17,z],[-11,21,z],[-4,24,z],[3,23,z],[10,20,z],[15,17,z]],.18,walnut);
    tube([[-15,17,z+.03],[-11,21,z+.03],[-4,24,z+.03],[3,23,z+.03],[10,20,z+.03],[15,17,z+.03]],.025,brass);
  }
  // Draped midnight banner with celestial brass embroidery.
  box([2.7,7,.065],[6.2,13,-9.6],enamel);torus(.55,.035,[6.2,14,-9.52]);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;tube([[6.2+Math.sin(a)*.72,14+Math.cos(a)*.72,-9.5],[6.2+Math.sin(a)*.95,14+Math.cos(a)*.95,-9.5]],.016);}
  // Foreground writing desk: books, quills, parchment and an open star atlas.
  box([9,.22,3.3],[-3,1.6,5.2]);box([9.2,.08,3.45],[-3,1.75,5.2],walnut);
  for(const x of [-6.6,.6])for(const z of [4,6.5])cyl(.14,1.6,[x,.8,z]);
  for(let i=0;i<5;i++){
    const y=1.9+i*.15;box([1.8+i*.12,.14,1.15],[-5.7,y,4.7],i%2?enamel:wood,[0,(i-2)*.06,0]);box([1.64+i*.12,.07,1.1],[-5.7,y,4.7],parchment,[0,(i-2)*.06,0]);
  }
  const atlasMap=canvasMap((ctx,w,h)=>{
    ctx.fillStyle='#baa279';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#655340';ctx.lineWidth=1.5;
    for(let r=25;r<180;r+=24){ctx.beginPath();ctx.arc(w/2,h/2,r,0,Math.PI*2);ctx.stroke();}
    for(let i=0;i<24;i++){const a=i*Math.PI/12;ctx.beginPath();ctx.moveTo(w/2,h/2);ctx.lineTo(w/2+Math.cos(a)*190,h/2+Math.sin(a)*190);ctx.stroke();}
    ctx.font='19px Georgia';ctx.fillStyle='#544435';ctx.fillText('TABULA COELESTIS',45,35);ctx.font='11px Georgia';for(let i=0;i<8;i++)ctx.fillText('Ad astra per scientiam · tempus et curiositas',28,h-90+i*10);
  });
  const atlas=new THREE.MeshStandardMaterial({map:atlasMap,roughness:.95});
  for(const sign of [-1,1]) {
    box([1.45,.13,1.9],[-2+sign*.72,1.95,5.65],wood,[0,0,sign*.1]);box([1.38,.03,1.83],[-2+sign*.69,2.035,5.65],atlas,[0,0,sign*.1]);
  }
  for(const z of [4.45,4.8,5.15])part(new THREE.CylinderGeometry(.14,.14,1.25,24),parchment,[.2,1.94,z],[0,0,Math.PI/2]);
  box([.3,.25,.3],[.8,1.9,6],enamel);tube([[.8,2.05,6],[1.2,3,6],[1.55,3.5,6]],.025,parchment);
  // Smaller desks down the aisle and celestial instruments.
  for(const [x,z] of [[7,-5],[9,-11],[-8,-11]]) {
    box([3.6,.16,1.8],[x,1.8,z]);for(const dx of [-1.4,1.4])for(const dz of [-.6,.6])cyl(.08,1.8,[x+dx,.9,z+dz]);
    part(new THREE.SphereGeometry(.4,24,12),enamel,[x,2.45,z]);
    for(const rot of [[0,0,0],[Math.PI/2,0,0],[0,Math.PI/3,0]])torus(.52,.025,[x,2.45,z],rot);
    cyl(.13,.22,[x,2,z],brass);
  }
  // Candles have shared glow sprites, with only three local lights for the room.
  const glowMap=canvasMap((ctx,w,h)=>{const g=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,218,140,.8)');g.addColorStop(.12,'rgba(255,164,65,.25)');g.addColorStop(1,'rgba(255,127,26,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);},128,128);
  const glowMaterial=new THREE.SpriteMaterial({map:glowMap,color:'#ffbb62',blending:THREE.AdditiveBlending,depthWrite:false,transparent:true});
  const flame=new THREE.MeshBasicMaterial({color:'#ffe3ac'});
  function candle(x,y,z,height=.45) {
    cyl(.08,.08,[x,y,z],brass);cyl(.038,height,[x,y+height*.5,z],parchment);
    part(new THREE.SphereGeometry(.045,8,6),flame,[x,y+height+.08,z]);
    const glow=new THREE.Sprite(glowMaterial);glow.position.set(x,y+height+.08,z);glow.scale.set(.8,1,.8);room.add(glow);
  }
  for(const [x,y,z] of [[-5,2.55,4.3],[.4,1.85,4.1],[7,1.9,-5],[-8,1.9,-11],[9,1.9,-11],[-9,7,-4.9],[-5,12,-4.9],[3,10,-4.9],[-13,15,-4.9]]) {
    for(const dx of [-.24,0,.24])candle(x+dx,y,z,.45+Math.abs(dx));
    if(y>3){box([1,.08,.45],[x,y-.06,z],brass);tube([[x,y,z],[x,y-.6,z-.2],[x,y-.6,z-.5]],.045);}
  }
  // Hanging chandelier silhouette above the aisle.
  cyl(.025,6,[2,18,-7],brass);torus(1.2,.06,[2,15,-7],[Math.PI/2,0,0]);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const x=2+Math.cos(a)*1.2,z=-7+Math.sin(a)*1.2;tube([[2,16,-7],[x,15,z]],.045);candle(x,15,z,.5);}
  for(const [x,y,z,power,distance] of [[-4,4,3,24,17],[2,7,-3,30,17],[9,4,-9,30,13]]) {
    const light=new THREE.PointLight('#ffb565',power,distance,2);light.position.set(x,y,z);room.add(light);
  }
  const key=new THREE.SpotLight('#ffc179',190,35,.7,.7,1.5);key.position.set(-6,10,9);key.target.position.set(-1.5,5,1);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0004;key.shadow.normalBias=.03;key.shadow.camera.near=.5;key.shadow.camera.far=35;room.add(key,key.target);
  const windowLight=new THREE.SpotLight('#9bc6ef',600,45,.43,.85,1.5);windowLight.position.set(10,12,-13);windowLight.target.position.set(-3,1,4);room.add(windowLight,windowLight.target);
  // A restrained arcane halo is real scene geometry, independent of the dial texture.
  const runeMap=canvasMap((ctx,w,h)=>{
    ctx.translate(w/2,h/2);ctx.strokeStyle='#7ea9a1';ctx.fillStyle='#a7c1a2';ctx.lineWidth=1.5;
    for(const r of [w*.43,w*.47]){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();}
    const glyphs=['☽','✧','♄','∴','☉','♃','✦','☿'];ctx.font='24px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
    for(let i=0;i<32;i++){const a=i*Math.PI/16;ctx.save();ctx.translate(Math.sin(a)*w*.45,-Math.cos(a)*w*.45);ctx.rotate(a);ctx.fillText(glyphs[i%glyphs.length],0,0);ctx.restore();}
  },1024,1024);
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(8.1,8.1),new THREE.MeshBasicMaterial({map:runeMap,transparent:true,opacity:.24,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  halo.position.set(-1.6,5.4,.75);room.add(halo);
  const spellGeometry=new THREE.BufferGeometry();const spellPoints=[];
  for(let i=0;i<64;i++){const a=rand()*Math.PI*2,r=3.6+rand()*.7;spellPoints.push(-1.6+Math.sin(a)*r,5.4+Math.cos(a)*r,.4+rand()*.7);}
  spellGeometry.setAttribute('position',new THREE.Float32BufferAttribute(spellPoints,3));
  room.add(new THREE.Points(spellGeometry,new THREE.PointsMaterial({color:'#97c9ba',size:.022,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending})));
  const moonFill=new THREE.PointLight('#91bee6',85,24,2);moonFill.position.set(9,9,-7);room.add(moonFill);
  // Soft shafts from the Gothic window suggest moonlit haze, without a flat backdrop.
  const shaftMaterial=new THREE.MeshBasicMaterial({color:'#7aaed0',transparent:true,opacity:.012,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const from=new THREE.Vector3(10,12,-13),to=new THREE.Vector3(-3,1,4),delta=to.clone().sub(from);
  const shaft=new THREE.Mesh(new THREE.ConeGeometry(4,delta.length(),24,1,true),shaftMaterial);
  shaft.position.copy(from).add(to).multiplyScalar(.5);shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().negate().normalize());room.add(shaft);
  // Quiet dust motes supply depth; motion stays limited to the clock hands.
  const dust=[];for(let i=0;i<160;i++)dust.push(rand()*22-10,rand()*15+1,-rand()*17);
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dust,3));
  room.add(new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:'#dcc49d',size:.025,transparent:true,opacity:.45,depthWrite:false})));
  for(const [mat,geometries] of batches) {
    const merged=mergeGeometries(geometries,false);const object=new THREE.Mesh(merged,mat);object.castShadow=true;object.receiveShadow=true;room.add(object);geometries.forEach(g=>g.dispose());
  }
  scene.traverse(o=>{if(o.material)for(const mat of Array.isArray(o.material)?o.material:[o.material])if(mat.isMeshStandardMaterial)mat.envMapIntensity=.23;});
  return room;
}
