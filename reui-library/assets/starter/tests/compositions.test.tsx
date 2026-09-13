import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataState, Panel, ProfileForm, ResourceTable } from "../src/index";

afterEach(cleanup);

const initialValue = { name: "Ada Lovelace", email: "ada@example.com" };

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function linkedText(input: HTMLElement, attribute = "aria-describedby") {
  const ids = (input.getAttribute(attribute) ?? "").split(/\s+/).filter(Boolean);
  expect(ids.length).toBeGreaterThan(0);
  return ids.map((id) => {
    const target = document.getElementById(id);
    expect(target).not.toBeNull();
    expect(target!.textContent?.trim().length).toBeGreaterThan(0);
    return target!.textContent;
  }).join(" ");
}

function linkedError(input: HTMLElement) {
  expect(input.getAttribute("aria-invalid")).toBe("true");
  // Either supported ARIA association is valid. Do not mandate an ID spelling.
  return linkedText(input, input.hasAttribute("aria-errormessage")
    ? "aria-errormessage" : "aria-describedby");
}

describe("ProfileForm", () => {
  it("initializes labelled controls with real help relationships", () => {
    render(<ProfileForm initialValue={initialValue} onSave={vi.fn()} />);
    const name = screen.getByRole<HTMLInputElement>("textbox", { name: /full name/i });
    const email = screen.getByRole<HTMLInputElement>("textbox", { name: /^email/i });
    expect(name.value).toBe(initialValue.name);
    expect(email.value).toBe(initialValue.email);
    expect(name.id).not.toBe("");
    expect(email.id).not.toBe(name.id);
    linkedText(name);
    linkedText(email);
  });

  it.each(["", "   "])("rejects invalid name %j without saving", async (invalidName) => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ProfileForm initialValue={initialValue} onSave={onSave} />);
    const name = screen.getByRole<HTMLInputElement>("textbox", { name: /full name/i });
    const originalDescription = linkedText(name);
    await user.clear(name);
    if (invalidName) await user.type(name, invalidName);
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    expect(onSave).not.toHaveBeenCalled();
    const errorDescription = linkedError(name);
    expect(errorDescription).toMatch(/name|required|enter/i);
    expect(errorDescription).not.toBe(originalDescription);
  });

  it.each(["", "not-an-email"])("rejects invalid email %j without saving", async (invalidEmail) => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ProfileForm initialValue={initialValue} onSave={onSave} />);
    const email = screen.getByRole<HTMLInputElement>("textbox", { name: /^email/i });
    const originalDescription = linkedText(email);
    await user.clear(email);
    if (invalidEmail) await user.type(email, invalidEmail);
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    expect(onSave).not.toHaveBeenCalled();
    const errorDescription = linkedError(email);
    expect(errorDescription).toMatch(/email|required|valid/i);
    expect(errorDescription).not.toBe(originalDescription);
  });

  it.each([
    { value: "a@intranet", valid: true },
    { value: "a b@example.com", valid: false },
    { value: "a@@example.com", valid: false },
  ])("follows native email validity for $value", async ({ value, valid }) => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ProfileForm initialValue={initialValue} onSave={onSave} />);
    const email = screen.getByRole<HTMLInputElement>("textbox", { name: /^email/i });
    const originalDescription = linkedText(email);
    await user.clear(email);
    await user.type(email, value);
    expect(email.type).toBe("email");
    expect(email.validity.typeMismatch).toBe(!valid);
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    if (valid) {
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({ name: initialValue.name, email: value });
      await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/saved/i));
    } else {
      expect(onSave).not.toHaveBeenCalled();
      const errorDescription = linkedError(email);
      expect(errorDescription).toMatch(/email|required|valid/i);
      expect(errorDescription).not.toBe(originalDescription);
    }
  });

  it("saves the actual edited payload with a trimmed name and confirms success", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ProfileForm initialValue={initialValue} onSave={onSave} />);
    const name = screen.getByRole("textbox", { name: /full name/i });
    const email = screen.getByRole("textbox", { name: /^email/i });
    await user.clear(name);
    await user.type(name, "  Grace Hopper  ");
    await user.clear(email);
    await user.type(email, "grace@example.com");
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ name: "Grace Hopper", email: "grace@example.com" });
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/saved/i));
  });

  it("keeps strict promise saves pending and prevents double submit until resolution", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onSave = vi.fn(() => pending.promise);
    render(<ProfileForm initialValue={initialValue} onSave={onSave} />);
    await user.dblClick(screen.getByRole("button", { name: /save changes/i }));
    const saving = screen.getByRole<HTMLButtonElement>("button", { name: /saving/i });
    expect(saving.disabled).toBe(true);
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(initialValue);
    expect(screen.queryByText(/saved/i)).toBeNull();
    await user.click(saving);
    // Exercise the keyboard submit route as well as a repeated pointer action.
    await user.click(screen.getByRole("textbox", { name: /^email/i }));
    await user.keyboard("{Enter}");
    expect(onSave).toHaveBeenCalledTimes(1);
    await act(async () => { pending.resolve(); await pending.promise; });
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/saved/i));
    expect(screen.getByRole<HTMLButtonElement>("button", { name: /save changes/i }).disabled).toBe(false);
  });

  it("announces rejection, preserves edits, and retries the same payload successfully", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onSave = vi.fn<(_: typeof initialValue) => void | Promise<void>>()
      .mockImplementationOnce(() => pending.promise)
      .mockImplementationOnce(() => undefined);
    render(<ProfileForm initialValue={initialValue} onSave={onSave} />);
    const name = screen.getByRole<HTMLInputElement>("textbox", { name: /full name/i });
    await user.clear(name);
    await user.type(name, "Katherine Johnson");
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    await act(async () => {
      pending.reject(new Error("Save unavailable"));
      await pending.promise.catch(() => undefined);
    });
    const error = await screen.findByRole("alert");
    expect(error.textContent?.trim().length).toBeGreaterThan(0);
    expect(name.value).toBe("Katherine Johnson");
    expect(screen.getByRole<HTMLInputElement>("textbox", { name: /^email/i }).value).toBe(initialValue.email);
    expect(screen.queryByText(/saved/i)).toBeNull();
    const save = screen.getByRole<HTMLButtonElement>("button", { name: /save changes/i });
    expect(save.disabled).toBe(false);
    await user.click(save);
    expect(onSave).toHaveBeenCalledTimes(2);
    const payload = { name: "Katherine Johnson", email: initialValue.email };
    expect(onSave).toHaveBeenNthCalledWith(1, payload);
    expect(onSave).toHaveBeenNthCalledWith(2, payload);
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/saved/i));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("uses instance-local IDs, helper/error links, and callbacks", async () => {
    const user = userEvent.setup();
    const firstSave = vi.fn();
    const secondSave = vi.fn();
    const { container } = render(<>
      <ProfileForm initialValue={initialValue} onSave={firstSave} />
      <ProfileForm initialValue={{ name: "Grace Hopper", email: "grace@example.com" }} onSave={secondSave} />
    </>);
    const names = screen.getAllByRole<HTMLInputElement>("textbox", { name: /full name/i });
    const emails = screen.getAllByRole<HTMLInputElement>("textbox", { name: /^email/i });
    const buttons = screen.getAllByRole("button", { name: /save changes/i });
    for (const input of [...names, ...emails]) linkedText(input);
    await user.clear(names[0]);
    await user.click(buttons[0]);
    linkedError(names[0]);
    expect(names[1].getAttribute("aria-invalid")).not.toBe("true");
    const ids = Array.from(container.querySelectorAll("[id]"), (node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const input of [...names, ...emails]) {
      const form = input.closest("form");
      expect(form).not.toBeNull();
      for (const attribute of ["aria-describedby", "aria-errormessage"]) {
        for (const id of (input.getAttribute(attribute) ?? "").split(/\s+/).filter(Boolean)) {
          expect(form!.contains(document.getElementById(id))).toBe(true);
        }
      }
    }
    await user.click(buttons[1]);
    expect(firstSave).not.toHaveBeenCalled();
    expect(secondSave).toHaveBeenCalledTimes(1);
    expect(secondSave).toHaveBeenCalledWith({ name: "Grace Hopper", email: "grace@example.com" });
  });

  it("does not reset in-progress edits when initialValue changes on rerender", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const { rerender } = render(<ProfileForm initialValue={initialValue} onSave={onSave} />);
    const name = screen.getByRole<HTMLInputElement>("textbox", { name: /full name/i });
    await user.clear(name);
    await user.type(name, "My unsaved edit");
    rerender(<ProfileForm initialValue={{ name: "Replacement", email: "other@example.com" }} onSave={onSave} />);
    expect(name.value).toBe("My unsaved edit");
    expect(screen.getByRole<HTMLInputElement>("textbox", { name: /^email/i }).value).toBe(initialValue.email);
    expect(onSave).not.toHaveBeenCalled();
  });
});

