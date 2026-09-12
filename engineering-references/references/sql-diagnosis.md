# Result-preserving SQL diagnosis

Use for a slow query or an authorized query rewrite, not every data change.
Preserve existing database/version, query tooling and business semantics. Reviews
stay read-only unless checks/changes are authorized. No index, migration, production
probe or profiler is authorized merely by this reference. No supported gap means
no change. Use the existing data-consistency reference for broader durability risks.

## Freeze correctness before measuring speed

Identify the query and callers, parameters, tenant filters, expected rows, columns,
null handling, multiplicity, ordering, pagination and snapshot/concurrency contract.
Record database/version and representative data distribution, not just row count.
A faster query with different filters, counts or permissions is not an optimization.

Use small explicit fixtures before performance work: empty input, no matches,
parents with zero children, duplicate join keys, nulls, tied sort values and tenant
boundaries. Preserve duplicate multiplicity; set equality alone is insufficient.
Compare ordered sequences where ordering is contractual, and multisets otherwise.
A join replacing per-parent reads must not drop zero-child parents or multiply
aggregates accidentally. Predicate placement in WHERE versus ON can change a LEFT
JOIN. Keep exact counts distinct from estimates and materialized/stale results.

For keyset pagination use an explicit total order. A descending timestamp often
needs a unique non-null tie breaker such as `(created_at, id)`, with the same order
and cursor comparison. Define null placement, reverse paging, stable cursor encoding
and allowed sort keys. A tie breaker alone does not prevent skips/repeats when rows
change their sort keys between pages; preserve or explicitly decide snapshot behavior.
Do not silently replace random page access with keyset navigation.

Batch queries bind values through the driver's supported parameter mechanism.
Return the contract's empty result for empty input; do not issue an accidental
unfiltered query or interpolate an IN list. Bound batch size and restore caller
order/duplicates when required. SQL result order is not input order without evidence.

## Measure the actual workload

Start with the existing estimated plan and safe statistics where available. Examine
estimated versus observed rows, scans, join loops, sorts/spills, buffer/heap reads,
lock waits and time spent outside the database. A sequential scan can be appropriate;
a small query plan cost is not a measured endpoint latency or a universal ranking.

EXPLAIN ANALYZE executes the statement. SELECT can invoke functions with side effects;
ROLLBACK is not a universal side-effect shield. Use a reviewed read-only operation
on authorized representative test data, with existing timeout/resource limits.
Do not copy maintenance, ANALYZE/VACUUM, DDL or configuration commands into a review.
If execution is unavailable, report estimates and hypotheses, not measured gains.

Change one evidenced bottleneck at a time. Index column order, coverage and partial
predicates depend on actual filters/order/selectivity and write cost. Index-only
plans still depend on visibility and heap access. Partitioning, materialized views,
bulk loading or additional caches are not default fixes. They may change consistency,
locks, refresh lag, transaction granularity and recovery. Require the real contract.

Compare equal-result runs under comparable parameters, data, concurrency, hardware,
cache conditions and measurement method. Preserve outliers and failure cases; do
not compare a cold baseline with a warm candidate and call it improvement. Record
repeated measurements and limitations, separating database and end-to-end latency.

## Bounded example review

A customer listing ordered only by creation time skips tied rows. A proposed inner
join also loses customers without orders. Restore the contractual total order and
zero-child behavior first; assert the exact tied row sequence and aggregate values.
Then inspect a candidate composite index with the native plan tool if authorized.
A passing result fixture does not prove PostgreSQL performance from a SQLite test.

Report query/revision, semantics preserved, actual measurements, smallest justified
change, index/write tradeoffs and unexecuted checks. Keep rollout and rollback with
the existing project release owner. No extra finding or tuning pass is required.

Modified for Prime: selectively rewritten and corrected. See
[source and license notices](../NEXT_SOURCES.md). Examples are conceptual, not run.
