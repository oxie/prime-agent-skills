import test from 'node:test';
import assert from 'node:assert/strict';
import {backingSize, pointerPosition, createHost, LIMITS} from '../assets/host.mjs';
import {advanceParticle, ENTITY_LIMITS} from '../assets/effects.mjs';
import {createWarp} from '../assets/warp.mjs';

test('backing dimensions preserve layout while bounding DPR and total pixels', () => {
  for (const [w,h,d] of [[400,240,3],[3000,2000,4],[320,150,1],[0,0,NaN],[1e9,1,2],[1,1e9,2]]) {
    const size=backingSize(w,h,d);
    assert.ok(size.pixelWidth*size.pixelHeight <= LIMITS.pixels);
    assert.ok(size.dpr <= 2 && size.dpr > 0);
    assert.ok(size.pixelWidth >= 1 && size.pixelHeight >= 1);
  }
  assert.deepEqual(backingSize(400,200,2), {width:400,height:200,dpr:2,pixelWidth:800,pixelHeight:400});
});
test('pointer coordinates use current viewport rect and CSS scale, not old scroll offsets', () => {
  assert.deepEqual(pointerPosition({clientX:160,clientY:90},{left:60,top:40,width:200,height:100},400,200),{x:200,y:100});
  assert.deepEqual(pointerPosition({clientX:-10,clientY:800},{left:0,top:0,width:200,height:100},400,200),{x:0,y:200});
});
test('particle integration is numerical, wraps position, caps speed and large dt', () => {
  const p={x:99,y:1,vx:40,vy:-40}; advanceParticle(p,1,100,100,null);
  assert.equal(p.x,1); assert.equal(p.y,99);
  const q={x:30,y:30,vx:200,vy:200};advanceParticle(q,.02,100,100,{x:20,y:20});
  assert.ok(Math.hypot(q.vx,q.vy)<=65+1e-9); assert.ok(q.x>30 && q.y>30);
  assert.deepEqual(advanceParticle({x:1,y:2,vx:3,vy:4},-1,10,10,null),{x:1,y:2,vx:3,vy:4});
  assert.equal(ENTITY_LIMITS.particles,96);
});
function fixture({reduced=false, broken=false, durationMs=40, mediaFailure=false}={}) {
  const callbacks=new Map(), timers=new Map(), ros=[], ios=[];
  let id=0, now=0, rendered=0, released=0, resets=0;
  const media=new EventTarget();media.matches=reduced;
  class RO {constructor(fn){this.fn=fn;this.active=false;ros.push(this);}observe(){this.active=true;}disconnect(){this.active=false;}}
  class IO {constructor(fn){this.fn=fn;this.active=false;ios.push(this);}observe(){this.active=true;}disconnect(){this.active=false;}}
  const win=Object.assign(new EventTarget(),{matchMedia:mediaFailure==='missing' ? undefined : ()=>{if(mediaFailure)throw Error('media unavailable');return media;},ResizeObserver:RO,IntersectionObserver:IO,devicePixelRatio:3,
    innerWidth:1000,innerHeight:1000,performance:{now:()=>now},
    requestAnimationFrame:fn=>{callbacks.set(++id,fn);return id;},cancelAnimationFrame:id=>callbacks.delete(id),
    setTimeout:(fn,ms)=>{timers.set(++id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)});
  const doc=new EventTarget();doc.defaultView=win;doc.hidden=false;
  const canvas=new EventTarget();canvas.ownerDocument=doc;
  canvas.rect={left:20,top:40,width:400,height:200,right:420,bottom:240};
  canvas.getBoundingClientRect=()=>canvas.rect;
  const playButton=new EventTarget(),stopButton=new EventTarget(),status={};
  const renderer={backend:'test',render(){rendered++;if(broken)throw Error('injected render');},reset(){resets++;},destroy(){released++;}};
  const api=createHost({canvas,playButton,stopButton,status,createRenderer:()=>renderer,durationMs});
  return {api,callbacks,timers,ros,ios,media,win,doc,canvas,playButton,stopButton,status,
    get rendered(){return rendered;},get released(){return released;},get resets(){return resets;},
    frame(ms){now=ms;const entries=[...callbacks.values()];callbacks.clear();for(const fn of entries)fn(ms);}};
}
test('mount draws one still without scheduling; native click starts finite frames; Stop cancels work',()=>{
  const f=fixture();assert.equal(f.rendered,1);assert.equal(f.callbacks.size,0);assert.equal(f.timers.size,0);
  f.playButton.dispatchEvent(new Event('click'));assert.equal(f.callbacks.size,1);assert.equal(f.timers.size,1);
  f.frame(16);assert.equal(f.rendered,2);assert.equal(f.callbacks.size,1);
  f.stopButton.dispatchEvent(new Event('click'));assert.equal(f.callbacks.size,0);assert.equal(f.timers.size,0);
  const before=f.rendered;f.frame(32);assert.equal(f.rendered,before);
  f.api.play();f.frame(80);assert.equal(f.callbacks.size,0);assert.equal(f.timers.size,0);
  f.api.destroy();
});
test('duration capped even for API consumers and timeout cancels a throttled RAF',()=>{
  const f=fixture({durationMs:1e9});f.api.play();const timer=[...f.timers.values()][0];
  assert.equal(timer.ms,10000);timer.fn();assert.equal(f.callbacks.size,0);assert.equal(f.api.getState().running,false);f.api.destroy();
});
test('live reduced motion, hidden and offscreen stop; return never schedules an animation',()=>{
  for(const condition of ['reduced','hidden','offscreen']) {
    const f=fixture();f.api.play();
    if(condition==='reduced'){f.media.matches=true;f.media.dispatchEvent(new Event('change'));}
    if(condition==='hidden'){f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));}
    if(condition==='offscreen')f.ios[0].fn([{isIntersecting:false}]);
    assert.equal(f.callbacks.size,0);assert.equal(f.timers.size,0);
    f.media.matches=false;f.media.dispatchEvent(new Event('change'));f.doc.hidden=false;f.doc.dispatchEvent(new Event('visibilitychange'));f.ios[0].fn([{isIntersecting:true}]);
    assert.equal(f.callbacks.size,0);assert.equal(f.timers.size,0);f.api.destroy();
  }
  const f=fixture({reduced:true});assert.equal(f.api.play(),false);assert.equal(f.rendered,1);assert.equal(f.callbacks.size,0);f.api.destroy();
});
test('destroy removes actual callbacks, observers, controls and is idempotent',()=>{
  const f=fixture();f.api.play();f.api.destroy();f.api.destroy();
  assert.equal(f.released,1);assert.ok([...f.ros,...f.ios].every(o=>!o.active));
  assert.equal(f.callbacks.size,0);assert.equal(f.timers.size,0);
  f.playButton.dispatchEvent(new Event('click'));f.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.resets,1);assert.equal(f.callbacks.size,0);assert.equal(f.api.getState().listenerCount,0);
});
test('partial render failure disposes initialized resources and keeps readable fallback',()=>{
  const f=fixture({broken:true});assert.equal(f.released,1);assert.equal(f.canvas.hidden,true);
  assert.match(f.status.textContent,/unavailable/);assert.ok([...f.ros,...f.ios].every(o=>!o.active));
  f.playButton.dispatchEvent(new Event('click'));assert.equal(f.callbacks.size,0);f.api.destroy();assert.equal(f.released,1);
});
test('context loss stops and releases without automatic restoration',()=>{
  const f=fixture();f.api.play();const loss=new Event('webglcontextlost',{cancelable:true});f.canvas.dispatchEvent(loss);
  assert.equal(loss.defaultPrevented,true);assert.equal(f.released,1);assert.equal(f.canvas.hidden,true);assert.match(f.status.textContent,/context lost/);
  f.canvas.dispatchEvent(new Event('webglcontextrestored'));assert.equal(f.api.play(),false);assert.equal(f.callbacks.size,0);f.api.destroy();
});
test('GPU shader compile failure deletes partial allocation',()=>{
  const deleted=[];const gl={VERTEX_SHADER:1,COMPILE_STATUS:2,createShader:()=>({id:1}),shaderSource(){},compileShader(){},getShaderParameter:()=>false,deleteShader:s=>deleted.push(s)};
  assert.throws(()=>createWarp({getContext:()=>gl}),/compilation/);assert.equal(deleted.length,1);
  assert.throws(()=>createWarp({getContext:()=>null}),/unavailable/);
});

