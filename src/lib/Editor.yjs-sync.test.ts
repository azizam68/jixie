import { screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import * as Y from "yjs";
import { renderEditor, seedYDocWithHtml } from "./Editor.test-utils";

describe("Éditeur : synchronisation Yjs", () => {
  it("crée un document Yjs vide", () => {
    const ydoc = new Y.Doc();
    renderEditor({ ydoc });

    expect(ydoc.getXmlFragment("default").length).toBe(0);
  });

  it("synchronise les modifications avec le document Yjs", async () => {
    const user = userEvent.setup();
    const ydoc = new Y.Doc();
    renderEditor({ ydoc });
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    expect(ydoc.getXmlFragment("default").toString()).toContain(
      "Bonjour Jixie"
    );
  });

  it("affiche le contenu existant d'un document Yjs déjà rempli", () => {
    const ydoc = new Y.Doc();
    seedYDocWithHtml(ydoc, "<p>Hello World</p>");

    renderEditor({ ydoc });

    expect(screen.getByRole("textbox")).toHaveTextContent("Hello World");
  });

  it("affiche le contenu du document chargé de façon asynchrone", async () => {
    const ydoc = new Y.Doc();
    seedYDocWithHtml(ydoc, "<p>Bonjour Jixie</p>");

    renderEditor({ ydoc });

    await waitFor(() => {
      expect(screen.getByRole("textbox")).toHaveTextContent("Bonjour Jixie");
    });
  });
});
