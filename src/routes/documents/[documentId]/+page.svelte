<script lang="ts">
    import { onMount } from "svelte";
    import * as Y from "yjs";
    import { createClient } from "@supabase/supabase-js";

    import Editor from "$lib/Editor.svelte";
    import DocumentTitle from "$lib/DocumentTitle.svelte";
    import { SupabaseConfigService } from "$lib/services/SupabaseConfigService";
    import { DocumentRepository } from "$lib/repositories/DocumentRepository";
    import { DocumentService } from "$lib/services/DocumentService";

    let { data } = $props();
    let titleIsReady = $state(false);

    let ydoc: Y.Doc | undefined = $state();

    let documentService: DocumentService | undefined = $state();

    onMount(async () => {
        const configService = new SupabaseConfigService();
        const config = configService.load();

        if (!config) {
            console.error("Configuration Supabase absente");
            return;
        }

        const supabase = createClient(
            config.url,
            config.key
        );

        const repository = new DocumentRepository(supabase);

        documentService = new DocumentService(repository);
        let res = await documentService.getDocumentTitle(data.documentId);
        data.title = res.title;
        titleIsReady = true;
        ydoc = await documentService.load(data.documentId);
    });
</script>

{#if titleIsReady}
    <p style="display:flex; flex-direction:row; gap: 0.5rem; align-items:center;">
        <a href="/">Jixie home</a> >
        <DocumentTitle {data} onTitleSave={(id, title) => documentService!.updateDocumentTitle(id, title)} />
    </p>
{/if}
{#if ydoc && documentService}
    <Editor
        {ydoc}
        documentId={data.documentId}
        onSave={(ydoc) =>
            documentService!.save(data.documentId, ydoc)
        }
    />
{:else}
    <p>Chargement du document…</p>
{/if}