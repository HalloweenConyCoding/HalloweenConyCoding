import * as THREE from '../assets/vendor/three.module.js';

// Deterministic, locally authored surfaces: no downloaded artwork or model files.
export function weatheredSurface(kind, repeat=1) {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');let seed=913;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  ctx.fillStyle=kind==='bronze'?'#9b7648':'#817766';ctx.fillRect(0,0,512,512);
  for(let i=0;i<18000;i++) {
    const x=random()*512,y=random()*512,r=random()*3+.3;
    ctx.fillStyle=kind==='bronze'?(i%4===0?'rgba(43,99,86,.22)':'rgba(49,31,17,.12)'):(i%2?'rgba(34,31,25,.13)':'rgba(215,202,171,.12)');
    ctx.fillRect(x,y,r,r);
  }
  for(let i=0;i<100;i++) {
    ctx.strokeStyle=kind==='bronze'?'rgba(39,84,72,.25)':'rgba(40,35,27,.16)';ctx.lineWidth=random()*2+.3;
    const x=random()*512,y=random()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*65-30,y+random()*80);ctx.stroke();
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(repeat,repeat);return map;
}

export function buildClock(parent, animations) {
  const bronzeMap=weatheredSurface('bronze');const stoneMap=weatheredSurface('stone');
  const bronze=new THREE.MeshStandardMaterial({map:bronzeMap,bumpMap:bronzeMap,bumpScale:.025,metalness:.72,roughness:.57});
  const gold=new THREE.MeshStandardMaterial({color:'#c9a56a',metalness:.72,roughness:.38});
  const stone=new THREE.MeshStandardMaterial({map:stoneMap,bumpMap:stoneMap,bumpScale:.065,roughness:.96});
  const dark=new THREE.MeshStandardMaterial({color:'#162a2b',metalness:.45,roughness:.6});
  const mesh=(geometry,material,pos=[0,0,0],host=parent)=>{const m=new THREE.Mesh(geometry,material);m.position.set(...pos);host.add(m);return m;};
  const box=(size,pos,mat=stone)=>mesh(new THREE.BoxGeometry(...size),mat,pos);
  const ring=(radius,tube,z,mat=bronze)=>mesh(new THREE.TorusGeometry(radius,tube,10,128),mat,[0,5.5,z]);
  // Recessed masonry joints and projecting cornices catch real directional light.
  box([10.8,.55,3.5],[0,.27,-.8]);box([10.3,.32,3.15],[0,.7,-.8]);
  const blocks=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),stone,120);parent.add(blocks);
  const transform=new THREE.Object3D();let count=0;
  for(let row=0;row<11;row++) for(let col=0;col<9;col++) {
    const x=(col-4)*1.05+(row%2?.25:0);
    transform.position.set(x,1.2+row*.86,-1.25);transform.scale.set(1.02,.82,1.45);transform.rotation.z=Math.sin(row*7+col)*.002;transform.updateMatrix();blocks.setMatrixAt(count++,transform.matrix);
  }
  blocks.count=count;blocks.instanceMatrix.needsUpdate=true;
  for(const x of [-4.7,4.7]) {
    box([1.1,9.6,1.8],[x,5.55,-.65]);
    for(let i=0;i<12;i++) box([1.22,.13,1.96],[x,1.2+i*.76,-.62]);
    box([1.5,.34,2.25],[x,10.4,-.6]);box([1.6,.3,2.3],[x,.98,-.6]);
  }
  for(const [y,width,depth] of [[10.65,11.4,2.6],[11,11,2.4],[11.32,11.65,2.8]]) box([width,.28,depth],[0,y,-.7]);
  // Voussoirs make the dial read as an architectural opening rather than a slab.
  const voussoirs=new THREE.InstancedMesh(new THREE.BoxGeometry(.62,.9,1.2),stone,32);parent.add(voussoirs);
  for(let i=0;i<32;i++){const a=i*Math.PI/16;transform.position.set(Math.sin(a)*3.92,5.5+Math.cos(a)*3.92,-.12);transform.scale.set(1,1,1);transform.rotation.z=-a;transform.updateMatrix();voussoirs.setMatrixAt(i,transform.matrix);}
  const drum=mesh(new THREE.CylinderGeometry(3.58,3.58,.45,96),bronze,[0,5.5,.02]);drum.rotation.x=Math.PI/2;
  mesh(new THREE.CircleGeometry(3.36,96),dark,[0,5.5,.27]);
  for(const [r,t,z] of [[3.58,.12,.3],[3.39,.045,.34],[2.79,.05,.36],[2.68,.018,.37],[2.25,.022,.39],[.3,.07,.7]]) ring(r,t,z,r===3.58?bronze:gold);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=2048;const ctx=canvas.getContext('2d');ctx.translate(1024,1024);
  ctx.fillStyle='#ceac72';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='96px Georgia';
  const numerals=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
  for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.save();ctx.translate(Math.sin(a)*870,-Math.cos(a)*870);ctx.rotate(a);ctx.fillText(numerals[i],0,0);ctx.restore();}
  for(let i=0;i<240;i++){const a=i*Math.PI/120;ctx.strokeStyle=i%20===0?'#e2c68c':'#80735a';ctx.lineWidth=i%20===0?5:2;ctx.beginPath();ctx.moveTo(Math.sin(a)*792,-Math.cos(a)*792);ctx.lineTo(Math.sin(a)*(i%5?779:761),-Math.cos(a)*(i%5?779:761));ctx.stroke();}
  ctx.font='26px Georgia';ctx.fillStyle='#8c9b84';ctx.fillText('OBSERVATORIUM • TEMPUS ET STELLAE',0,330);ctx.fillText('MMXXVI',0,375);
  // Fine astronomical etching beneath the mechanism.
  ctx.strokeStyle='rgba(147,176,153,.32)';ctx.lineWidth=2;
  for(let r=110;r<=600;r+=95){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();}
  for(let i=0;i<24;i++){const a=i*Math.PI/12;ctx.beginPath();ctx.moveTo(Math.cos(a)*90,Math.sin(a)*90);ctx.lineTo(Math.cos(a)*650,Math.sin(a)*650);ctx.stroke();}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(6.72,6.72),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false}),[0,5.5,.4]);
  // Extruded annular toothed wheels replace hundreds of separate box teeth.
  for(const [x,y,r,teeth,speed] of [[-1.1,.8,.9,32,.015],[.7,1.15,.77,28,-.017],[1.35,-.3,.66,24,.019],[-.5,-1.2,.95,34,-.014],[-1.65,-.6,.43,18,.029],[.1,.0,.42,18,-.028]]) {
    const shape=new THREE.Shape();for(let i=0;i<=teeth*4;i++){const a=i/(teeth*4)*Math.PI*2,rr=r*(i%4===1||i%4===2?1:.9);if(i===0)shape.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else shape.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}
    const hole=new THREE.Path();hole.absarc(0,0,r*.65,0,Math.PI*2,true);shape.holes.push(hole);
    const g=new THREE.Group();g.position.set(x,y+5.5,.5);parent.add(g);
    mesh(new THREE.ExtrudeGeometry(shape,{depth:.09,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.016,bevelThickness:.012,curveSegments:48}),bronze,[0,0,0],g);
    for(let i=0;i<5;i++){const spoke=mesh(new THREE.BoxGeometry(r*1.45,.045,.07),gold,[0,0,.04],g);spoke.rotation.z=i*Math.PI/5;}
    mesh(new THREE.CylinderGeometry(.12,.12,.18,16),gold,[0,0,.09],g).rotation.x=Math.PI/2;
    animations.push({object:g,speed});
  }
  for(const [length,angle,speed] of [[2.5,-.82,.007],[1.85,.85,.0006]]) {
    const g=new THREE.Group();g.position.set(0,5.5,.78);g.rotation.z=angle;parent.add(g);
    const shape=new THREE.Shape();shape.moveTo(0,-.55);shape.bezierCurveTo(-.25,-.3,-.11,0,-.055,.2);shape.lineTo(-.05,length-.35);shape.lineTo(-.15,length-.48);shape.lineTo(0,length);shape.lineTo(.15,length-.48);shape.lineTo(.05,length-.35);shape.lineTo(.055,.2);shape.bezierCurveTo(.11,0,.25,-.3,0,-.55);
    mesh(new THREE.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2}),gold,[0,0,0],g);animations.push({object:g,speed});
  }
  mesh(new THREE.SphereGeometry(.17,24,16),bronze,[0,5.5,.98]);
  const bolts=new THREE.InstancedMesh(new THREE.SphereGeometry(.055,8,6),gold,48);parent.add(bolts);
  for(let i=0;i<48;i++){const a=i*Math.PI/24;transform.position.set(Math.sin(a)*3.48,5.5+Math.cos(a)*3.48,.42);transform.scale.set(1,1,.5);transform.rotation.set(0,0,0);transform.updateMatrix();bolts.setMatrixAt(i,transform.matrix);}
  // A recessed pendulum and grille below the main mechanism.
  box([1.8,1.3,.1],[0,1.6,-.46],dark);box([.07,1.1,.12],[0,1.75,-.31],gold);
  mesh(new THREE.SphereGeometry(.32,24,12),bronze,[0,1.18,-.26]).scale.z=.3;
  for(const x of [-.7,-.35,.35,.7]) box([.04,1.15,.05],[x,1.6,-.2],bronze);
  for(const x of [-5.65,5.65]) {
    box([.8,.4,.8],[x,.2,.65]);box([.13,2,.13],[x,1.35,.65],bronze);
    const flame=new THREE.MeshBasicMaterial({color:'#ffd799'});box([.38,.62,.38],[x,2.55,.65],flame);
    for(const dx of [-.23,.23])for(const dz of [-.23,.23])box([.04,.7,.04],[x+dx,2.55,.65+dz],bronze);
    mesh(new THREE.ConeGeometry(.43,.35,4),bronze,[x,3.05,.65]).rotation.y=Math.PI/4;
    const light=new THREE.PointLight('#ffba64',24,9,2);light.position.set(x,2.65,1);parent.add(light);
  }
}
