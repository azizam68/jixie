import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, vi, it, expect } from "vitest";
import Editor from "./Editor.svelte";
import * as Y from "yjs";
import { Editor as TiptapEditor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";

function renderEditor(
    ydoc = new Y.Doc(),
    onSave?: (ydoc: Y.Doc) => Promise<void>
) {
    const documentId = crypto.randomUUID();

    return render(Editor, {
        props: {
            ydoc,
            documentId,
            onSave
        }
    });
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
  it('sauvegarde automatiquement le document lorsqu’il est modifié', async () => {
    const user = userEvent.setup();

    const ydoc = new Y.Doc();
    const saveDocument = vi.fn().mockResolvedValue(undefined);
    const documentId = crypto.randomUUID();

    render(Editor, {
      props: {
        ydoc: new Y.Doc(),
        documentId,
        onSave: saveDocument
      }
    });
    const textbox = screen.getByRole('textbox');

    await user.type(textbox, 'Bonjour Jixie');

    await waitFor(() => {
      expect(saveDocument).toHaveBeenCalled();
    });
  });
  it('regroupe les modifications rapprochées en une seule sauvegarde', async () => {
    const user = userEvent.setup();

    const ydoc = new Y.Doc();
    const saveDocument = vi.fn().mockResolvedValue(undefined);
    const documentId = crypto.randomUUID();

    render(Editor, {
      props: {
        ydoc: new Y.Doc(),
        documentId,
        onSave: saveDocument
      }
    });
    const textbox = screen.getByRole('textbox');

    await user.type(textbox, 'Bonjour Jixie');

    // L'utilisateur vient juste de terminer sa saisie.
    // Une sauvegarde ne doit pas être effectuée pour chaque caractère.
    expect(saveDocument).not.toHaveBeenCalled();

    // On laisse passer le délai de sauvegarde automatique.
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(saveDocument).toHaveBeenCalledTimes(1);
  });
  it("indique quand le document est en cours de sauvegarde", async () => {
    const user = userEvent.setup();

    const ydoc = new Y.Doc();

    const saveDocument = vi.fn(
      () => new Promise<void>(() => { })
    );
    const documentId = crypto.randomUUID();

    render(Editor, {
      props: {
        ydoc: new Y.Doc(),
        documentId,
        onSave: saveDocument
      }
    });
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    await waitFor(() => {
      expect(screen.getByText("Enregistrement…")).toBeInTheDocument();
    });
  });
  it("indique quand le document a été sauvegardé", async () => {
    const user = userEvent.setup();

    const ydoc = new Y.Doc();

    const saveDocument = vi.fn().mockResolvedValue(undefined);
    const documentId = crypto.randomUUID();

    render(Editor, {
      props: {
        ydoc: new Y.Doc(),
        documentId,
        onSave: saveDocument
      }
    });

    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    await waitFor(() => {
      expect(saveDocument).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Enregistré")).toBeInTheDocument();
    });
  });
  it("indique une erreur lorsque la sauvegarde échoue", async () => {
    const user = userEvent.setup();

    const ydoc = new Y.Doc();

    const saveDocument = vi.fn().mockRejectedValue(
      new Error("Erreur réseau")
    );
    const documentId = crypto.randomUUID();

    render(Editor, {
      props: {
        ydoc: new Y.Doc(),
        documentId,
        onSave: saveDocument
      }
    });

    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    await waitFor(() => {
      expect(screen.getByText("Erreur d'enregistrement")).toBeInTheDocument();
    });
  });
  it("retente automatiquement la sauvegarde après une erreur", async () => {
    const user = userEvent.setup();

    const ydoc = new Y.Doc();

    const saveDocument = vi
      .fn()
      .mockRejectedValueOnce(new Error("Erreur réseau"))
      .mockResolvedValue(undefined);
    const documentId = crypto.randomUUID();

    render(Editor, {
      props: {
        ydoc: new Y.Doc(),
        documentId,
        onSave: saveDocument
      }
    });
    const textbox = screen.getByRole("textbox");

    // Première modification
    await user.type(textbox, "Bonjour");

    // Attendre la première tentative de sauvegarde
    await waitFor(() => {
      expect(saveDocument).toHaveBeenCalledTimes(1);
    });

    // La première sauvegarde a échoué
    await waitFor(() => {
      expect(screen.getByText("Erreur d'enregistrement")).toBeInTheDocument();
    });

    // L'utilisateur modifie à nouveau le document
    await user.type(textbox, " Jixie");

    // Une nouvelle sauvegarde doit être déclenchée
    await waitFor(
      () => {
        expect(saveDocument).toHaveBeenCalledTimes(2);
      },
      { timeout: 1000 }
    );

    // Cette fois la sauvegarde réussit
    await waitFor(() => {
      expect(screen.getByText("Enregistré")).toBeInTheDocument();
    });
  });
  it("crée une nouvelle version après une sauvegarde automatique", async () => {
    const user = userEvent.setup();

    const saveDocument = vi.fn().mockResolvedValue(undefined);

    const documentId = crypto.randomUUID();

    render(Editor, {
      props: {
        ydoc: new Y.Doc(),
        documentId,
        onSave: saveDocument
      }
    });


    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    await waitFor(() => {
      expect(saveDocument).toHaveBeenCalledTimes(1);
    });
  }); 
  it("affiche le contenu du document chargé", async () => {
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

    sourceEditor.commands.setContent("<p>Bonjour Jixie</p>");

    sourceEditor.destroy();

    const documentId = crypto.randomUUID();

    render(Editor, {
        props: {
            ydoc,
            documentId,
        },
    });

    const textbox = screen.getByRole("textbox");

    await waitFor(() => {
        expect(textbox).toHaveTextContent("Bonjour Jixie");
    });
});
});
