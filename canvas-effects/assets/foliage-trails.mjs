// Bounded Canvas2D studies. The existing host owns scheduling, sizing and input.
export const FOLIAGE_TRAIL_LIMITS = Object.freeze({leaves:128, motes:192, perFrame:24, spriteSize:64});
const clamp = (v, lo, hi, fallback) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : fallback));
const fract = v => v - Math.floor(v);
const seed = (i, salt) => fract(Math.sin(i * 127.1 + salt * 311.7) * 43758.5453);
const wrap = (v, span) => ((v % span) + span) % span;

// Residual is distance since the last mark, NOT distance still owed.
// Over budget: keep at most cap marks, discard ALL remaining debt and anchor
// at the new endpoint. A stationary follow-up can never flush a backlog.
export function createDistanceSampler({spacing = 14, cap = 24} = {}) {
  spacing = clamp(spacing, 1, 128, 14);
  cap = Math.floor(clamp(cap, 0, 64, 24));
  let last = null, residual = 0;
  return {
    reset() { last = null; residual = 0; },
    sample(point, budget = cap) {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        last = null; residual = 0; return [];
      }
      const end = {x:point.x, y:point.y};
      if (!last) { last = end; return []; }
      const dx = end.x-last.x, dy = end.y-last.y, distance = Math.hypot(dx,dy);
      if (!Number.isFinite(distance)) { last = end; residual = 0; return []; }
      if (distance === 0) return [];
      const max = Math.floor(clamp(budget, 0, cap, cap));
      const count = Math.floor((residual + distance + 1e-9) / spacing);
      const marks = [];
      for (let i=0; i<Math.min(max,count); i++) {
        const t = Math.min(1, (spacing-residual+i*spacing)/distance);
        marks.push({x:last.x+dx*t, y:last.y+dy*t});
      }
      residual = count > max ? 0 : Math.max(0, residual+distance-count*spacing);
      last = end;
      return marks;
    }
  };
}

export function leafTumble(spin, slip = 24) {
  spin = Number.isFinite(spin) ? spin : 0;
  const scaleX = Math.cos(spin);
  return {scaleX, back:scaleX < 0, slipVelocity:Math.sin(spin)*clamp(slip,0,64,24)};
}
function sprite(canvas, paint) {
  const image = canvas.ownerDocument.createElement('canvas');
  image.width = image.height = FOLIAGE_TRAIL_LIMITS.spriteSize;
  try {
    const ctx = image.getContext('2d');
    if (!ctx) throw Error('Sprite Canvas2D unavailable');
    paint(ctx); return image;
  } catch (error) { image.width = image.height = 0; throw error; }
}
function leafSprite(canvas, color, back) {
  return sprite(canvas, ctx => {
    // Original toothed, asymmetric blade and forked veins, baked once.
    ctx.beginPath();
    const outline = [[32,5],[39,17],[45,14],[44,24],[54,22],[49,32],
      [57,35],[45,41],[48,46],[35,49],[30,56],[25,46],[17,48],
      [19,39],[9,35],[18,29],[14,22],[24,24],[23,15],[29,19]];
    outline.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.closePath(); ctx.fillStyle=color; ctx.fill();
    ctx.strokeStyle=back ? '#d5c6a2' : '#592b20'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(29,62);ctx.lineTo(32,10);
    for (const [x,y] of [[20,29],[44,24],[17,35],[48,35],[24,44],[42,42]]) {
      ctx.moveTo(31,y+7);ctx.lineTo(x,y);
    }
    ctx.stroke();
  });
}
function background(ctx, width, height, trail) {
  ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
  ctx.fillStyle=trail ? '#102a30' : '#172b29';ctx.fillRect(0,0,width,height);
  ctx.fillStyle=trail ? '#1b3d42' : '#d6b985';
  ctx.beginPath();ctx.arc(width*.78,height*.24,Math.min(width,height)*.12,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=trail ? '#0e2329' : '#102420';
  ctx.beginPath();ctx.moveTo(0,height);
  ctx.lineTo(0,height*.83);ctx.bezierCurveTo(width*.35,height*.48,width*.52,height*1.04,width,height*.68);
  ctx.lineTo(width,height);ctx.closePath();ctx.fill();
}
export function createFoliage(canvas, {count=72, wind=8} = {}) {
  const ctx=canvas.getContext('2d',{alpha:false});
  if (!ctx) throw Error('Canvas2D unavailable');
  count=Math.floor(clamp(count,1,FOLIAGE_TRAIL_LIMITS.leaves,72)); wind=clamp(wind,-40,40,8);
  const sprites=[];
  try {
    for (const [front,back] of [['#bd542d','#aa9672'],['#d49a3c','#b4a07f'],['#943f32','#9c8975']]) {
      sprites.push(leafSprite(canvas,front,false));sprites.push(leafSprite(canvas,back,true));
    }
  } catch(error) { for(const s of sprites)s.width=s.height=0;throw error; }
  let width=1,height=1,leaves=[],destroyed=false;
  function reset() {
    if(destroyed)return;
    const n=Math.min(count,Math.max(1,Math.round(count*clamp(Math.sqrt(width*height/(640*360)),.4,1,1))));
    leaves=Array.from({length:n},(_,i)=>{
      const depth=i/n; // far first; larger near leaves remain few.
      return {x:seed(i,1)*width,y:seed(i,2)*height,spin:seed(i,3)*Math.PI*2,
        spinRate:(.65+seed(i,4)*1.5)*(i%2 ? 1 : -1),roll:seed(i,5)*Math.PI*2,
        rollRate:(seed(i,6)-.5)*.7,slip:12+seed(i,7)*30,fall:16+depth*28+seed(i,8)*12,
        size:12+depth*24,alpha:.32+depth*.52,color:i%3};
    });
  }
  return {backend:'canvas2d',reset,
    resize(size){width=size.width;height=size.height;reset();},
    getEntityCount(){return leaves.length;},
    destroy(){if(destroyed)return;destroyed=true;leaves=[];for(const s of sprites)s.width=s.height=0;sprites.length=0;},
    render({pixelWidth,pixelHeight,dt=0,running=false}) {
      if(destroyed)return;
      dt=clamp(dt,0,1/30,0);
      ctx.setTransform(pixelWidth/width,0,0,pixelHeight/height,0,0);background(ctx,width,height,false);
      for(const l of leaves) {
        if(running) {
          const mid=l.spin+l.spinRate*dt/2;
          l.x=wrap(l.x+(leafTumble(mid,l.slip).slipVelocity+wind)*dt+40,width+80)-40;
          l.y=wrap(l.y+l.fall*dt+40,height+80)-40;
          l.spin=wrap(l.spin+l.spinRate*dt,Math.PI*2);l.roll=wrap(l.roll+l.rollRate*dt,Math.PI*2);
        }
        const pose=leafTumble(l.spin,l.slip);
        ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.roll);ctx.scale(pose.scaleX,1);ctx.globalAlpha=l.alpha;
        ctx.drawImage(sprites[l.color*2+Number(pose.back)],-l.size/2,-l.size/2,l.size,l.size);ctx.restore();
      }
      ctx.globalAlpha=1;
    }
  };
}

