# Calculator methodology and honest results

Use for a requested calculator, estimator or ROI tool whose numbers inform a user
choice. This supplements Free Tools; it does not mandate a new tool, landing page,
lead gate, data collection or experiment. A review remains read-only unless edits
are authorized. Inspect the existing calculation and consumer before proposing changes.

## Make the method inspectable

State the quantity being estimated, units, currency, time basis and audience or
cohort. Distinguish user input, measured data, benchmark assumptions and derived
values. Document the central formulas and define each variable in plain text.
Specify rounding, defaults, exclusions and relevant validity ranges. Show the
methodology where users can inspect it without surrendering contact details needed
only for marketing; a paid report may add depth but must not hide material limits
of a displayed result. Use inline disclosure or an existing details page when enough.

For external benchmarks, record source, date, relevant population/cohort and why
it applies. Identify internal customer data as such; do not expose individual data
or imply representativeness beyond the sample. A citation is not proof the number
was verified. If the source is unavailable, disclose the gap or omit the unsupported
estimate; never invent a benchmark to complete the interface.

Do not choose flattering defaults to manufacture savings. Separate a scenario from
a forecast, guarantee or measured outcome. Explain omitted costs, dependencies and
sensitivity to uncertain assumptions. Match displayed precision to evidence: coarse
inputs do not justify an exact-dollar promise. Show a range only when its construction
is explained; do not label an arbitrary range a statistical confidence interval.

## Verify the calculation, not just the presentation

Use an independently worked example with stated inputs and expected intermediate
and final values. The expected answer must not come from the same implementation
being tested. Verify units/time conversions, percentages versus percentage points,
rounding boundaries, zero denominators, missing inputs, out-of-range values and
negative outcomes where applicable. Missing is not automatically zero. Never clamp
an unfavorable result into a positive marketing claim.

Check the result shown in the actual interface against the approved method. When
requests are asynchronous, stale responses must not replace a newer input's result.
Existing Engineering References owns implementation and data-boundary details;
this guide does not supply a calculation engine or certify all domain-specific math.
Financial, medical, legal or other high-stakes models need appropriate qualified
validation; a disclaimer is not a substitute for a correct, suitable model.

## Preserve meaning across revisions

Keep a method/data version and effective date in the existing owning document or
code history. Record changed assumptions/formulas/sources and which outputs change.
When saved/shared results are supported, retain enough method/input provenance to
explain the result, subject to privacy and retention requirements. Do not add result
storage solely for this checklist. A current formula must not silently rewrite the
meaning of a previously delivered estimate.

Handoff: formula and variable definitions; dated source/assumption inventory; worked
example and checks actually run; meaningful precision and limitations; method/data
version; missing evidence. These checks do not prove conversion gains or user trust.

Source: corrected selective adaptation of RampStack calculator-design and its
calculation-logic-transparency reference at `a67dd34c609f034c0cfd736a348659bbdf1605bf`;
see [provenance and exclusions](../../../RAMPSTACK_SOURCES.md). MIT notice retained there.
