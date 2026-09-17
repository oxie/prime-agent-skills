---
type: Metric Definition
title: Active Workspace
description: Reporting definition from 2026-09-01T00:00:00Z, excluding heartbeats.
status: draft
generated:
  by: fictional-example/2
  at: "2026-09-01T00:00:00Z"
stale_after: "2026-10-01T00:00:00Z"
source_revision: policy-r2
sources:
  - id: counting-policy
    resource: ../policies/activity.md
    title: Fictional workspace counting policy
---
# Active Workspace

Fictional example only. For observation instant T on or after
2026-09-01T00:00:00Z, a workspace qualifies with at least one human action in
[T - 14 days, T). Automated heartbeats do not qualify. Count each workspace
once.[^counting-policy] The policy defines days as elapsed UTC periods.

A human action exactly 14 days before T qualifies; one exactly at T does not.
A workspace with only a heartbeat yesterday does not qualify when complete
relevant event evidence establishes there were no human actions. With missing
relevant evidence, inactivity is unknown rather than demonstrated.

This replaces the [previous definition](active-workspace-legacy.md) for that
effective interval, not for earlier reports. See [scope](../scope.md) for the
fictional metadata, absent verification and unprovided runtime evidence.

[^counting-policy]: Workspace counting policy, policy-r2
