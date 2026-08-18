<script lang="ts">
  import { browser } from "$app/environment";
  import { SupabaseConfigService } from "$lib/services/SupabaseConfigService";

  const supabaseConfigService = new SupabaseConfigService();
let url = $state("");
    let key = $state("");

    $effect(() => {
        if (!browser) return;

        const config = supabaseConfigService.load();

        url = config?.url ?? "";
        key = config?.key ?? "";
    });
  function saveConfig() {
    supabaseConfigService.save({
      url,
      key,
    });
  }
  function clearConfig() {
    supabaseConfigService.clear();
  }
</script>

<h1>Welcome to Jixie</h1>
<form
  onsubmit={(event) => {
    event.preventDefault();
    saveConfig();
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
