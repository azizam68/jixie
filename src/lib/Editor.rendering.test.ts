import { screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { renderEditor } from "./Editor.test-utils";

describe("Éditeur : rendu et saisie", () => {
  it("affiche une zone d'édition", () => {
    renderEditor();

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("permet d'écrire du texte", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    expect(textbox).toHaveTextContent("Bonjour Jixie");
  });

  it("permet d'écrire plusieurs paragraphes", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Premier paragraphe");
    await user.keyboard("{Enter}");
    await user.type(textbox, "Deuxième paragraphe");

    expect(textbox).toHaveTextContent("Premier paragraphe");
    expect(textbox).toHaveTextContent("Deuxième paragraphe");
  });
});
