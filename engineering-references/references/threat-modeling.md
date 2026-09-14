# Boundary-led threat modeling — optional method

Use for an authorized design or changed attack surface when a system-level view
adds value. Reuse the existing diagram or task text; do not create a permanent
risk register by default. This is a read-only reasoning method, not a scanner,
security certification or permission to test real accounts, exploit systems,
inspect credentials, publish findings or deploy controls.

## Make the threat traceable

1. Bound the question: system/revision, assets, expected users and operations,
   dependencies, exclusions and source uncertainties. Identify who can confirm
   missing policy or architecture facts; keep sensitive diagrams need-to-know.
2. Trace external entities, processes, stores and data flows. Mark where identity,
   privilege, tenant, ownership or data-handling assumptions change. A boundary
   can be logical, not just a network edge. Check the diagram against the actual
   path; a neat diagram with omitted flows is weak evidence.
3. For each material scenario, connect an asset and flow/boundary to an actor's
   capabilities, preconditions, unwanted event and consequence. Optional STRIDE
   prompts are spoofing, tampering, repudiation, information disclosure, denial
   of service and elevation of privilege. Consider relevant prompts across the
   path; no element-to-category table is exhaustive and no finding quota applies.
4. Record the existing control, its enforcement point, owner and evidence.
   Distinguish prevention from detection and recovery: a log does not prevent a
   forbidden write. Authentication alone does not authorize a tenant operation.
   Rank work using explicit impact, plausible exposure and uncertainty under the
   project's policy. Do not multiply ordinal labels or invent control-effectiveness
   percentages. A plausible scenario is not an observed exploit.
5. State the gap and smallest proposed response: mitigate, remove the exposure,
   transfer a specified responsibility, or seek explicit risk acceptance from the
   authorized owner. A recommendation is not an implemented control; transfer does
   not erase residual risk. Name verification and unresolved scope. Review with
   the relevant policy/system owners, then update the existing model when facts
   change. Do not schedule recurring work from this reference.

A compact worksheet row is:
`asset + flow/boundary | actor + preconditions | event + consequence |
control + enforcement + evidence | gap/response + owner |
verification + status + residual uncertainty`.

Evidence should say what it supports: **assumed** (unconfirmed design),
**documented** (specified policy), **inspected** (matching implementation at a
revision), **tested** (observed case/environment/result), or **operationally
observed** (bounded production evidence, only if authorized). These are descriptions,
not numeric scores. Do not upgrade a plan or a passing mock into deployed evidence.
Use `open`, `proposed`, `implemented-unverified`, or `mitigated within <scope>` as
appropriate. Risk acceptance is a separate owner decision, not a passing test.
“No supported gap in this scope” is a valid outcome, not a security guarantee.

Concrete API enforcement and transaction/race tests remain with
[API authorization](api-authorization.md). For denial, observe protected storage,
returned data and queued/provider effects, not only HTTP status. Intentional
security logging may still occur. Pair a denied case with an authorized success
so “reject everything” cannot masquerade as correct authorization.
Archify is the optional rendering owner if a diagram is requested; no renderer
or mandatory diagram file is needed here.

## Fictional worked example: relabel an invoice

This small model covers one synchronous invoice-update path, not a complete
service. Invoice data must stay within the verified caller's tenant. Tenant A
knows tenant B's invoice ID. The documented example policy returns 403, no invoice
fields, no business write and no email on denial; one security audit event is
allowed. Other real services may deliberately use a different status policy.

```text
Browser (caller-controlled)
  -- F1: tenant, invoice ID, label / response -- [B1: untrusted input]
API (service)
  -- F2: constrained write / row count ------- [B2: tenant authorization]
Invoice store (tenant-records)
```

The JSON is synthetic observation data, **not a record of a real API test**.
T1 is mitigated only within `invoice-fixture-v1` for its specified observations.
C1 is a hypothetical preventive control at the final update/return boundary.
A real conclusion would need the real policy, code and matching native tests.
Bulk endpoints, membership races, identity-provider compromise and availability
are outside this example; their exclusion is residual uncertainty, not acceptance.

