---
type: Policy
title: Workspace counting policy
description: Fictional interval and event rules for reporting only.
status: draft
example_revision: policy-r2
---
# Workspace counting policy

This is a fictional source document, not evidence of a real organization's decision.
At observation instant T on or after 2026-09-01T00:00:00Z, count a workspace as
active if it has at least one human action in [T - 14 days, T). Include the lower
boundary and exclude T itself. Days mean elapsed 24-hour periods measured in UTC,
not local calendar dates. Automated heartbeats do not count. Count each qualifying
workspace once, regardless of the number of actions.

For T before that effective instant, retained policy-r1 used [T - 30 days, T)
and included both human actions and automated heartbeats. Do not retroactively
change a historical report solely because policy-r2 exists. Event evidence must
still be available for the relevant workspace and interval.

This bundle does not specify how a real system proves an event is human. Without
that evidence, do not substitute a heartbeat or assume that missing events prove
inactivity. See the [current definition](../definitions/active-workspace.md) and
[historical definition](../definitions/active-workspace-legacy.md).
