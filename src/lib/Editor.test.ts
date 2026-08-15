import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Editor from "./Editor.svelte";

describe("Éditeur", () => {
  it("affiche une zone d’édition", () => {
    render(Editor);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("permet d’écrire du texte", async () => {
    const user = userEvent.setup();

    render(Editor);

    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    expect(textbox).toHaveTextContent("Bonjour Jixie");
  });

  it("affiche le contenu initial", () => {
    render(Editor, {
      props: {
        content: "Bienvenue dans Jixie",
      },
    });

    expect(screen.getByRole("textbox")).toHaveTextContent(
      "Bienvenue dans Jixie",
    );
  });
  it("signale quand le contenu est modifié", async () => {
    const user = userEvent.setup();
    let contenu = "";

    render(Editor, {
      props: {
        content: "",
        onchange: (value: string) => {
          contenu = value;
        },
      },
    });

    const textbox = screen.getByRole("textbox");

    // Au lieu de user.clear(), sélectionner tout et supprimer
    await user.tripleClick(textbox); // Sélectionner tout
    await user.keyboard("{Backspace}"); // Supprimer le contenu

    // OU simplement taper sans clear (si l'éditeur est vide par défaut)
    await user.type(textbox, "Bonjour Jixie");

    expect(contenu).toContain("Bonjour Jixie");
  });

  it("permet d’écrire plusieurs paragraphes", async () => {
    const user = userEvent.setup();

    render(Editor);

    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Premier paragraphe");
    await user.keyboard("{Enter}");
    await user.type(textbox, "Deuxième paragraphe");

    expect(textbox).toHaveTextContent("Premier paragraphe");
    expect(textbox).toHaveTextContent("Deuxième paragraphe");
  });

  it("permet de mettre du texte en gras #1 - le texte ne doit pas etre gras", async () => {
    const user = userEvent.setup();

    render(Editor);

    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour");

    expect(textbox.querySelector("strong")).not.toBeInTheDocument();
  });

  it("permet de mettre du texte en gras #2 - le bouton existe", async () => {
    const user = userEvent.setup();

    render(Editor);

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Bonjour Jixie");

    const boldButton = screen.getByRole("button", { name: "Gras" });

    expect(boldButton).toBeInTheDocument();
  });

  it("permet de mettre du texte en gras", async () => {
    const user = userEvent.setup();

    render(Editor);

    const textbox = screen.getByRole("textbox");
    const boldButton = screen.getByRole("button", { name: "Gras" });

    await user.type(textbox, "Bonjour Jixie");
    await user.tripleClick(textbox);
    await user.click(boldButton);

    const strongElement = textbox.querySelector("strong");

    expect(strongElement).toBeInTheDocument();
    expect(strongElement).toHaveTextContent("Bonjour Jixie");
  });

  it("permet de supprimer le gras", async () => {
    const user = userEvent.setup();

    render(Editor);

    const textbox = screen.getByRole("textbox");
    const boldButton = screen.getByRole("button", { name: "Gras" });

    // 1. Écrire le texte
    await user.type(textbox, "Bonjour Jixie");

    // 2. Sélectionner tout le texte
    await user.tripleClick(textbox);

    // 3. Mettre en gras
    await user.click(boldButton);

    // 4. Re-sélectionner le texte
    await user.tripleClick(textbox);

    // 5. Retirer le gras
    await user.click(boldButton);

    // 6. Vérifier que le texte n'est plus en gras
    expect(textbox.querySelector("strong")).not.toBeInTheDocument();
  });
  it("indique quand le curseur est dans un texte en gras", async () => {
    const user = userEvent.setup();

    render(Editor);

    const textbox = screen.getByRole("textbox");
    const boldButton = screen.getByRole("button", { name: "Gras" });

    await user.type(textbox, "Bonjour Jixie");
    await user.tripleClick(textbox);
    await user.click(boldButton);

    expect(textbox.querySelector("strong")).toHaveTextContent("Bonjour Jixie");

    expect(boldButton).toHaveAttribute("aria-pressed", "true");
  });
});
