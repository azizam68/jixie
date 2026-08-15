import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import Editor from "./Editor.svelte";
import * as Y from "yjs";
import { Editor as TiptapEditor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";

function renderEditor(ydoc = new Y.Doc()) {
  render(Editor, {
    props: {
      ydoc,
    },
  });

  return { ydoc };
}

describe("Éditeur", () => {
  it("affiche une zone d’édition", () => {
    renderEditor();

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("permet d’écrire du texte", async () => {
    const user = userEvent.setup();

    renderEditor();

    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    expect(textbox).toHaveTextContent("Bonjour Jixie");
  });

it("crée un document Yjs vide", () => {
  const ydoc = new Y.Doc();

  renderEditor(ydoc);

  const fragment = ydoc.getXmlFragment("default");

  expect(fragment.length).toBe(0);
});
it("synchronise les modifications avec un document Yjs", async () => {
  const user = userEvent.setup();
  const ydoc = new Y.Doc();

  renderEditor(ydoc);

  const textbox = screen.getByRole("textbox");

  await user.type(textbox, "Bonjour Jixie");

  const fragment = ydoc.getXmlFragment("default");

  expect(fragment.toString()).toContain("Bonjour Jixie");
});

  it("permet d’écrire plusieurs paragraphes", async () => {
    const user = userEvent.setup();

    renderEditor();

    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Premier paragraphe");
    await user.keyboard("{Enter}");
    await user.type(textbox, "Deuxième paragraphe");

    expect(textbox).toHaveTextContent("Premier paragraphe");
    expect(textbox).toHaveTextContent("Deuxième paragraphe");
  });

  // tests gras...


  it("permet de mettre du texte en gras #1 - le texte ne doit pas etre gras", async () => {
    const user = userEvent.setup();

    renderEditor();

    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour");

    expect(textbox.querySelector("strong")).not.toBeInTheDocument();
  });

  it("permet de mettre du texte en gras #2 - le bouton existe", async () => {
    const user = userEvent.setup();

    renderEditor();

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Bonjour Jixie");

    const boldButton = screen.getByRole("button", { name: "Gras" });

    expect(boldButton).toBeInTheDocument();
  });

  it("permet de mettre du texte en gras", async () => {
    const user = userEvent.setup();

    renderEditor();

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

    renderEditor();

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

    renderEditor();

    const textbox = screen.getByRole("textbox");
    const boldButton = screen.getByRole("button", { name: "Gras" });

    await user.type(textbox, "Bonjour Jixie");
    await user.tripleClick(textbox);
    await user.click(boldButton);

    expect(textbox.querySelector("strong")).toHaveTextContent("Bonjour Jixie");

    expect(boldButton).toHaveAttribute("aria-pressed", "true");
  });
  
  
  it("affiche le contenu existant dans un document Yjs", async () => {
  const ydoc = new Y.Doc();

  const sourceEditor = new TiptapEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
    ],
  });

  // Écrire réellement dans le document Yjs
  sourceEditor.commands.setContent("<p>Hello World</p>");

  // Notre composant lit le même Y.Doc
  renderEditor(ydoc);

  const textbox = screen.getByRole("textbox");

  expect(textbox).toHaveTextContent("Hello World");

  sourceEditor.destroy();
});
});