export function createPointerTrail(canvas, {count=160, spacing=14, coast=.5} = {}) {
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw Error('Canvas2D unavailable');
  count=Math.floor(clamp(count,8,FOLIAGE_TRAIL_LIMITS.motes,160)); coast=clamp(coast,.1,3,.5);
  const sampler=createDistanceSampler({spacing,cap:FOLIAGE_TRAIL_LIMITS.perFrame});
  const glow=sprite(canvas,ctx=>{
    const g=ctx.createRadialGradient(32,32,0,32,32,32);
    for(const [at,color] of [[0,'#f1fff3'],[.08,'#c3eed4'],[.25,'#63c7ae88'],[1,'#63c7ae00']])g.addColorStop(at,color);
    ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
  });
  // Fixed slots; spawn takes the slot BEFORE advancing. No growing history.
  let motes=Array.from({length:count},()=>({active:false}));
  let width=1,height=1,index=0,serial=0,budget=24,manual=false,destroyed=false;
  function spawn(p,age=0) {
    const m=motes[index];index=(index+1)%motes.length;
    const n=serial++;
    Object.assign(m,{active:true,x:p.x,y:p.y,age,life:1.5+seed(n,2),
      vx:(seed(n,3)-.5)*22,vy:-5-seed(n,4)*10,phase:seed(n,5)*6.28,size:10+seed(n,6)*12});
  }
  function sample(p) {const marks=sampler.sample(p,budget);budget-=marks.length;for(const mark of marks)spawn(mark);}
  function leave(){sampler.reset();}
  // Only discontinuity signals are local. Coordinates come from host.pointer.
  canvas.addEventListener('pointerleave',leave);canvas.addEventListener('pointercancel',leave);
  function reset(){
    if(destroyed)return;
    for(const m of motes)m.active=false;
    index=serial=0;budget=24;manual=false;sampler.reset();
    // Authored river of light, composed directly rather than warmed up in a loop.
    for(let i=0;i<Math.min(count,48);i++) {
      const u=i/(Math.min(count,48)-1);
      spawn({x:width*(.12+.76*u),y:height*(.65-.28*u+.12*Math.sin(u*6.28))},.25+u*.45);
    }
  }
  return {backend:'canvas2d',reset,
    resize(size){width=size.width;height=size.height;reset();},
    pointer(p){if(destroyed)return;if(!manual)sampler.reset();manual=true;sample(p);},
    getEntityCount(){return motes.reduce((n,m)=>n+Number(m.active),0);},
    destroy(){if(destroyed)return;destroyed=true;canvas.removeEventListener('pointerleave',leave);canvas.removeEventListener('pointercancel',leave);
      sampler.reset();motes=[];glow.width=glow.height=0;},
    render({pixelWidth,pixelHeight,time=0,dt=0,running=false}) {
      if(destroyed)return;
      dt=clamp(dt,0,1/30,0);time=clamp(time,0,10,0);
      ctx.setTransform(pixelWidth/width,0,0,pixelHeight/height,0,0);background(ctx,width,height,true);
      if(running && !manual) {
        const u=Math.min(1,time/7);
        sample({x:width*(.12+.76*u),y:height*(.65-.28*u+.12*Math.sin(u*6.28))});
      }
      ctx.globalCompositeOperation='lighter';
      for(const m of motes) {
        if(!m.active)continue;
        if(running) {
          m.age+=dt;if(m.age>=m.life){m.active=false;continue;}
          m.x+=(m.vx+Math.sin(time*1.3+m.phase)*4)*dt;m.y+=m.vy*dt;
          const drag=Math.exp(-coast*dt);m.vx*=drag;m.vy=m.vy*drag-3*dt;
        }
        const u=m.age/m.life;
        ctx.globalAlpha=Math.min(1,u/.12)*Math.max(0,1-(u-.22)/.78)*.85;
        const s=m.size*(1+u*.4);ctx.drawImage(glow,m.x-s/2,m.y-s/2,s,s);
      }
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';budget=24;
    }
  };
}