test('pagehide disposes native resources; history return remains static until remount',()=>{
  const f=fixture();f.api.play();f.win.dispatchEvent(new Event('pagehide'));
  assert.equal(f.released,1);assert.equal(f.callbacks.size,0);assert.equal(f.timers.size,0);
  assert.ok([...f.ros,...f.ios].every(o=>!o.active));assert.equal(f.playButton.disabled,true);
  const draws=f.rendered;f.win.dispatchEvent(new Event('pageshow'));f.playButton.dispatchEvent(new Event('click'));f.frame(20);
  assert.equal(f.rendered,draws);assert.equal(f.api.play(),false);assert.match(f.status.textContent,/inactive/);
});
test('missing or throwing media query API produces readable fallback without throwing',()=>{
  for(const mediaFailure of ['missing','throwing']) {
    const f=fixture({mediaFailure});assert.equal(f.canvas.hidden,true);assert.match(f.status.textContent,/unavailable/);
    assert.equal(f.playButton.disabled,true);assert.equal(f.callbacks.size,0);assert.equal(f.released,0);f.api.destroy();
  }
});
test('unchanged and zero-size observations do not reset or repaint the canvas',()=>{
  const f=fixture(),first=f.rendered,original=f.canvas.width;
  f.ros[0].fn();assert.equal(f.rendered,first);
  f.canvas.rect={...f.canvas.rect,width:0,height:0};f.ros[0].fn();assert.equal(f.rendered,first);assert.equal(f.canvas.width,original);
  f.canvas.rect={...f.canvas.rect,width:200,height:100};f.ros[0].fn();assert.equal(f.rendered,first+1);assert.equal(f.canvas.width,400);
  f.api.destroy();
});
