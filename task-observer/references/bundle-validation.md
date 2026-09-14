# Bundle validation: scope and command

Run from the skills checkout, through its Python environment with PyYAML available:

```text
python3 -B task-observer/scripts/validate-skill-bundle.py task-observer
python3 -B -m unittest discover -s task-observer/tests -v
```

The first argument selects a skill directory. The validator reads files as data;
it does not activate skills, execute bundled scripts or call a model. Missing
PyYAML is a validation-environment failure, not permission for an automatic install.
Choose an existing project interpreter with PyYAML, or obtain approval for setup.

## What a successful check means

- YAML frontmatter is a mapping with a string `name` of 1–64 characters matching
  the directory, and a nonblank string `description` of at most 1024 characters.
  Length checks use the parsed YAML value, including literal/folded/quoted scalars,
  not a regex approximation of the source. Names retain Prime's lowercase ASCII
  letters/digits/hyphen policy with no leading, trailing or consecutive hyphens.
- When supplied, `compatibility` is a nonblank string of at most 500 characters;
  `metadata` is a mapping of string keys to string values. Quote numeric versions
  such as `version: "1.0"` if YAML would otherwise decode a number.
- Existing bundle checks still cover cited backticked paths, duplicate frontmatter,
  editing residue, build junk and optional archive checks. The existing file-local
  template marker remains limited to intentional template-slot syntax.

## What it does not mean

This is a selected format and packaging gate, not full Agent Skills conformance,
security certification, native discovery or model-effectiveness proof. The native
loader may warn and load a skill that this authoring gate rejects. Format acceptance
never grants permission to read arbitrary resources or execute code.

Prime-specific and unknown top-level fields remain accepted; this validator does
not enforce an upstream reference-library field allowlist. It does not interpret
`allowed-tools` as permission. It does not enforce recommended body line/token
budgets, resolve the specification's Unicode naming ambiguity, or change native
precedence, path discovery, compaction or Python-skill installation behavior.

A fail identifies a document or environment issue; do not silently coerce invalid
metadata, weaken an assertion or rewrite unrelated installed skills to get green.
Use native loader checks separately when routing changes, and real tasks to assess
instruction quality. Source: [Agent Skills notes](../AGENTSKILLS_SOURCES.md).
