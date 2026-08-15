<script lang="ts">
    import { onMount } from 'svelte';
    import { Editor as TiptapEditor } from '@tiptap/core';
    import StarterKit from '@tiptap/starter-kit';
    import * as Y from 'yjs';
import Collaboration from '@tiptap/extension-collaboration';

let {
    ydoc
}: {
    ydoc: Y.Doc;
} = $props();

    
    let editorElement: HTMLDivElement;
    let editor: TiptapEditor;

    let boldActive = $state(false);

    function updateToolbarState() {
        boldActive = editor.isActive('bold');
    }
    onMount(() => {
    editor = new TiptapEditor({
        element: editorElement,

        extensions: [
            StarterKit.configure({
                undoRedo: false
            }),

            Collaboration.configure({
                document: ydoc
            })
        ],

        onUpdate: ({ editor }) => {
            boldActive = editor.isActive('bold');
        },

        onSelectionUpdate: ({ editor }) => {
            boldActive = editor.isActive('bold');
        }
    });

    return () => {
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

    <div
        bind:this={editorElement}
        aria-label="Éditeur de document"
    ></div>
</div>