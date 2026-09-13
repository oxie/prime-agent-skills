import * as React from "react";
import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, FieldError } from "../src/index";

afterEach(cleanup);
it("Button forwards a native ref, variant and disabled/click contracts", async () => {
  const user = userEvent.setup(); const ref = React.createRef<HTMLButtonElement>(); const click = vi.fn();
  const { rerender } = render(<Button ref={ref} type="button" variant="outline" disabled onClick={click}>Action</Button>);
  const button = screen.getByRole<HTMLButtonElement>("button", { name: "Action" });
  expect(ref.current).toBe(button); expect(button.disabled).toBe(true);
  expect(button.className).toContain("cn-button-variant-outline");
  await user.click(button); expect(click).not.toHaveBeenCalled();
  rerender(<Button ref={ref} type="button" variant="outline" onClick={click}>Action</Button>);
  await user.click(button); expect(click).toHaveBeenCalledTimes(1);
});
it("FieldError omits arrays containing only absent or blank messages", () => {
  render(<FieldError errors={[undefined, {}, { message: "" }, { message: "   " }]} />);
  expect(screen.queryByRole("alert")).toBeNull();
});
it("FieldError deduplicates real messages while ignoring empty entries", () => {
  render(<FieldError errors={[{}, { message: "Name required" }, { message: "Name required" }, { message: "Email invalid" }]} />);
  const alert = screen.getByRole("alert");
  expect(within(alert).getAllByRole("listitem").map(item => item.textContent)).toEqual(["Name required", "Email invalid"]);
});
it("FieldError gives explicit content precedence and clears without content", () => {
  const { rerender } = render(<FieldError errors={[{ message: "Other" }]}>Explicit error</FieldError>);
  expect(screen.getByRole("alert").textContent).toBe("Explicit error");
  rerender(<FieldError />); expect(screen.queryByRole("alert")).toBeNull();
});
it("custom Tailwind semantics stay namespaced; this is a source guard, not full CSS isolation", () => {
  const css = readFileSync("src/styles.css", "utf8");
  for (const name of ["foreground", "muted-foreground", "primary", "muted"]) expect(css).toContain(`--color-reui-${name}:`);
  expect(css).not.toMatch(/--color-(?:foreground|background|muted-foreground|primary|muted)\s*:/);
  expect(css).not.toMatch(/@import\s+["'][^"']*preflight/);
});
