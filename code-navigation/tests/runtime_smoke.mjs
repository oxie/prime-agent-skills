import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const root = '/home/prime-agent/.local/share/prime-agent/graft-tools/upstream';
const require = createRequire(root + '/package.json');
const Parser = require('tree-sitter');
const grammars = [
 ['typescript', require('tree-sitter-typescript').typescript, 'function hello() { return 1; }'],
 ['tsx', require('tree-sitter-typescript').tsx, 'const node = <div />;'],
 ['javascript', require('tree-sitter-javascript'), 'function hello() { return 1; }'],
 ['python', require('tree-sitter-python'), 'def hello():\n    return 1\n'],
 ['go', require('tree-sitter-go'), 'package main\nfunc hello() int { return 1 }'],
 ['java', require('tree-sitter-java'), 'class Hello { int hello() { return 1; } }'],
 ['kotlin', require('tree-sitter-kotlin'), 'fun hello(): Int { return 1 }'],
 ['swift', require('tree-sitter-swift'), 'func hello() -> Int { return 1 }'],
 ['php', require('tree-sitter-php').php, '<?php function hello() { return 1; }'],
 ['r', require('tree-sitter-r'), 'hello <- function() { 1 }'],
];
for (const [name, grammar, text] of grammars) {
 const parser = new Parser(); parser.setLanguage(grammar);
 const tree = parser.parse(text);
 assert(!tree.rootNode.hasError, name + ': ' + tree.rootNode.toString());
 assert(tree.rootNode.namedChildCount > 0);
 console.log(JSON.stringify({grammar:name,ok:true,root:tree.rootNode.type}));
}
for (const entry of ['graph/build.js','graph/map.js','graph/traverse.js','ask/ask.js']) {
 const mod = await import(root + '/dist/' + entry);
 assert(Object.keys(mod).length > 0);
 console.log(JSON.stringify({module:entry,exports:Object.keys(mod),ok:true}));
}
