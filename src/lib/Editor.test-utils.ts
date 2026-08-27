import { render } from "@testing-library/svelte";
import { vi } from "vitest";
import * as Y from "yjs";
import { Editor as TiptapEditor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import Editor from "./Editor.svelte";

export interface RenderEditorOptions {
  ydoc?: Y.Doc;
  onSave?: (ydoc: Y.Doc) => Promise<void>;
}

/**
 * Rend le composant Editor avec des props par défaut sensées.
 * Retourne aussi le ydoc et le documentId utilisés, pour pouvoir
 * les inspecter directement dans les tests.
 */
export function renderEditor(options: RenderEditorOptions = {}) {
  const ydoc = options.ydoc ?? new Y.Doc();
  const documentId = crypto.randomUUID();

  return {
    ydoc,
    documentId,
    ...render(Editor, {
      props: {
        ydoc,
        documentId,
        onSave: options.onSave,
      },
    }),
  };
}

/**
 * Écrit du contenu HTML directement dans un Y.Doc via une instance Tiptap
 * temporaire (détruite immédiatement après), pour simuler un document
 * déjà rempli par un autre client / le serveur.
 */
export function seedYDocWithHtml(ydoc: Y.Doc, html: string) {
  const sourceEditor = new TiptapEditor({
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      Collaboration.configure({ document: ydoc }),
    ],
  });

  sourceEditor.commands.setContent(html);
  sourceEditor.destroy();
}

/**
 * Crée un mock onSave dont la promesse ne se résout jamais tant que
 * resolveSave() n'a pas été appelé. Utile pour tester les états
 * intermédiaires ("Enregistrement…").
 */
export function createDeferredSave() {
  let resolveSave!: () => void;
  const promise = new Promise<void>((resolve) => {
    resolveSave = resolve;
  });
  const onSave = vi.fn(() => promise);

  return { onSave, resolveSave };
}
