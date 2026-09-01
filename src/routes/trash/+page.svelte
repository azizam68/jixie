<script lang="ts">
  import { browser } from "$app/environment";
  import { createClient } from "@supabase/supabase-js";
  import { SupabaseConfigService } from "$lib/services/SupabaseConfigService";
  import { DocumentRepository } from "$lib/repositories/DocumentRepository";
  import type { IDocumentListItem } from "$lib/repositories/IDocumentRepository";
  import { DocumentService } from "$lib/services/DocumentService";
  import { onMount } from "svelte";

  const supabaseConfigService = new SupabaseConfigService();
  let url = $state("");
  let key = $state("");
  let trashedDocuments = $state<IDocumentListItem[]>([]);
  let isLoading = $state(true);
  let errorMessage = $state<string | null>(null);

  function getDocumentService(): DocumentService | null {
    if (!url || !key) return null;

    const supabase = createClient(url, key);
    const repository = new DocumentRepository(supabase);
    return new DocumentService(repository);
  }

  async function loadTrash() {
    const documentService = getDocumentService();
    if (!documentService) return;

    isLoading = true;
    errorMessage = null;

    try {
      trashedDocuments = await documentService.listTrash();
    } catch (error) {
      errorMessage = "Impossible de charger la corbeille.";
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    if (!browser) return;

    const config = supabaseConfigService.load();
    url = config?.url ?? "";
    key = config?.key ?? "";

    if (url && key) loadTrash();
    else isLoading = false;
  });

  async function restoreDocument(documentId: string) {
    const documentService = getDocumentService();
    if (!documentService) return;

    errorMessage = null;

    try {
      await documentService.restore(documentId);
      trashedDocuments = trashedDocuments.filter((doc) => doc.id !== documentId);
    } catch (error) {
      errorMessage = "Impossible de restaurer ce document.";
    }
  }

  async function permanentlyDeleteDocument(documentId: string, title: string) {
    const confirmed = confirm(
      `Supprimer définitivement « ${title || "ce document"} » ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    const documentService = getDocumentService();
    if (!documentService) return;

    errorMessage = null;

    try {
      await documentService.permanentlyDelete(documentId);
      trashedDocuments = trashedDocuments.filter((doc) => doc.id !== documentId);
    } catch (error) {
      errorMessage = "Impossible de supprimer définitivement ce document.";
    }
  }

  async function emptyTrash() {
    if (trashedDocuments.length === 0) return;

    const confirmed = confirm(
      `Vider la corbeille ? ${trashedDocuments.length} document(s) seront supprimés définitivement. Cette action est irréversible.`
    );
    if (!confirmed) return;

    const documentService = getDocumentService();
    if (!documentService) return;

    errorMessage = null;

    try {
      await documentService.emptyTrash();
      trashedDocuments = [];
    } catch (error) {
      errorMessage = "Impossible de vider la corbeille.";
    }
  }
</script>

<h1>Corbeille</h1>

{#if !url || !key}
  <p>Configure d'abord ta connexion Supabase depuis la page d'accueil.</p>
{:else if isLoading}
  <p>Chargement…</p>
{:else}
  {#if errorMessage}
    <p role="alert">{errorMessage}</p>
  {/if}

  {#if trashedDocuments.length === 0}
    <p>La corbeille est vide.</p>
  {:else}
    <p>
      <button type="button" onclick={emptyTrash}>
        Vider la corbeille ({trashedDocuments.length})
      </button>
    </p>

    <ul>
      {#each trashedDocuments as document (document.id)}
        <li>
          <span>{document.title || "Sans titre"}</span>
          <button type="button" onclick={() => restoreDocument(document.id)}>
            Restaurer
          </button>
          <button
            type="button"
            onclick={() => permanentlyDeleteDocument(document.id, document.title)}
          >
            Supprimer définitivement
          </button>
        </li>
      {/each}
    </ul>
  {/if}
{/if}
