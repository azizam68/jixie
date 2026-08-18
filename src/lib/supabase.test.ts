import { describe, expect, it } from "vitest";
import { createSupabaseClient } from "./supabase";

describe("createSupabaseClient", () => {
    it("crée un client Supabase avec la configuration fournie", () => {
        const client = createSupabaseClient(
            "https://example.supabase.co",
            "ma-cle-supabase"
        );

        expect(client).toBeDefined();
    });
});