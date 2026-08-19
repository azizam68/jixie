<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { createClient } from "@supabase/supabase-js";
  import { SupabaseConfigService } from "$lib/services/SupabaseConfigService";
  import { DocumentRepository } from "$lib/repositories/DocumentRepository";
  import type { IDocumentListItem } from "$lib/repositories/IDocumentRepository";
  import { DocumentService } from "$lib/services/DocumentService";
	import DocumentList from '$lib/DocumentList.svelte';
import { onMount } from "svelte";

  const supabaseConfigService = new SupabaseConfigService();
  let url = $state("");
  let key = $state("");
  let documents = $state<IDocumentListItem[]>([]);
  let lastDocumentId = $state<string | null>(null);

  async function loadDocumentList(){
    if (!url || !key) return;

    const supabase = createClient(url, key);
    const repository = new DocumentRepository(supabase);
    const documentService = new DocumentService(repository);

    documents = await documentService.list() || [];
  }


onMount(() => {
    if (!browser) return;

    const config = supabaseConfigService.load();
    url = config?.url ?? "";
    key = config?.key ?? "";
    lastDocumentId = localStorage.getItem("jixie.lastDocumentId");
    if(url!="" && key!="")
      loadDocumentList();
  });
  async function saveConfig() {
    supabaseConfigService.save({
      url,
      key,
    });
  }
  function clearConfig() {
    supabaseConfigService.clear();
  }

  async function createDocument() {
    if (!url || !key) return;
    if (url=="" || key==="") return;

    const supabase = createClient(url, key);

    const repository = new DocumentRepository(supabase);
    const documentService = new DocumentService(repository);

    const documentId = await documentService.create();

    localStorage.setItem("jixie.lastDocumentId", documentId);

    await goto(`/documents/${documentId}`);
  }
</script>

<h1>Welcome to Jixie</h1>
<form
  onsubmit={async (event) => {
    event.preventDefault();
    await saveConfig();
    await loadDocumentList();
  }}
>
  <p>
    <label for="supabase-url">URL Supabase</label>
  </p>

  <input type="text" id="supabase-url" name="supabase-url" bind:value={url} />

  <p>
    <label for="supabase-key">Clé Supabase</label>
  </p>

  <input
    type="password"
    id="supabase-key"
    name="supabase-key"
    bind:value={key}
  />

  <button type="submit"> Enregistrer </button>
  <button type="button" onclick={clearConfig}> Effacer </button>
</form>
{#if url && key}
<div>
<div>
{#if lastDocumentId}
  <a href={`/documents/${lastDocumentId}`}> Continuer mon document </a>
{/if}
  <button type="button" onclick={createDocument}> Nouveau document </button>
</div>
<DocumentList documents={documents} onSelect={(title) => goto(`/documents/${title}`)} />
</div>
{/if}
