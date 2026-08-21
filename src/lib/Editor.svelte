<script lang="ts">
  import { onMount } from "svelte";
  import { Editor as TiptapEditor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import * as Y from "yjs";
  import Collaboration from "@tiptap/extension-collaboration";

  let {
    ydoc,
    documentId,
    onSave,
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

<div id="editor-container">
  <div id="editor-toolbar">
    <button
      type="button"
      onclick={toggleBold}
      aria-label="Gras"
      aria-pressed={boldActive}
      >Gras
    </button>

    {#if saveStatus === "saving"}
      <span>Enregistrement…</span>
    {:else if saveStatus === "error"}
      <span>Erreur d'enregistrement</span>
    {:else}
      <span>Enregistré</span>
    {/if}
  </div>

  <div bind:this={editorElement} aria-label="Éditeur de document" style="border: none;"></div>
</div>

<style>
  #editor-container {
    min-height: 90dvh;
    min-width: 90vw;
    border: 1px solid black;
    margin: 0px;
    padding: 0px;
    position:relative;

    #editor-toolbar {
      position: sticky;
      display: flex;
      flex-direction: row;
      gap: 10px;
      top:0;
      border-bottom: 1px solid #999;
      background-color: #f0f0f0;
      z-index: 10;
      padding: 5px;
    }
    div[aria-label="Éditeur de document"] {
      padding: 5px;
      margin: 5px;  /* Pour l'éditeur Tiptap */

    }
  }
</style>
