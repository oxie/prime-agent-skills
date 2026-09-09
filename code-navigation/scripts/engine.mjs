// Internal engine. Invoke through code_nav.py, never directly or through Graft CLI.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const request = JSON.parse(process.argv[2] ?? '{}');
const { command, repo, context, query, file, symbol, direction, depth, limit, maxOutputBytes } = request;
const runtime = '/home/prime-agent/.local/share/prime-agent/graft-tools/upstream';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const check = (condition, message) => { if (!condition) throw new Error(message); };
const load = name => import(pathToFileURL(path.join(runtime, 'dist', `${name}.js`)).href);
const safeRelative = name => typeof name === 'string' && name.length > 0 && !path.isAbsolute(name)
  && !name.includes('\\') && !name.split('/').some(x => x === '.' || x === '..' || x === '');
const projectNode = n => n && Object.fromEntries(['id', 'name', 'kind', 'path', 'span', 'signature', 'exported', 'origin', 'owner']
  .filter(k => n[k] !== undefined).map(k => [k, n[k]]));
const capped = (items, cap = limit) => ({ items: items.slice(0, cap), total: items.length,
  omitted: Math.max(0, items.length - cap), truncated: items.length > cap });

function configBytes() {
  const dir = path.join(repo, '.graft');
  const config = path.join(dir, 'config.json');
  for (const p of [dir, config]) {
    if (fs.existsSync(p) || (() => { try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; } })())
      check(!fs.lstatSync(p).isSymbolicLink(), 'symlinked .graft controls are not allowed');
  }
  if (!fs.existsSync(config)) return '';
  check(fs.statSync(config).isFile() && fs.statSync(config).size <= 1024 * 1024, 'invalid .graft config');
  const bytes = fs.readFileSync(config);
  const cfg = JSON.parse(bytes);
  check(cfg && typeof cfg === 'object' && !Array.isArray(cfg), 'invalid .graft config object');
  check(!cfg.followSubmodules && !cfg.followNestedRepos &&
    (cfg.includeDirs === undefined || (Array.isArray(cfg.includeDirs) && cfg.includeDirs.length === 0)),
    '.graft config widens scope; remove includeDirs/followSubmodules/followNestedRepos for this adapter');
  return hash(bytes);
}

function assertStructural(graph, sourcePaths) {
  check(graph?.meta?.version === 1 && Array.isArray(graph.nodes) && Array.isArray(graph.edges), 'invalid graph schema');
  check(graph.meta.nodeCount === graph.nodes.length && graph.meta.edgeCount === graph.edges.length, 'graph count mismatch');
  const ids = new Set();
  for (const n of graph.nodes) {
    check(safeRelative(n.path) && sourcePaths.has(n.path), `graph path outside indexed source: ${n.path}`);
    check(typeof n.id === 'string' && !ids.has(n.id), 'invalid/duplicate graph identity');
    ids.add(n.id);
    check(n.kind !== 'concept' && n.summary == null && n.crux == null && n.summary_state === 'pending',
      'nonstructural summary/crux/concept contamination');
    check(/^L\d+-L\d+$/.test(n.span) && typeof n.name === 'string', 'invalid graph location');
  }
  for (const e of graph.edges) {
    check(ids.has(e.source) && typeof e.target === 'string', 'invalid edge endpoint');
    check(['contains', 'imports', 'calls', 'references', 'implements', 'extends'].includes(e.relation), 'invalid edge relation');
    check(['extracted', 'inferred'].includes(e.confidence), 'unexpected edge confidence in structural-only graph');
  }
}

