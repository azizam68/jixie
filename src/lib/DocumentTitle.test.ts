import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, vi, it, expect } from "vitest";
import DocumentTitle from "./DocumentTitle.svelte";

const documentId = "868686-868686-868686-868686";

function renderDocumentTitle(title = "") {
  return render(DocumentTitle, {
    props: {
      data: { title, documentId }
    }
  });
}

describe("DocumentTitle", () => {
  it("should fall back to documentId when title is empty", () => {
    renderDocumentTitle("");
    const trigger = screen.getByRole("button", { name: documentId });
    expect(trigger).toBeInTheDocument();
  });

  it("should render the title when it is set", () => {
    renderDocumentTitle("My Document");
    const trigger = screen.getByRole("button", { name: "My Document" });
    expect(trigger).toBeInTheDocument();
  });

  it("should switch to edit mode when clicked", async () => {
    renderDocumentTitle("My Document");
    const trigger = screen.getByRole("button", { name: "My Document" });
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  it("should prefill the input with the current title in edit mode", async () => {
    renderDocumentTitle("My Document");
    await userEvent.click(screen.getByRole("button", { name: "My Document" }));
    const input = await screen.findByRole("textbox");
    expect(input).toHaveValue("My Document");
  });

  it("canceling edit mode should revert to the original title", async () => {
    renderDocumentTitle("My Document");
    await userEvent.click(screen.getByRole("button", { name: "My Document" }));
    const input = await screen.findByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "Changed but not saved");

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "My Document" })).toBeInTheDocument();
    });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});