import test from 'node:test';
import assert from 'node:assert/strict';
const modulePath = new URL('../js/camera-path.mjs', import.meta.url);
let api;
try { api = await import(modulePath); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
test('camera implementation exists', () => assert.ok(api, 'Camera route must be implemented'));
if (api) {
  const {progressFor, sampleCamera, damp} = api;
  test('scroll positions map to measured chapters', () => {
    assert.equal(progressFor(0,[0,1000,2000,3000],4000),0);
    assert.equal(progressFor(2000,[0,1000,2000,3000],4000),.5);
    assert.equal(progressFor(4000,[0,1000,2000,3000],4000),1);
    assert.equal(progressFor(-100,[0,1000,2000,3000],4000),0);
    assert.equal(progressFor(6000,[0,1000,2000,3000],4000),1);
  });
  test('reverse scroll and layout changes remain monotonic and finite', () => {
    const starts=[0,400,1400,1800];
    const reverse=[2400,1800,1400,400,0].map(y=>progressFor(y,starts,2400));
    assert.deepEqual(reverse,[1,.75,.5,.25,0]);
    assert.equal(progressFor(2000,[0,2000,3000,4000],5000),.25);
    assert.equal(progressFor(0,[0,0,0,0],0),0);
    for(const y of [0,1,50,100]) assert.ok(Number.isFinite(progressFor(y,[0,0,0,50],100)));
    assert.ok(Number.isFinite(progressFor(NaN,[],NaN)));
  });
  test('endpoint views and narrow composition',()=>{
    assert.deepEqual(sampleCamera(0,false).position,[8,6,14]);
    assert.deepEqual(sampleCamera(1,false).target,[54,17,-45]);
    assert.equal(sampleCamera(0,false).fov,48);
    assert.equal(sampleCamera(0,true).fov,58);
    assert.notDeepEqual(sampleCamera(.5,true).position,sampleCamera(.5,false).position);
  });
  test('camera route is continuous with finite noncollapsing views',()=>{
    for(let i=0;i<=1000;i++){
      const sample=sampleCamera(i/1000,false);
      assert.ok([...sample.position,...sample.target,sample.fov].every(Number.isFinite));
      assert.ok(Math.hypot(...sample.position.map((v,j)=>v-sample.target[j]))>1);
    }
    for(const boundary of [.25,.5,.75]){
      const a=sampleCamera(boundary-1e-6,false), b=sampleCamera(boundary+1e-6,false);
      assert.ok(Math.hypot(...a.position.map((v,j)=>v-b.position[j]))<.001);
      assert.ok(Math.hypot(...a.target.map((v,j)=>v-b.target[j]))<.001);
    }
  });
  test('damping is time based and never overshoots',()=>{
    function run(hz){let v=0;for(let i=0;i<hz;i++) v=damp(v,1,1/hz);return v;}
    assert.ok(Math.abs(run(30)-run(60))<1e-6);
    assert.equal(damp(.2,.8,0),.2);
    assert.ok(damp(.2,.8,1/60)>.2 && damp(.2,.8,1/60)<.8);
  });
}
