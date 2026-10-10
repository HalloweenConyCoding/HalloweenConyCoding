import * as THREE from '../assets/vendor/three.module.js';
import {GLTFLoader} from '../assets/vendor/GLTFLoader.js';

/** The ancient timepiece is a floating artifact; there is no surrounding room. */
export async function buildLibrary(scene,clock,animations) {
  const gltf=await new GLTFLoader().loadAsync(new URL('../assets/models/astronomical-clock.glb?v=floating-1',import.meta.url).href);
  clock.add(gltf.scene);clock.position.set(0,.5,0);clock.rotation.y=.12;
  for(const [name,speed] of [['MinuteHand',.007],['HourHand',.0006]]) {
    const object=gltf.scene.getObjectByName(name);if(object)animations.push({object,speed});
  }
  const adjusted=new Set();
  gltf.scene.traverse(object=>{if(object.isMesh)for(const mat of Array.isArray(object.material)?object.material:[object.material]) {
    if(adjusted.has(mat))continue;adjusted.add(mat);
    if(mat.name==='Antique gold'){mat.color.multiplyScalar(.78);mat.roughness=.44;}
    if(mat.name==='Polished engraved brass'){mat.roughness=.38;}
    if(mat.name==='Mechanism recess'){mat.emissive.set('#a86225');mat.emissiveIntensity=.2;}
  }});
  // Sparse local sparks and an orbit reinforce the artifact's suspension.
  const orbit=new THREE.Mesh(new THREE.TorusGeometry(4.35,.018,6,128),new THREE.MeshBasicMaterial({color:'#bc9760',transparent:true,opacity:.35}));
  orbit.position.set(0,4.8,0);orbit.rotation.set(.25,.35,-.15);clock.add(orbit);
  const positions=[];let seed=816;
  for(let i=0;i<72;i++){seed=(seed*1664525+1013904223)>>>0;const a=seed/4294967296*Math.PI*2;seed=(seed*1664525+1013904223)>>>0;const r=4.4+seed/4294967296;positions.push(Math.sin(a)*r,4.8+Math.cos(a)*r,Math.sin(a*3)*1.1);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  clock.add(new THREE.Points(geometry,new THREE.PointsMaterial({color:'#e6b873',size:.035,transparent:true,opacity:.65})));
}
