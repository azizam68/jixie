<script lang="ts">
  import { onMount } from "svelte";
  import { Editor as TiptapEditor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import * as Y from "yjs";
  import Collaboration from "@tiptap/extension-collaboration";

let {
    ydoc,
    documentId,
    onSave
}: {
    ydoc: Y.Doc;
    documentId: string;
    onSave?: (ydoc: Y.Doc) => Promise<void>;
} = $props();

  let editorElement: HTMLDivElement;
  let editor: TiptapEditor;
  let saveTimeout: ReturnType<typeof setTimeout> | undefined;
  let boldActive = $state(false);
  let saveStatus = $state<"saved" | "saving" | "error">("saved");

  function updateToolbarState() {
    boldActive = editor.isActive("bold");
  }

  function scheduleSave() {
    clearTimeout(saveTimeout);

    saveTimeout = setTimeout(async () => {
      saveStatus = "saving";

      if (!onSave) return;

      saveStatus = "saving";

     try {
      await onSave(ydoc);
      saveStatus = "saved";
    } catch {
      saveStatus = "error";
    }

    }, 500);
  }

  onMount(() => {
    editor = new TiptapEditor({
      element: editorElement,

      extensions: [
        StarterKit.configure({
          undoRedo: false,
        }),

        Collaboration.configure({
          document: ydoc,
        }),
      ],

      onUpdate: ({ editor }) => {
        boldActive = editor.isActive("bold");
        if (ydoc && onSave) {
          scheduleSave();
        }
      },

      onSelectionUpdate: ({ editor }) => {
        boldActive = editor.isActive("bold");
      },
    });

    return () => {
      clearTimeout(saveTimeout);
      editor.destroy();
    };
  });

  function toggleBold() {
    editor.chain().focus().toggleBold().run();
    updateToolbarState();
  }
</script>

<div>
  <button
    type="button"
    onclick={toggleBold}
    aria-label="Gras"
    aria-pressed={boldActive}
  >
    Gras
  </button>
  
  {#if saveStatus === "saving"}
  <span>Enregistrement…</span>
{:else if saveStatus === "error"}
  <span>Erreur d'enregistrement</span>
{:else}
  <span>Enregistré</span>
{/if}

  <div bind:this={editorElement} aria-label="Éditeur de document"></div>
</div>
