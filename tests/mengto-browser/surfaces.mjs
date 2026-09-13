function maskMatches(style) {
  const composites=style.maskComposite.split(',').map(x=>x.trim());
  return composites.length===2 && composites.every(x=>x==='exclude')
    && (style.maskImage.match(/linear-gradient\(/g)||[]).length===2;
}
const output=document.querySelector('#surface-result');
const props=['color','backgroundColor','backgroundImage','boxShadow','borderColor','borderRadius','fontFamily','fontSize','padding','position','isolation','outline','clipPath'];
const styles=el=>Object.fromEntries(props.map(p=>[p,getComputedStyle(el)[p]]));
const host=[document.querySelector('#neutral-host'),document.querySelector('#host-note')];
document.querySelector('#run-surface').addEventListener('click',async event=>{
 event.currentTarget.disabled=true;const before=host.map(styles),checks={};
 try{
 const link=document.createElement('link');link.rel='stylesheet';link.href='../../cinematic-ui/assets/material-surfaces/surfaces.css';
 await new Promise((resolve,reject)=>{link.onload=resolve;link.onerror=reject;document.head.append(link);});
 checks['neutral-host-all-sampled-styles-unchanged']=JSON.stringify(before)===JSON.stringify(host.map(styles));
 checks['no-horizontal-overflow']=document.documentElement.scrollWidth<=innerWidth;
 for(const [i,b] of [...document.querySelectorAll('button[data-material-toggle]')].entries()){
 const baseline=getComputedStyle(b).backgroundImage;b.click();const pressed=getComputedStyle(b);
 checks[i+'-real-pressed-state']=b.getAttribute('aria-pressed')==='true'&&document.getElementById(b.getAttribute('aria-describedby')).textContent.startsWith('Pinned');
 checks[i+'-actual-gradient-reverses']=pressed.backgroundImage!==baseline;
 checks[i+'-surface-no-clip-path']=pressed.clipPath==='none';
 b.click();checks[i+'-real-return-state']=b.getAttribute('aria-pressed')==='false';
 }
 for(const [i,frame] of [...document.querySelectorAll('.cui-material--frame')].entries()){
 checks[i+'-noninteractive-rails']=getComputedStyle(frame,'::after').pointerEvents==='none';
 checks[i+'-mask-enhancement']=maskMatches(getComputedStyle(frame,'::before'));
 }
 output.textContent=JSON.stringify({checks,passed:Object.values(checks).every(Boolean)},null,2);output.dataset.passed=String(Object.values(checks).every(Boolean));
 }catch(error){output.textContent=String(error.stack||error);output.dataset.passed='false';}
 output.dataset.complete='true';
},{once:true});
