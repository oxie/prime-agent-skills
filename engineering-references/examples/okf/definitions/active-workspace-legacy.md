---
type: Metric Definition
title: Active Workspace before 2026-09-01
description: Historical definition including automated heartbeats over 30 days.
status: deprecated
source_revision: policy-r1 retained in policy-r2
sources:
  - id: counting-policy
    resource: ../policies/activity.md
    title: Retained policy-r1 comparison
---
# Previous Active Workspace definition

Fictional history only. For observation instant T before 2026-09-01T00:00:00Z,
the definition used at least one human action or automated heartbeat in
[T - 30 days, T), counting each workspace once.[^counting-policy]

Use the [current definition](active-workspace.md) for T on or after that instant.
Deprecated means no longer current, not invalid for its historical interval.
A heartbeat-only workspace could qualify under the old rule but not the new one;
do not silently rewrite earlier reports. See [scope](../scope.md).

[^counting-policy]: Workspace counting policy, retained policy-r1
