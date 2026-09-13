import {controllers,destroy} from '../../canvas-effects/assets/mengto-demo/main.mjs';
const result=document.querySelector('#probe-status');
const frames=n=>new Promise(resolve=>{let left=n;const tick=()=>--left<=0?resolve():requestAnimationFrame(tick);requestAnimationFrame(tick);});
const pixels=canvas=>new Uint8ClampedArray(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data);
const differs=(a,b)=>a.length!==b.length||a.some((x,i)=>x!==b[i]);
const colors=a=>{const s=new Set();for(let i=0;i<a.length;i+=4)s.add(a[i]+','+a[i+1]+','+a[i+2]);return s.size;};
document.querySelector('#run-probe').addEventListener('click',async event=>{
 event.currentTarget.disabled=true;const checks={};
 try{
 const pairs=[...controllers].map(([name,c])=>({name,c,canvas:document.querySelector(`[data-study="${name}"] canvas`)}));
 checks['two-real-canvases']=pairs.length===2;
 checks['no-horizontal-overflow']=document.documentElement.scrollWidth<=innerWidth;
 for(const p of pairs){p.before=pixels(p.canvas);checks[p.name+'-composed-pixels']=colors(p.before)>20;checks[p.name+'-static-first']=p.c.getState().pendingFrame===false;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 for(const p of pairs)p.c.play();
 await frames(12);
 for(const p of pairs){const s=p.c.getState();checks[p.name+(reduced?'-reduced-static':'-real-motion')]=reduced?!differs(p.before,pixels(p.canvas)):differs(p.before,pixels(p.canvas));p.c.stop('probe');p.stopped=pixels(p.canvas);}
 await frames(8);
 for(const p of pairs){checks[p.name+'-stop-keeps-pixels']=!differs(p.stopped,pixels(p.canvas));checks[p.name+'-stop-no-pending']=p.c.getState().pendingFrame===false&&p.c.getState().pendingTimer===false;}
 destroy();await frames(4);
 for(const p of pairs){checks[p.name+'-destroy-static']=!differs(p.stopped,pixels(p.canvas));const state=p.c.getState();checks[p.name+'-owned-resources-released']=state.destroyed===true&&state.listenerCount===0&&state.observerCount===0&&state.pendingFrame===false&&state.pendingTimer===false;checks[p.name+'-controls-disabled']=[...p.canvas.closest('[data-study]').querySelectorAll('button')].every(b=>b.disabled);}
 checks['controllers-released']=controllers.size===0;
 result.textContent=JSON.stringify({checks,passed:Object.values(checks).every(Boolean)},null,2);
 result.dataset.complete='true';result.dataset.passed=String(Object.values(checks).every(Boolean));
 }catch(error){result.textContent=String(error.stack);result.dataset.complete='true';result.dataset.passed='false';destroy();}
},{once:true});
