import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import Page from "./+page.svelte";
import userEvent from "@testing-library/user-event";

describe("Homepage", () => {

    const storage = new Map<string, string>();

    const localStorageMock = {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),

        setItem: vi.fn((key: string, value: string) => {
            storage.set(key, value);
        }),

        removeItem: vi.fn((key: string) => {
            storage.delete(key);
        }),

        clear: vi.fn(() => {
            storage.clear();
        }),
    };

    beforeEach(() => {
        storage.clear();
        vi.clearAllMocks();
        vi.stubGlobal("localStorage", localStorageMock);
    });

    it("affiche les champs de configuration Supabase", () => {
        render(Page, {});

        expect(
            screen.getByLabelText("URL Supabase")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Clé Supabase")
        ).toBeInTheDocument();
    });

    it("enregistre la configuration Supabase", async () => {
        const user = userEvent.setup();

        render(Page);

        const urlInput = screen.getByLabelText("URL Supabase");
        const keyInput = screen.getByLabelText("Clé Supabase");

        await user.type(
            urlInput,
            "https://example.supabase.co"
        );

        await user.type(
            keyInput,
            "ma-cle-supabase"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Enregistrer"
            })
        );

        expect(localStorage.getItem("supabase.url"))
            .toBe("https://example.supabase.co");

        expect(localStorage.getItem("supabase.key"))
            .toBe("ma-cle-supabase");
    });
it("efface la configuration Supabase", async () => {
    const user = userEvent.setup();

    localStorage.setItem(
        "supabase.url",
        "https://example.supabase.co"
    );

    localStorage.setItem(
        "supabase.key",
        "ma-cle-supabase"
    );

    render(Page);

    await user.click(
        screen.getByRole("button", {
            name: "Effacer"
        })
    );

    expect(localStorage.getItem("supabase.url"))
        .toBeNull();

    expect(localStorage.getItem("supabase.key"))
        .toBeNull();
});
it("charge la configuration Supabase existante", () => {
    localStorage.setItem(
        "supabase.url",
        "https://example.supabase.co"
    );

    localStorage.setItem(
        "supabase.key",
        "ma-cle-supabase"
    );

    render(Page);

    expect(
        screen.getByLabelText("URL Supabase")
    ).toHaveValue("https://example.supabase.co");

    expect(
        screen.getByLabelText("Clé Supabase")
    ).toHaveValue("ma-cle-supabase");
});
});