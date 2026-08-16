<script lang="ts">
    import { onMount } from "svelte";
    import * as Y from "yjs";

    import Editor from "$lib/Editor.svelte";
    import { DocumentRepository } from "$lib/repositories/DocumentRepository";
    import { DocumentService } from "$lib/services/DocumentService";

    let { data } = $props();

    const repository = new DocumentRepository();
    const documentService = new DocumentService(repository);

    let ydoc: Y.Doc | undefined = $state();

    onMount(async () => {
        ydoc = await documentService.load(data.documentId);
    });
</script>

<h1>Welcome to Jixie</h1>
<p>Document : {data.documentId}</p>

{#if ydoc}
    <Editor
        {ydoc}
        documentId={data.documentId}
        onSave={(ydoc) => documentService.save(data.documentId, ydoc)}
    />
{:else}
    <p>Chargement du document…</p>
{/if}