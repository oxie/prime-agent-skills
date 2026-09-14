import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('./mengto-browser/probe.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('./mengto-browser/index.html',import.meta.url),'utf8');
const start=source.indexOf(' const write=');
const end=source.indexOf('\n }catch(error)',start);
assert.ok(start>=0 && end>start,'actual final-output publication block is required');
const publication=source.slice(start,end);

function publish({overflowAfterWrite=false,earlierPass=true}={}){
 let text='',reads=0,writes=0;
 const result={dataset:{},get textContent(){return text;},set textContent(value){text=value;writes++;}};
 const document={documentElement:{clientWidth:305,get scrollWidth(){
  reads++;assert.ok(text.includes('final-output-no-horizontal-overflow'),'measure after inserting the complete diagnostic payload');
  return overflowAfterWrite?440:305;
 }}};
 const checks={'earlier-behavior':earlierPass};
 vm.runInNewContext(publication,{result,document,checks});
 assert.equal(reads,1);
 assert.equal(writes,2,'publish measured result, not the optimistic placeholder');
 assert.equal(result.dataset.complete,'true');
 return {result,payload:JSON.parse(text)};
}

test('final layout oracle rejects overflow introduced by diagnostic text',()=>{
 const {result,payload}=publish({overflowAfterWrite:true});
 assert.equal(payload.checks['final-output-no-horizontal-overflow'],false);
 assert.equal(payload.passed,false);
 assert.equal(result.dataset.passed,'false');
});
test('wrapped final output passes without losing earlier failures',()=>{
 const good=publish();assert.equal(good.payload.passed,true);assert.equal(good.result.dataset.passed,'true');
 const failed=publish({earlierPass:false});
 assert.equal(failed.payload.checks['final-output-no-horizontal-overflow'],true);
 assert.equal(failed.payload.passed,false);assert.equal(failed.result.dataset.passed,'false');
});
test('diagnostics wrap complete text rather than clip or hide it',()=>{
 const tag=html.match(/<pre\b[^>]*id="probe-status"[^>]*>/)?.[0];
 assert.ok(tag);assert.match(tag,/white-space:pre-wrap/);assert.match(tag,/overflow-wrap:anywhere/);
 assert.doesNotMatch(tag,/(?:overflow(?:-x|-y)?:\s*(?:hidden|clip)|text-overflow|max-height|display:\s*none)/);
});
