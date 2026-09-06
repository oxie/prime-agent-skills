#!/usr/bin/env node
// Prime updates are explicitly reviewed, Git-synced changes. No network or state writes.
console.log(JSON.stringify({status:'silent',disabled:true,reason:'Prime-managed updates only'}));
