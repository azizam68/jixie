<script lang="ts">
    import { onMount } from "svelte";
    import * as Y from "yjs";
    import { createClient } from "@supabase/supabase-js";

    import Editor from "$lib/Editor.svelte";
    import { SupabaseConfigService } from "$lib/services/SupabaseConfigService";
    import { DocumentRepository } from "$lib/repositories/DocumentRepository";
    import { DocumentService } from "$lib/services/DocumentService";

    let { data } = $props();

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

        ydoc = await documentService.load(data.documentId);
    });
</script>

<p><a href="/">Jixie home</a> > Document : {data.documentId}</p>

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