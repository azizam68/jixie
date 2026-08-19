<script lang="ts">
  import type { IDocumentListItem } from "$lib/repositories/IDocumentRepository";


	let { documents, onSelect }: { documents: IDocumentListItem[]; onSelect: (id: number) => void } = $props();
</script>

{#if documents.length === 0}
	<p>Aucun document</p>
{:else}
{#each documents as document}
	<div onclick={() => onSelect(document.title)}>{document.title}</div>
{/each}
{/if}