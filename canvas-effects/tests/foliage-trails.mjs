import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createDistanceSampler,leafTumble,createFoliage,createPointerTrail,FOLIAGE_TRAIL_LIMITS} from '../assets/foliage-trails.mjs';
import {createHost} from '../assets/host.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function samples(path,options={}) {const s=createDistanceSampler(options);return path.flatMap(([x,y])=>s.sample({x,y}));}
test('residual carry places the next mark where it is owed, not step past segment start',()=>{
  assert.deepEqual(samples([[0,0],[6,0],[12,0],[25,0]],{spacing:10}),[{x:10,y:0},{x:20,y:0}]);
  assert.deepEqual(samples([[0,0],[6,0],[6,8],[16,8]],{spacing:10}),[{x:6,y:4},{x:12,y:8}]);
});
test('collinear event partitions preserve exact expected spacing below cap',()=>{
  const expected=Array.from({length:20},(_,i)=>({x:(i+1)*5,y:(i+1)*12}));
  for(const fractions of [[0,1],[0,.03,.16,.51,.52,.89,1],Array.from({length:101},(_,i)=>i/100)]) {
    const marks=samples(fractions.map(t=>[100*t,240*t]),{spacing:13,cap:64});
    assert.equal(marks.length,expected.length);marks.forEach((p,i)=>{near(p.x,expected[i].x);near(p.y,expected[i].y);});
  }
});
test('cap discards overflow debt and resets at endpoint: idle cannot burst',()=>{
  const s=createDistanceSampler({spacing:10,cap:3});s.sample({x:0,y:0});
  assert.deepEqual(s.sample({x:105,y:0}),[{x:10,y:0},{x:20,y:0},{x:30,y:0}]);
  for(let i=0;i<100;i++)assert.deepEqual(s.sample({x:105,y:0}),[]);
  assert.deepEqual(s.sample({x:114,y:0}),[]);assert.deepEqual(s.sample({x:115,y:0}),[{x:115,y:0}]);
  assert.deepEqual(s.sample({x:300,y:0},0),[]);assert.deepEqual(s.sample({x:310,y:0}),[{x:310,y:0}]);
});
test('zero motion retains residual; reset/reentry and invalid input do not bridge',()=>{
  const s=createDistanceSampler({spacing:10});s.sample({x:0,y:0});s.sample({x:6,y:0});
  assert.deepEqual(s.sample({x:6,y:0}),[]);assert.deepEqual(s.sample({x:10,y:0}),[{x:10,y:0}]);
  s.reset();assert.deepEqual(s.sample({x:900,y:900}),[]);
  s.sample(null);assert.deepEqual(s.sample({x:0,y:0}),[]);
  s.sample({x:Infinity,y:0});assert.deepEqual(s.sample({x:900,y:0}),[]);
});
test('configuration and huge input cannot create runaway sampler allocation',()=>{
  const s=createDistanceSampler({spacing:-10,cap:1e8});s.sample({x:0,y:0});
  assert.equal(s.sample({x:1e12,y:0}).length,64);
  assert.equal(createDistanceSampler({spacing:NaN,cap:NaN}).sample({x:0,y:0}).length,0);
});
test('signed tumble selects front/back; sine slip peaks at edge and stalls at face',()=>{
  const face=leafTumble(0,20);assert.equal(face.scaleX,1);assert.equal(face.back,false);assert.equal(face.slipVelocity,0);
  const edge=leafTumble(Math.PI/2,20);near(edge.scaleX,0);near(edge.slipVelocity,20);
  const back=leafTumble(Math.PI,20);near(back.scaleX,-1);assert.equal(back.back,true);near(back.slipVelocity,0);
  near(leafTumble(3*Math.PI/2,20).slipVelocity,-20);near(leafTumble(Math.PI/2,1e8).slipVelocity,64);
});
function fixture(factory, {reduced=false,missingSprite=false}={}) {
  const frames=new Map(),timers=new Map(),observers=[],images=[],draws=[],scales=[],positions=[];
  let id=0,now=0;
  function context(isSprite=false) {
    return {setTransform(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},arc(){},bezierCurveTo(){},
      save(){},restore(){},rotate(){},translate(x,y){if(!isSprite)positions.push([x,y]);},scale(x,y){if(!isSprite)scales.push([x,y]);},
      drawImage(image,x,y,w,h){draws.push({image,x,y,w,h,alpha:this.globalAlpha});},
      createRadialGradient(){return {addColorStop(){}};}};
  }
  const media=Object.assign(new EventTarget(),{matches:reduced});
  class Observer {constructor(fn){this.fn=fn;this.active=false;observers.push(this);}observe(){this.active=true;}disconnect(){this.active=false;}}
  const win=Object.assign(new EventTarget(),{innerWidth:1000,innerHeight:1000,devicePixelRatio:3,
    matchMedia:()=>media,ResizeObserver:Observer,IntersectionObserver:Observer,performance:{now:()=>now},
    requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:i=>frames.delete(i),
    setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:i=>timers.delete(i)});
  const doc=Object.assign(new EventTarget(),{defaultView:win,hidden:false,createElement(){
    const image={width:0,height:0,getContext:()=>missingSprite ? null : context(true)};images.push(image);return image;
  }});
  const canvas=Object.assign(new EventTarget(),{ownerDocument:doc,getContext:()=>context(),
    getBoundingClientRect:()=>({left:20,top:30,width:400,height:240,right:420,bottom:270})});
  const playButton=new EventTarget(),stopButton=new EventTarget(),status={};
  const host=createHost({canvas,playButton,stopButton,status,createRenderer:factory,durationMs:8000});
  return {host,canvas,playButton,stopButton,status,media,doc,win,frames,timers,observers,images,draws,scales,positions,
    frame(t){now=t;const pending=[...frames.values()];frames.clear();for(const fn of pending)fn(t);},
    move(x,y){const e=new Event('pointermove');Object.assign(e,{clientX:x+20,clientY:y+30});canvas.dispatchEvent(e);}};
}
test('foliage uses baked front/back sprites, bounds leaves/sizes and applies signed scales',()=>{
  const f=fixture(c=>createFoliage(c,{count:1e8,wind:1e8}));
  assert.equal(f.images.length,6);assert.ok(f.images.every(i=>i.width===64 && i.height===64));
  assert.ok(f.draws.length>0 && f.draws.length<=128);assert.ok(f.scales.some(([x])=>x<0));assert.ok(f.scales.some(([x])=>x>0));
  assert.ok(new Set(f.draws.map(d=>d.image)).size>3);
  f.draws.forEach((d,i)=>assert.equal(d.image,f.images[(i%3)*2+Number(f.scales[i][0]<0)]));
  f.host.play();for(let i=1;i<=240;i++)f.frame(i*33);
  assert.ok(f.positions.every(([x,y])=>x>=-40 && x<=440 && y>=-40 && y<=280));
  assert.ok(f.draws.every(d=>d.w<=36 && d.h<=36 && d.alpha>=.32 && d.alpha<=.84));
  f.host.destroy();assert.ok(f.images.every(i=>i.width===0 && i.height===0));assert.equal(f.host.getState().entities,0);
});
test('trail actual host input has fixed per-frame budget and leave/reentry does not bridge',()=>{
  const f=fixture(createPointerTrail);assert.equal(f.draws.length,48);assert.equal(f.frames.size,0);
  f.playButton.dispatchEvent(new Event('click'));f.move(0,100);
  for(let i=0;i<200;i++)f.move(i%2 ? 400 : 0,100);
  const before=f.draws.length;f.frame(16);assert.equal(f.draws.length-before,48+24);
  f.canvas.dispatchEvent(new Event('pointerleave'));const count=f.host.getState().entities;
  f.move(300,10);assert.equal(f.host.getState().entities,count);f.move(314,10);assert.equal(f.host.getState().entities,count+1);
  f.canvas.dispatchEvent(new Event('pointercancel'));f.move(0,0);assert.equal(f.host.getState().entities,count+1);
  for(let i=0;i<100;i++)f.move(0,0);assert.equal(f.host.getState().entities,count+1);
  f.host.destroy();f.move(400,200);assert.equal(f.host.getState().entities,0);assert.ok(f.images.every(i=>i.width===0));
});
test('both renderers retain host finite/static/RM/hidden/offscreen/destroy lifecycle',()=>{
  for(const factory of [createFoliage,createPointerTrail]) {
    for(const stop of ['stop','reduced','hidden','offscreen','timeout','pagehide']) {
      const f=fixture(factory);assert.ok(f.draws.length>0);assert.equal(f.frames.size,0);assert.equal(f.timers.size,0);
      f.host.play();f.frame(16);const paints=f.draws.length;
      if(stop==='stop')f.stopButton.dispatchEvent(new Event('click'));
      if(stop==='reduced'){f.media.matches=true;f.media.dispatchEvent(new Event('change'));}
      if(stop==='hidden'){f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));}
      if(stop==='offscreen')f.observers[1].fn([{isIntersecting:false}]);
      if(stop==='timeout')[...f.timers.values()][0]();
      if(stop==='pagehide')f.win.dispatchEvent(new Event('pagehide'));
      assert.equal(f.frames.size,0);assert.equal(f.timers.size,0);
      f.media.matches=false;f.media.dispatchEvent(new Event('change'));f.doc.hidden=false;f.doc.dispatchEvent(new Event('visibilitychange'));
      f.observers[1].fn([{isIntersecting:true}]);f.frame(32);assert.equal(f.draws.length,paints);
      f.host.destroy();f.host.destroy();assert.ok(f.observers.every(o=>!o.active));assert.ok(f.images.every(i=>i.width===0));
    }
    const f=fixture(factory,{reduced:true});assert.ok(f.draws.length>0);assert.equal(f.host.play(),false);assert.equal(f.playButton.disabled,true);f.host.destroy();
  }
});
test('sprite failure gives host fallback and clears partial sprite allocation',()=>{
  for(const factory of [createFoliage,createPointerTrail]) {
    const f=fixture(factory,{missingSprite:true});assert.equal(f.canvas.hidden,true);assert.equal(f.frames.size,0);
    assert.ok(f.images.every(i=>i.width===0));assert.match(f.status.textContent,/unavailable/);f.host.destroy();
  }
});
test('new demo has two semantic panels, disabled controls, local imports and static art',()=>{
  const html=readFileSync(new URL('../assets/mengto-demo/index.html',import.meta.url),'utf8');
  assert.equal((html.match(/<section /g)||[]).length,2);assert.equal((html.match(/<svg /g)||[]).length,2);
  assert.equal((html.match(/<button[^>]* disabled/g)||[]).length,4);
  assert.ok(!/(?:src|href)=["']https?:/.test(html));assert.ok(!/autoplay|role="application"/.test(html));
  assert.equal(FOLIAGE_TRAIL_LIMITS.motes,192);
});

test('trail ring writes matched position/life slots, stays bounded and expires without idle emission',()=>{
  const f=fixture(c=>createPointerTrail(c,{count:8,spacing:14}));
  f.host.play();f.move(0,100);f.move(400,100);
  const before=f.draws.length;f.frame(0);const drawn=f.draws.slice(before);
  assert.equal(drawn.length,8);
  // First 24 marks are 14..336. Eight slots must retain 238..336 in order.
  drawn.forEach((d,i)=>{near(d.x+d.w/2,238+14*i);near(d.y+d.h/2,100);near(d.alpha,0);});
  assert.equal(f.host.getState().entities,8);
  for(let i=1;i<=100;i++)f.frame(i*50);
  assert.equal(f.host.getState().entities,0);assert.equal(f.images.length,1);f.host.destroy();
});