<!-- threat-fixture -->
```json
{
  "revision": "invoice-fixture-v1",
  "nodes": {
    "browser": "caller-controlled",
    "api": "service",
    "invoices": "tenant-records"
  },
  "flows": [
    {
      "id": "F1",
      "from": "browser",
      "to": "api",
      "data": "tenant, invoice ID, new label; response",
      "boundary": "B1"
    },
    {
      "id": "F2",
      "from": "api",
      "to": "invoices",
      "data": "scoped update; row count",
      "boundary": "B2"
    }
  ],
  "boundaries": [
    {
      "id": "B1",
      "zones": [
        "caller-controlled",
        "service"
      ]
    },
    {
      "id": "B2",
      "zones": [
        "service",
        "tenant-records"
      ]
    }
  ],
  "threat": {
    "id": "T1",
    "asset": "invoice integrity and confidentiality",
    "flow": "F2",
    "precondition": "Tenant A caller knows a tenant B invoice ID.",
    "event": "Caller changes B invoice or receives its fields.",
    "control": "C1",
    "status": "mitigated",
    "owner": "Invoice team",
    "residual": "Only the single update path is modeled; bulk paths and membership races remain untested."
  },
  "controls": [
    {
      "id": "C1",
      "type": "preventive",
      "claim": "Verified caller tenant constrains final update and returned fields.",
      "evidence": "E1"
    }
  ],
  "evidence": [
    {
      "id": "E1",
      "level": "offline-fixture",
      "revision": "invoice-fixture-v1",
      "result": "pass",
      "denied": {
        "status": 403,
        "invoiceWrites": 0,
        "queuedEmails": 0,
        "returnedFields": [],
        "auditEvents": 1
      },
      "allowed": {
        "status": 200,
        "invoiceWrites": 1,
        "queuedEmails": 0
      }
    }
  ]
}
```

### Seeded gaps and no-gap comparison

- Start with the JSON above: the checker returns `[]`. This means no gap in its
  limited checks; it does not say the fictional service is comprehensively secure.
- Remove B2 from `boundaries`: F2 still crosses service/tenant-record trust domains,
  so the result is `['missing-boundary:F2']`. Restore and explain that boundary.
- Point T1 at a missing flow, or remove F2 while T1 still names it: the result is
  `['missing-flow:T1', 'unsupported-mitigated:T1']`. Repair the worksheet link;
  a supplied evidence record cannot justify a dangling threat-to-flow link.
- Remove C1 from `controls`: T1 has no linked control. The result is
  `['missing-control:T1', 'unsupported-mitigated:T1']`. Keep the threat open while
  the invoice team proposes and verifies the scoped update/return enforcement.
- Keep status `mitigated` but change the evidence level to `documented`, or let the
  denied operation write an invoice: result `['unsupported-mitigated:T1']`.
  A “pass” label and a 403 cannot override contradictory effects.

The following original example logic checks the supplied graph and observations.
It does not discover absent nodes/flows, verify that observations are truthful,
execute API authorization, or decide risk acceptance. Its fixed field names and
status values are for this fixture only, not a general validation schema.

<!-- threat-check -->
```js
// Only checks the documented fictional invoice worksheet, not an application.
function checkInvoiceExample(model) {
  const gaps = [];
  for (const flow of model.flows) {
    const from = model.nodes[flow.from], to = model.nodes[flow.to];
    if (!from || !to) { gaps.push(`unknown-node:${flow.id}`); continue; }
    if (from !== to && !model.boundaries.some(boundary =>
      boundary.id === flow.boundary && boundary.zones.includes(from) &&
      boundary.zones.includes(to))) gaps.push(`missing-boundary:${flow.id}`);
  }
  const threat = model.threat;
  const flow = model.flows.find(item => item.id === threat.flow);
  if (!flow) gaps.push(`missing-flow:${threat.id}`);
  const control = model.controls.find(item => item.id === threat.control);
  if (!control) gaps.push(`missing-control:${threat.id}`);
  if (threat.status === 'mitigated') {
    const evidence = model.evidence.find(item => item.id === control?.evidence);
    const denied = evidence?.denied, allowed = evidence?.allowed;
    // These exact statuses/effects belong to this fixture's policy only.
    const supported = flow !== undefined && evidence?.level === 'offline-fixture' &&
      evidence.revision === model.revision && evidence.result === 'pass' &&
      denied?.status === 403 && denied.invoiceWrites === 0 &&
      denied.queuedEmails === 0 && Array.isArray(denied.returnedFields) &&
      denied.returnedFields.length === 0 &&
      allowed?.status === 200 && allowed.invoiceWrites === 1 &&
      allowed.queuedEmails === 0;
    if (!supported) gaps.push(`unsupported-mitigated:${threat.id}`);
  }
  return gaps;
}

```

The repository's `node --test tests/super-threat-modeling.test.mjs` executes these
exact document blocks with positive and mutated negative cases. These are offline
contract tests, not agent-compliance proof, penetration tests or deployed-control
evidence. They add no runtime, provider calls or network scans.

## Primary grounding

The system-model → threat → response → validation sequence is grounded in OWASP's
[Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html),
sections “System Modeling”, “Threat Identification”, “Response and Mitigations”
and “Review and Validation”. Unversioned HTML snapshot retrieved 2026-09-14:
SHA-256 `5a59c7ad2a15d9b1476bd488789546d96b571b363ba176be4ba8a46443d21503`.
The original method wording, fixture and narrow checker here are not copied
OWASP prose. The task evidence retains the exact URL and saved source bytes.
OWASP's numeric ranking discussion is not adopted as a measured risk formula.
