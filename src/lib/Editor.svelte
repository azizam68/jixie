<script lang="ts">
    import { onMount } from 'svelte';
    import { Editor as TiptapEditor } from '@tiptap/core';
    import StarterKit from '@tiptap/starter-kit';

    let {
        content = '',
        onchange
    }: {
        content?: string;
        onchange?: (value: string) => void;
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
            extensions: [StarterKit],
            content,

            onUpdate: ({ editor }) => {
                onchange?.(editor.getHTML());
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