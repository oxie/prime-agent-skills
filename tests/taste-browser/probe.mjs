function fitsViewport(root){return root.scrollWidth <= root.clientWidth;}
const kind=document.body.dataset.kind, output=document.querySelector('#probe-output');
const checks={}, observations={};
const props=['color','backgroundColor','borderRadius','boxShadow','fontSize','fontFamily','padding','outline','position'];
const styleSample=e=>Object.fromEntries(props.map(p=>[p,getComputedStyle(e)[p]]));
const rect=e=>e.getBoundingClientRect();
const close=(a,b)=>Math.abs(a-b)<.6;
const write=()=>{output.textContent=JSON.stringify({checks,observations,passed:Object.values(checks).every(Boolean)},null,2);output.dataset.passed=String(Object.values(checks).every(Boolean));};
document.querySelector('#run-probe').addEventListener('click',async event=>{
 event.currentTarget.disabled=true;
 try{
 const host=[...document.querySelectorAll(kind==='craft'?'.neutral-host,#host-note':'#neutral-host,#neutral-host h2')];const before=host.map(styleSample);
 const link=document.createElement('link');link.rel='stylesheet';link.href=kind==='craft'?'../../cinematic-ui/assets/taste-craft/craft.css':'../../cinematic-ui/assets/inline-media/inline-media.css';
 await new Promise((resolve,reject)=>{link.onload=resolve;link.onerror=reject;document.head.append(link);});
 checks['host-sampled-styles-unchanged']=JSON.stringify(before)===JSON.stringify(host.map(styleSample));
 if(kind==='craft'){
  for(const [i,shell]of [...document.querySelectorAll('.cui-bezel')].entries()){
   const core=shell.querySelector('.cui-bezel__core'),s=getComputedStyle(shell),c=getComputedStyle(core),inset=parseFloat(s.borderLeftWidth)+parseFloat(s.paddingLeft);
   checks[i+'-actual-radius-equation']=close(parseFloat(c.borderTopLeftRadius),Math.max(0,parseFloat(s.borderTopLeftRadius)-inset));
   checks[i+'-actual-core-offset']=close(rect(core).left-rect(shell).left,inset);
  }
  for(const [i,grid]of [...document.querySelectorAll('.cui-gap-grid')].entries()){
   const cells=[...grid.children],rs=cells.map(rect),g=rect(grid);
   checks[i+'-expected-record-count']=cells.length===(i===0?3:5);
   checks[i+'-last-row-filled']=close(rs.at(-1).width,g.width-2);
   checks[i+'-dom-order-is-visual-order']=rs.every((r,n)=>!n||r.top>rs[n-1].top+.5||(close(r.top,rs[n-1].top)&&r.left>rs[n-1].left));
   checks[i+'-actual-shared-gap']=close(getComputedStyle(grid).columnGap.replace('px','')*1,1)&&close(rs[1].top===rs[0].top?rs[1].left-rs[0].right:rs[1].top-rs[0].bottom,1);
  }
  const {mountCraft}=await import('../../cinematic-ui/assets/taste-craft/demo.mjs');const cleanup=mountCraft(document);checks['same-root-idempotent']=mountCraft(document)===cleanup;
  const buttons=[...document.querySelectorAll('button[data-craft-toggle]')];buttons[0].click();
  checks['first-local-state']=buttons[0].getAttribute('aria-pressed')==='true'&&document.querySelector('#print-state').textContent.includes('Emphasis on');
  checks['second-state-independent']=buttons[1].getAttribute('aria-pressed')==='false';
  cleanup();cleanup();
  buttons[0].dispatchEvent(new MouseEvent('click',{bubbles:true}));
  checks['cleanup-listener-removed']=buttons[0].getAttribute('aria-pressed')==='false'&&buttons.every(b=>b.disabled);
  const cleanAgain=mountCraft(document);buttons[0].click();checks['remount-one-handler']=buttons[0].getAttribute('aria-pressed')==='true';cleanAgain();
 }else{
  const headings=[...document.querySelectorAll('.cui-inline-title')],words=headings.map(h=>h.textContent);
  const images=[...document.querySelectorAll('.cui-inline-media img')];await Promise.all(images.map(img=>img.decode()));
  checks['actual-svg-decodes']=images.every(img=>img.naturalWidth===240&&img.naturalHeight===120);
  checks['reserved-media-ratio']=headings.every(h=>{const r=rect(h.querySelector('.cui-inline-media'));return close(r.width/r.height,2);});
  checks['complete-sentences']=headings.every(h=>h.textContent.includes(h.lang==='de'?'Aufbewahrungsmöglichkeiten.':'place for a thought.'));
  const img=images[0],slot=rect(img.parentElement);img.src='./not-an-image.txt';let failed=false;try{await img.decode();}catch{failed=true;}
  checks['real-image-decode-failure']=failed&&img.naturalWidth===0;
  checks['failed-image-preserves-slot']=close(rect(img.parentElement).width,slot.width)&&close(rect(img.parentElement).height,slot.height);
  checks['failed-image-preserves-heading']=headings.every((h,i)=>h.textContent===words[i]);
  const disclosure=document.querySelector('details');disclosure.querySelector('summary').click();checks['native-disclosure-opens']=disclosure.open;
 }
 checks['no-horizontal-overflow']=fitsViewport(document.documentElement);
 write();output.dataset.complete='true';document.querySelector('#double-text').disabled=false;
 }catch(e){output.textContent=String(e.stack||e);output.dataset.passed='false';output.dataset.complete='true';}
},{once:true});
document.querySelector('#double-text').addEventListener('click',event=>{
 event.currentTarget.disabled=true;
 const nodes=new Set(),walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){const n=walker.currentNode,e=n.parentElement;if(n.textContent.trim()&&e&&!e.closest('#probe-controls,#probe-output,script,style'))nodes.add(e);}
 const before=[...nodes].map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);
 for(const [e,size]of before)e.style.fontSize=(size*2)+'px';
 checks['all-sampled-text-sizes-doubled']=before.length>10&&before.every(([e,size])=>close(parseFloat(getComputedStyle(e).fontSize),size*2));
 checks['double-text-no-horizontal-overflow']=fitsViewport(document.documentElement);
 observations.doubledTextNodes=before.length;
 observations.viewport={innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth};
 observations.overflowingText=[...nodes].flatMap(e=>{const range=document.createRange();range.selectNodeContents(e);return [...range.getClientRects()].filter(r=>r.right>document.documentElement.clientWidth+.5||r.left<-.5).map(r=>({tag:e.tagName,id:e.id,className:e.className,text:e.textContent.trim().slice(0,100),left:r.left,right:r.right,fontSize:getComputedStyle(e).fontSize}));}).slice(0,12);write();output.dataset.textComplete='true';
},{once:true});