// Duplicate names have deliberately distinct owners and reversed owner order.
// A count-only assertion or descending array reversal must not pass these tests.
const rows = [
  { id: "beta-1", name: "Beta", owner: "Zoe", status: "active" as const },
  { id: "alpha", name: "Alpha", owner: "Mira", status: "paused" as const },
  { id: "beta-2", name: "Beta", owner: "Aaron", status: "paused" as const },
  { id: "gamma", name: "Gamma", owner: "Nora", status: "active" as const },
];
function resourceRows() {
  const table = screen.getByRole("table", { name: /resources/i });
  return within(table).getAllByRole("row").filter((row) => within(row).queryAllByRole("cell").length >= 3);
}
function displayedResources() {
  return resourceRows().map((row) => within(row).getAllByRole("cell").slice(0, 2).map((cell) => cell.textContent?.trim()));
}
const ascending = [["Alpha", "Mira"], ["Beta", "Zoe"], ["Beta", "Aaron"], ["Gamma", "Nora"]];
const descending = [["Gamma", "Nora"], ["Beta", "Zoe"], ["Beta", "Aaron"], ["Alpha", "Mira"]];

describe("ResourceTable", () => {
  it("sorts actual rows stably in both directions and retains row identity", async () => {
    const user = userEvent.setup();
    render(<ResourceTable rows={rows} />);
    expect(displayedResources()).toEqual(ascending);
    const sort = screen.getByRole("button", { name: /name/i });
    const heading = sort.closest("th");
    expect(heading?.getAttribute("aria-sort")).toBe("ascending");
    const originalNodes = new Map(resourceRows().map((row) => [row.textContent, row]));
    await user.click(sort);
    expect(displayedResources()).toEqual(descending);
    expect(heading?.getAttribute("aria-sort")).toBe("descending");
    for (const row of resourceRows()) expect(row).toBe(originalNodes.get(row.textContent));
    await user.click(sort);
    expect(displayedResources()).toEqual(ascending);
    expect(heading?.getAttribute("aria-sort")).toBe("ascending");
    // Sorting must not mutate the caller-owned array.
    expect(rows.map((row) => row.id)).toEqual(["beta-1", "alpha", "beta-2", "gamma"]);
  });

  it("filters by name and owner, shows no matches, then restores the sorted rows", async () => {
    const user = userEvent.setup();
    render(<ResourceTable rows={rows} />);
    const search = screen.getByLabelText(/search resources/i);
    await user.type(search, "Beta");
    expect(displayedResources()).toEqual([["Beta", "Zoe"], ["Beta", "Aaron"]]);
    await user.clear(search);
    await user.type(search, "Mira");
    expect(displayedResources()).toEqual([["Alpha", "Mira"]]);
    await user.clear(search);
    await user.type(search, "absent-resource-927");
    expect(displayedResources()).toEqual([]);
    expect(screen.getByText(/no (matching resources|resources match|matches|results)/i).textContent).toBeTruthy();
    await user.clear(search);
    expect(displayedResources()).toEqual(ascending);
    await user.click(screen.getByRole("button", { name: /name/i }));
    await user.type(search, "Beta");
    expect(displayedResources()).toEqual([["Beta", "Zoe"], ["Beta", "Aaron"]]);
    await user.clear(search);
    expect(displayedResources()).toEqual(descending);
  });

  it("distinguishes an empty collection from a filter with no matches", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ResourceTable rows={[]} />);
    const empty = screen.getByText(/no resources|no data|nothing here/i).textContent;
    expect(empty?.trim().length).toBeGreaterThan(0);
    expect(displayedResources()).toEqual([]);
    rerender(<ResourceTable rows={rows} />);
    await user.type(screen.getByLabelText(/search resources/i), "absent-resource-927");
    const noMatches = screen.getByText(/no (matching resources|resources match|matches|results)/i).textContent;
    expect(noMatches).not.toBe(empty);
    expect(displayedResources()).toEqual([]);
  });
});

