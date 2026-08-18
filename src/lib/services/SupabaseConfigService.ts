export class SupabaseConfigService {
    clear(): void {
        localStorage.removeItem("supabase.url");
        localStorage.removeItem("supabase.key");
        localStorage.clear()
    }
    save(config: { url: string; key: string }): void {
        localStorage.setItem("supabase.url", config.url);
        localStorage.setItem("supabase.key", config.key);
    }
    load(): { url: string; key: string } | null {
    const url = localStorage.getItem("supabase.url");
    const key = localStorage.getItem("supabase.key");

    if (!url || !key) {
        return null;
    }

    return {
        url,
        key,
    };
}
}