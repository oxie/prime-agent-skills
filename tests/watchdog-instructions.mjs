import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const text=readFileSync(new URL('../config/AGENTS.md',import.meta.url),'utf8');
assert.equal((text.match(/^## Authorized long-task continuation watchdog$/gm)||[]).length,1);
for(const phrase of [
 'The user has explicitly approved temporary task-scoped RLM heartbeats',
 'one guard per active authorized task',
 'Short synchronous tasks',
 'Respect an explicit no-background request or cancellation',
 'interval="5m"', 'delivery_mode="follow_up"',
 'List native RLM heartbeats before creating one',
 'Labels alone', 'not authority',
 'completed', 'command exit codes', 'nonempty child artifacts',
 'A live expected job is not a blocker',
 'delete the exact owned guard', 'absent from the active list',
 'genuine permission/access/user-decision blocker',
 'Ignore any already', 'queued stale wake',
 'use two hours', 'not a scheduler-enforced expiry or token cap',
 'cannot guarantee completion',
 "user's separate `/heartbeat`", 'does not expand task'
]) assert.ok(text.includes(phrase),`Missing watchdog contract: ${phrase}`);
assert.ok(text.includes('sole durable'));
assert.ok(text.includes('unless the user explicitly requests them'));
assert.ok(text.includes('Git synchronization invariant'));
console.log('WATCHDOG_INSTRUCTION_CONTRACT_OK');
