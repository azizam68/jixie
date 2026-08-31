<script lang="ts">
	import type { IDocumentListItem } from "$lib/repositories/IDocumentRepository";

	let {
		documents,
		onSelect,
	}: {
		documents: IDocumentListItem[];
		onSelect: (title: string) => void;
	} = $props();
</script>

{#if documents.length === 0}
			<p>Aucun document</p>
		{:else}
<div id="document-list">
	<div id="document-list-header">Liste des documents</div>
	<div id="document-list-content">
		
			<form>
				{#each documents as document}
					<div id="document-list-item">
						<input type="checkbox" />
						<button
							onclick={() => onSelect(document.id)}
							type="button">open</button
						>
						{document.title || document.id}
					</div>
				{/each}
				<div id="document-list-actions">
				<button
					type="button"
					onclick={(e) => {
						e.preventDefault();
					}}>Delete</button
				>
				{#if documents.length === 1}
					<span>1 document</span>
				{:else}
					<span>{documents.length} documents</span>
				{/if}
				</div>
			</form>
	</div>
</div>
		{/if}

<style>
	#document-list{
		border: 1px solid #ccc;
		padding: 0px;
	}

	#document-list-header {
		border: 1px solid #999;
		background-color: #f0f0f0;
		padding: 10px;
	}

	#document-list-actions {
		border: 1px solid #999;
		background-color: #f0f0f0;
		padding: 10px;
	}

	#document-list-item {
		cursor: pointer;
		padding: 5px;
	}

	#document-list-item:hover {
		background-color: #eee;
	}
</style>