describe("DataState", () => {
  it("exposes loading as status without claiming success or error", () => {
    render(<DataState status="loading" />);
    expect(screen.getByRole("status").textContent).toMatch(/loading/i);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("button", { name: /retry|try again/i })).toBeNull();
  });

  it("gives errors an alert and calls the supplied retry handler", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<DataState status="error" onRetry={onRetry} />);
    expect(screen.getByRole("alert").textContent?.trim().length).toBeGreaterThan(0);
    expect(onRetry).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /retry|try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not offer an unwired retry and keeps empty distinct from loading/error", () => {
    const { rerender, container } = render(<DataState status="error" />);
    const errorText = screen.getByRole("alert").textContent;
    expect(screen.queryByRole("button", { name: /retry|try again/i })).toBeNull();
    rerender(<DataState status="empty" />);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.textContent?.trim().length).toBeGreaterThan(0);
    expect(container.textContent).not.toBe(errorText);
    expect(container.textContent).not.toMatch(/loading/i);
    expect(screen.queryByRole("button", { name: /retry|try again/i })).toBeNull();
  });
});

describe("Panel", () => {
  it("labels an ordinary section and keeps body and footer content distinct", () => {
    render(<Panel title="Activity" footer={<button>Export activity</button>}>
      <article aria-label="Activity details"><p>Long activity body</p></article>
    </Panel>);
    const panel = screen.getByRole("region", { name: "Activity" });
    expect(panel.tagName).toBe("SECTION");
    expect(within(panel).getByRole("heading", { name: "Activity" })).toBeTruthy();
    const body = within(panel).getByRole("article", { name: "Activity details" });
    const footerAction = within(panel).getByRole("button", { name: "Export activity" });
    expect(body.contains(footerAction)).toBe(false);
    expect(panel.getAttribute("aria-modal")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("supports no footer and gives multiple panels independent names", () => {
    render(<><Panel title="First panel">First body</Panel><Panel title="Second panel">Second body</Panel></>);
    const first = screen.getByRole("region", { name: "First panel" });
    const second = screen.getByRole("region", { name: "Second panel" });
    expect(first.textContent).toContain("First body");
    expect(first.textContent).not.toContain("Second body");
    expect(second.textContent).toContain("Second body");
    expect(first).not.toBe(second);
  });
});
