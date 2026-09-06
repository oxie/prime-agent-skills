#!/usr/bin/env node
// Compatibility filename; Prime's queue operations never wait or install hooks.
import path from "node:path";
import { paths } from "../src/core.mjs";
import { ackRequest, peekRequests, drainRequests } from "../src/requests.mjs";
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const key = process.argv[i];
  if (!key.startsWith("--")) throw new Error("Expected named argument");
  const next = process.argv[i + 1];
  args[key.slice(2)] = next != null && !next.startsWith("--") ? process.argv[++i] : true;
}
try {
  if (!args.ws || args.ws === true) throw new Error("--ws <project>/.variate is required");
  const ws = path.resolve(args.ws);
  if (path.basename(ws) !== ".variate") throw new Error("Workspace must be <project>/.variate");
  const P = paths(path.dirname(ws));
  if (args.wake || args.hook || args.timeout || (!args.peek && !args.drain && !args.ack))
    throw new Error("Waiting/hooks are disabled in Prime; use peek or drain once, then end the turn");
  if (args.ack) ackRequest(P, args.ack, args.consumer, args.result, args.note);
  const result = args.drain ? drainRequests(P, args.consumer, args.reclaim) : peekRequests(P);
  console.log(JSON.stringify(result));
} catch (error) {
  console.error(`variate queue: ${error.message}`);
  process.exitCode = 1;
}
