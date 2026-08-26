<script lang="ts">
    let {
        data,
        onTitleSave,
    }: {
        data: { title: string; documentId: string };
        onTitleSave?: (documentId: string, title: string) => Promise<{ title: string }>;
    } = $props();

    let editMode = $state(false);
    let saving = $state(false);
    let error = $state<string | null>(null);
    let editedTitle = $state(data.title);

    function enterEditMode() {
        editedTitle = data.title;
        error = null;
        editMode = true;
    }

    function cancel() {
        editedTitle = data.title;
        error = null;
        editMode = false;
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        if (!onTitleSave) return;

        saving = true;
        error = null;
        try {
            const result = await onTitleSave(data.documentId, editedTitle);
            data.title = result.title;
            editMode = false;
        } catch (e) {
            error = "La sauvegarde a échoué";
        } finally {
            saving = false;
        }
    }
</script>

{#if !editMode}
    <button type="button" class="link-like" onclick={enterEditMode}>
        {data.title || data.documentId}
    </button>
{:else}
    <form onsubmit={handleSubmit}>
        <input type="text" bind:value={editedTitle} disabled={saving} />
        <button type="submit" disabled={saving}>Save</button>
        <button type="button" onclick={cancel} disabled={saving}>Cancel</button>
        {#if error}<p role="alert">{error}</p>{/if}
    </form>
{/if}