<script lang="ts">
  import type { IDocumentListItem } from "$lib/repositories/IDocumentRepository";
  
  let { documents, onSelect }: {
	documents: IDocumentListItem[]; onSelect: (title: string) => void
	} = $props();
</script>

{#if documents.length === 0}
	<p>Aucun document</p>
{:else}
{#each documents as document}
	<div><button onclick={() => onSelect(document.title)}>open</button> {document.title}</div>
{/each}
{/if}

<style>
  div {
	cursor: pointer;
	padding: 5px;
  }

  div:hover {
	background-color: #eee;
	text-decoration: underline;
  }
</style>