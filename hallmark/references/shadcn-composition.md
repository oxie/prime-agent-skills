# shadcn composition — inspect the installed component

Use only for an existing or explicitly selected shadcn interface. This does not
choose a framework, authorize a component update or require shadcn for plain HTML.
Keep Hallmark's selected workflow, design tokens and project implementation owner.
No new CLI, registry download, preset, dependency or theme replacement is needed
just to read this reference. Reviews remain read-only. No supported gap means no change.

## Establish the actual API

Read relevant package/lockfile, components configuration and local component source,
including custom wrappers and callers. Identify whether this component uses Radix,
Base UI or a local adapter; one project can contain different generations. A catalog
name or latest online example does not establish the installed API. Resolve a
material uncertainty against matching version/source docs, not a cast that hides it.

The following are version-dependent comparison prompts, not universal signatures:

| Concern | Inspect in the local implementation |
|---|---|
| Trigger composition | Radix commonly uses `asChild`; Base commonly uses `render`. Verify the wrapper exposes that option. |
| Native element | Links navigate; buttons act. Check any nativeButton setting when render changes element type. |
| Toggle/accordion | `type` versus `multiple`, scalar versus array values, and the empty/deselected state differ. |
| Select | Value type, label/item mapping, placeholder, object identity and positioning APIs differ. |
| Slider | Scalar/array single-thumb values and range callbacks depend on the actual wrapper. |

Do not mix these props or assume every component supports a library-wide shortcut.
A same-named exported wrapper can intentionally change defaults and types.

## Preserve semantic composition

A trigger should produce one appropriate interactive element, not nested buttons
or a link inside a button. Custom children must preserve required props, handlers
and refs under the installed React/library contract. Composed event handlers must
not accidentally suppress the primitive's keyboard or dismissal behavior. Test
preventDefault and disabled handling where the wrapper changes them.

Use actual accessible labels, stable IDs and described error/help text. A visual
FieldDescription does not associate itself unless the wrapper does so; inspect the
rendered aria-describedby relationship. aria-invalid, disabled and styling data
attributes have distinct jobs. A disabled-looking container is not a disabled control.
Group related controls with real fieldset/legend or supported equivalent semantics.
Do not force a new Field component into a project with correct native markup.

Verify form submit through onSubmit/native keyboard paths, correct button types,
validation feedback and focus. Do not disable error discovery blindly. Keep real
pending/success/failure behavior with the existing form/data owner.

For a modal/sheet, check accessible name, modal versus nonmodal behavior, escape,
outside interactions, focus entry/return and stacked portals. A primitive does not
certify the composed application. Composite widgets can use arrow keys/roving focus;
not every item must be in the Tab sequence. Avoid arbitrary z-index repairs that
hide a portal/stacking ownership issue. Preserve narrow-screen, zoom and reduced-
motion behavior without replacing tokens or fonts.

## Updates preserve local code

Only when an update is authorized, identify exact installed files and local changes.
Use an available project-native preview/diff against the selected version. Review
file-by-file before replacing; preserve custom logic, labels, tokens and callers.
Do not use a moving latest command or assume generated source is unmodified vendor
code. A registry/component may carry its own license and dependencies. Record exact
source and notices before obtaining new material. No blind all-component refresh.

Check native types/build/tests and actual rendered interactions for changed consumers.
Include valid empty/deselected values, controlled/uncontrolled transitions, link
navigation, keyboard focus and error association. A typecheck cannot prove focus
behavior; a screenshot cannot prove form submission. Browser-check keeps its existing
owned-preview limits; it is not an unrestricted component runner.

Example: for a settings form and sheet, first determine each local primitive, then
adapt the existing trigger/value contract. Keep a correctly working wrapper unchanged.
Report exact files/version, smallest change, executed checks and remaining limits.

Modified for Prime: selected ideas rewritten without upstream CLI directives or
universal style rules. See [source and license notices](../NEXT_SOURCES.md).
