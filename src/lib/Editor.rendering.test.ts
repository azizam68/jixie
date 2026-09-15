import { screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { renderEditor } from "./Editor.test-utils";

describe("Éditeur : rendu et saisie", () => {
  it("affiche une zone d'édition", () => {
    renderEditor();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("affiche une barre de status", async () => {
    renderEditor();
    const status = screen.getByRole("status", { name: /status/i });
    expect(status).toBeInTheDocument();
  });

  it("affiche le nombre de caractere ou de mot dans la barre de status", async () => {
    renderEditor();

    const status = screen.getByRole("status", { name: /status/i });
    const textbox = screen.getByRole("textbox");
    const user = userEvent.setup();

    await waitFor(() => {
        expect(status).toHaveTextContent("0 mots");   
    });
    await user.type(textbox, "Premier paragraphe");
    await waitFor(() => {
        expect(status).toHaveTextContent("2 mots");
    });
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