async function main() {
  const status = fs.readFileSync('/proc/self/status', 'utf8');
  check(/^NoNewPrivs:\s+1$/m.test(status) && /^Seccomp:\s+2$/m.test(status), 'guarded launcher required');
  check(request.runtime === runtime && path.isAbsolute(repo) && path.isAbsolute(context), 'invalid engine paths');
  check(fs.realpathSync(repo) === repo && fs.realpathSync(context) === context && !context.startsWith(`${repo}/`), 'noncanonical engine paths');
  const { buildGraph } = await load('graph/build');
  const { buildRepoMap } = await load('graph/map');
  const { resolveSymbol, edgeWalk } = await load('graph/traverse');
  const { ask, skeleton } = await load('ask/ask');
  const { listSourceFiles, supportedExtensions } = await load('graph/source-files');
  const { shouldSkipDir } = await load('ingest/fs');
  const { genericLangOf, warmGenericGrammars, isWarm } = await load('graph/generic');
  const { containerLangOf, warmContainerGrammars, isContainerWarm } = await load('graph/container');
  const { readSourceFile } = await load('util/source');

  function snapshot() {
    const config = configBytes();
    const listing = spawnSync('/usr/bin/git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--'],
      { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 10000, maxBuffer: 16 * 1024 * 1024 });
    check(listing.status === 0 && !listing.error && !listing.stderr, `Git enumeration failed: ${listing.error ?? listing.stderr}`);
    const visible = [...new Set(listing.stdout.split('\0').filter(Boolean))].sort();
    check(visible.length <= 20000, 'repository file-count limit exceeded (20000)');
    const files = [];
    const hashes = {};
    let bytes = 0;
    const excluded = { built_in_or_dot: 0, symlinks: 0, nested_repositories: 0, oversized: 0, deleted: 0 };
    for (const rel of visible) {
      check(safeRelative(rel) || (rel.endsWith('/') && safeRelative(rel.slice(0, -1))), 'Git emitted unsafe path');
      if (rel.split('/').some(x => shouldSkipDir(x))) { excluded.built_in_or_dot++; continue; }
      const abs = path.join(repo, rel);
      let st;
      try { st = fs.lstatSync(abs); } catch (e) { if (e.code === 'ENOENT') { excluded.deleted++; continue; } throw e; }
      if (st.isSymbolicLink()) { excluded.symlinks++; continue; }
      if (st.isDirectory()) { excluded.nested_repositories++; continue; }
      check(st.isFile(), `nonregular visible source: ${rel}`);
      check(fs.realpathSync(abs) === abs, `symlinked ancestor of visible source: ${rel}`);
      for (let parent = path.dirname(abs); parent !== repo; parent = path.dirname(parent)) {
        check(parent.startsWith(`${repo}/`), 'source escaped root');
        check(!fs.existsSync(path.join(parent, '.git')), `tracked source crosses nested repository: ${rel}`);
      }
      if (st.size > 1000000) { excluded.oversized++; continue; }
      bytes += st.size;
      check(bytes <= 64 * 1024 * 1024, 'repository visible-byte limit exceeded (64 MiB)');
      files.push(abs);
      hashes[rel] = hash(fs.readFileSync(abs));
    }
    const sources = listSourceFiles(repo, context, files).map(abs => path.relative(repo, abs)).sort();
    return { hash: hash(JSON.stringify({ config, visible, hashes })), hashes, files, sources, bytes, excluded };
  }

  const before = snapshot();
  const sourcePaths = new Set(before.sources);
  const generic = new Set(before.sources.map(genericLangOf).filter(Boolean).map(x => x.name));
  const containers = new Set(before.sources.map(containerLangOf).filter(Boolean).map(x => x.name));
  await warmGenericGrammars(generic);
  await warmContainerGrammars(containers);
  for (const lang of generic) check(isWarm(lang), `generic grammar unavailable: ${lang}`);
  for (const lang of containers) check(isContainerWarm(lang), `container grammar unavailable: ${lang}`);
  for (const rel of before.sources) check(readSourceFile(path.join(repo, rel)) !== null, `unsupported source encoding: ${rel}`);
  // The launcher checks cache checksums before reuse. This check also rejects
  // correctly-checksummed but nonstructural owned data before enrichGraph reads it.
  const graphPath = path.join(context, '.graph/wiring.json');
  if (fs.existsSync(graphPath)) {
    const old = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
    // Deleted paths may legitimately remain until this rebuild; meaning never may.
    assertStructural(old, new Set(old.nodes.map(n => n.path)));
  }
  for (const name of fs.readdirSync(context)) check(!name.endsWith('.md'), 'concept Markdown contamination');
  const build = await buildGraph(repo, { graphOnly: true, contextDir: context, lsp: false });
  check(build.errors.length === 0, `build failed: ${build.errors.join('; ')}`);
  check(!build.seededFrom && build.cards === 0, 'unexpected seed or card generation');
  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
  assertStructural(graph, sourcePaths);
  const indexed = new Set(graph.nodes.filter(n => n.kind === 'file').map(n => n.path));
  check(indexed.size === before.sources.length && before.sources.every(p => indexed.has(p)), 'partial graph: source files missing');
  for (const n of graph.nodes.filter(n => n.kind === 'file')) {
    check(n.body_hash === hash(readSourceFile(path.join(repo, n.path))), `source changed during extraction: ${n.path}`);
  }
  const afterBuild = snapshot();
  check(before.hash === afterBuild.hash, 'source changed during build; cache is not current');

  let result;
  if (command === 'index' || command === 'check') {
    result = { files: build.files, nodes: build.nodes, edges: build.edges, parsed: build.parsed,
      reused: build.reused, languages: build.languages, by_kind: build.byKind, by_relation: build.byRelation };
  } else if (command === 'map') {
    // Request the whole bounded graph map then cap at our output boundary. This
    // avoids invisible upstream hub caps, including per-directory hub omission.
    const map = buildRepoMap(graph, { maxDirs: graph.nodes.length, hubsPerDir: graph.nodes.length, hotspots: graph.nodes.length });
    const dirs = xs => capped(xs.map(d => ({ ...d, hubs: capped(d.hubs) })));
    result = { totals: { ...map.totals, languages: graph.meta.languages }, dirs: dirs(map.dirs), hotspots: capped(map.hotspots) };
    if (map.scopes) result.scopes = capped(map.scopes.map(s => ({ scope: s.scope, dirs: dirs(s.dirs) })));
  } else if (command === 'outline') {
    check(sourcePaths.has(file), 'outline requires an exact indexed file (no basename fallback)');
    const view = skeleton(repo, file, { contextDir: context });
    const nodes = graph.nodes.filter(n => n.path === file && n.kind !== 'file');
    result = { file, ...capped(view.entries.map(e => ({ ...e, path: file,
      id: nodes.find(n => n.name === e.name && n.span === e.span && n.kind === e.kind)?.id }))) };
  } else if (command === 'find') {
    if (symbol) {
      const matches = graph.nodes.some(n => n.id === symbol) ? graph.nodes.filter(n => n.id === symbol) : resolveSymbol(graph, symbol);
      result = { mode: 'symbol', ...capped(matches.filter(n => !file || n.path === file).map(projectNode)) };
    } else {
      // One extra hit detects rank truncation without changing selected order.
      const found = ask(repo, query, { contextDir: context, limit: limit + 1, source: false, ...(file ? { in: file } : {}) });
      const matches = found.hits.slice(0, limit).map(hit => {
        const m = /^(.*?)(?::(L\d+-L\d+))?$/.exec(hit.pointer);
        const matching = graph.nodes.filter(n => n.path === m[1] && (!m[2] || n.span === m[2]));
        return { kind: hit.kind, title: hit.title, path: m[1], span: m[2] ?? null, pointer: hit.pointer,
          snippet: hit.snippet, score: hit.score, ...(hit.relation ? { relation: hit.relation } : {}),
          definitions: matching.map(projectNode) };
      });
      result = { mode: found.mode, items: matches, truncated: found.hits.length > limit,
        total: found.hits.length > limit ? null : found.hits.length,
        ...(found.hits.length > limit ? { total_lower_bound: limit + 1 } : {}), note: found.note ?? null };
    }
  } else if (command === 'trace') {
    const matches = (graph.nodes.some(n => n.id === symbol) ? graph.nodes.filter(n => n.id === symbol) : resolveSymbol(graph, symbol))
      .filter(n => !file || n.path === file);
    result = { direction, depth, ...capped(matches.map(seed => {
      const hits = edgeWalk(graph, seed, direction, depth);
      const seedNodes = seed.kind === 'file' && depth > 1 ? graph.nodes.filter(n => n.path === seed.path) : [seed];
      const depths = new Map([...seedNodes.map(n => [n.id, 0]), ...hits.map(h => [h.id, h.depth])]);
      const endpoints = new Map(graph.nodes.map(n => [n.id, n]));
      return { subject: projectNode(seed), ...capped(hits.map(hit => ({ id: hit.id, node: projectNode(hit.node),
        depth: hit.depth, relation: hit.relation,
        edges: graph.edges.filter(e => e.relation === hit.relation && (direction === 'in'
          ? e.source === hit.id && (depths.get(e.target) ?? Infinity) < hit.depth
          : e.target === hit.id && (depths.get(e.source) ?? Infinity) < hit.depth))
          .map(e => ({ ...e, source_node: projectNode(endpoints.get(e.source)), target_node: projectNode(endpoints.get(e.target)) }))
      }))) };
    })) };
  } else throw new Error('unknown engine command');
  check(snapshot().hash === before.hash, 'source changed during query; no current answer');
  const output = { ok: true, command, repo, health: { state: 'current', current: true, source_hash: before.hash,
    parsed: build.parsed, reused: build.reused, scope: 'Git working-tree root; no nested repository/submodule expansion',
    coverage: { parser_policy: 'error-tolerant tree-sitter; extraction exceptions fail closed; not syntax certification',
      supported_extensions: supportedExtensions(), indexed_files: before.sources.length,
      visible_bytes: before.bytes, excluded: before.excluded,
      limitations: ['Git ignores, dot paths, built-in dependency/build dirs and >1MB files are excluded.',
        'Tree-sitter is error-tolerant, not a compiler or syntax validator.',
        'Dynamic calls may be absent; generic grammars may provide symbols without precise edges.',
        'Lexical body indexing is capped upstream at 5000 chars/symbol and 16000 chars/file residual.'] } }, result };
  const serialized = JSON.stringify(output);
  check(Buffer.byteLength(serialized) + 1 <= maxOutputBytes, 'output size bound exceeded; no partial answer returned');
  process.stdout.write(serialized + '\n');
}

main().catch(error => {
  process.stdout.write(JSON.stringify({ ok: false, command, repo, health: { state: 'unavailable', current: false }, error: String(error.message) }) + '\n');
  process.exitCode = 1;
});
