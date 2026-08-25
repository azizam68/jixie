<script lang="ts">
    let { data } = $props();
    let editMode = $state(false);
</script>

{#if !editMode}
    {#if data.title}
        <span onclick={() => editMode = true }>{data.title}</span>
    {:else}
        <span onclick={() => editMode = true }>{data.documentId}</span>
    {/if}
{:else}
    <span>
        <form>
            <input type="text" value={data.title} />
            <button type="submit">Save</button>
            <button type="button" onclick={() => editMode = false }>Cancel</button>
        </form>
    </span>
{/if}