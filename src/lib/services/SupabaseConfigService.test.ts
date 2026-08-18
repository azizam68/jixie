import { beforeEach, describe, expect, it, vi } from "vitest";
import { SupabaseConfigService } from "./SupabaseConfigService";

describe("SupabaseConfigService", () => {
    const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("localStorage", localStorageMock);
    });

    it("enregistre les configurations Supabase dans le localStorage", () => {
        const service = new SupabaseConfigService();

        service.save({
            url: "https://example.supabase.co",
            key: "ma-cle-supabase",
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "supabase.url",
            "https://example.supabase.co"
        );

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "supabase.key",
            "ma-cle-supabase"
        );
    });

    it("charge les configurations Supabase depuis le localStorage", () => {
        const service = new SupabaseConfigService();

        localStorageMock.getItem.mockImplementation((key) => {
            if (key === "supabase.url") {
                return "https://example.supabase.co";
            }

            if (key === "supabase.key") {
                return "ma-cle-supabase";
            }

            return null;
        });

        const config = service.load();

        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.url");
        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.key");

        expect(config).toEqual({
            url: "https://example.supabase.co",
            key: "ma-cle-supabase",
        });
    });

    it("retourne null si les configurations Supabase ne sont pas présentes dans le localStorage", () => {
        const service = new SupabaseConfigService();

        localStorageMock.getItem.mockReturnValue(null);

        const config = service.load();

        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.url");
        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.key");

        expect(config).toBeNull();
    }); 

    it("retourne null si l'URL est présente mais pas la clé", () => {
        const service = new SupabaseConfigService();

        localStorageMock.getItem.mockImplementation((key) => {
            if (key === "supabase.url") {
                return "https://example.supabase.co";
            }

            if (key === "supabase.key") {
                return null;
            }

            return null;
        });

        const config = service.load();

        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.url");
        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.key");

        expect(config).toBeNull();
    });

    it("retourne null si la clé est présente mais pas l'URL", () => {
        const service = new SupabaseConfigService();

        localStorageMock.getItem.mockImplementation((key) => {
            if (key === "supabase.url") {
                return null;
            }

            if (key === "supabase.key") {
                return "ma-cle-supabase";
            }

            return null;
        });

        const config = service.load();

        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.url");
        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.key");

        expect(config).toBeNull();
    });
    it("retourne null si les deux valeurs sont absentes", () => {
        const service = new SupabaseConfigService();

        localStorageMock.getItem.mockReturnValue(null);

        const config = service.load();

        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.url");
        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.key");

        expect(config).toBeNull();
    });
    it("retourne null si les deux valeurs sont des chaînes vides", () => {
        const service = new SupabaseConfigService();

        localStorageMock.getItem.mockImplementation((key) => {
            if (key === "supabase.url") {
                return "";
            }

            if (key === "supabase.key") {
                return "";
            }

            return null;
        }       );

        const config = service.load();

        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.url");
        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.key");

        expect(config).toBeNull();
    }); 
    it("retourne null si l'URL est une chaîne vide mais pas la clé", () => {
        const service = new SupabaseConfigService();

        localStorageMock.getItem.mockImplementation((key) => {
            if (key === "supabase.url") {
                return "";
            }

            if (key === "supabase.key") {
                return "ma-cle-supabase";
            }

            return null;
        });

        const config = service.load();

        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.url");
        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.key");

        expect(config).toBeNull();
    });
    it("retourne null si la clé est une chaîne vide mais pas l'URL", () => {
        const service = new SupabaseConfigService();

        localStorageMock.getItem.mockImplementation((key) => {
            if (key === "supabase.url") {
                return "https://example.supabase.co";
            }

            if (key === "supabase.key") {
                return "";
            }

            return null;
        });

        const config = service.load();

        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.url");
        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.key");

        expect(config).toBeNull();
    });
    it("retourne null si l'URL est une chaîne vide et la clé est absente", () => {
        const service = new SupabaseConfigService();

        localStorageMock.getItem.mockImplementation((key) => {
            if (key === "supabase.url") {
                return "";
            }

            if (key === "supabase.key") {
                return null;
            }

            return null;
        });

        const config = service.load();

        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.url");
        expect(localStorageMock.getItem).toHaveBeenCalledWith("supabase.key");

        expect(config).toBeNull();
    }); 
    it("Efface le local storage si l'utilisateur le demande (via Clear())", () => {
        const service = new SupabaseConfigService();

        const config = service.clear();

        expect(localStorageMock.clear).toHaveBeenCalled();
        //expect(localStorageMock.removeItem).toHaveBeenCalledWith("supabase.key");
        //expect(localStorageMock.removeItem).toHaveBeenCalledWith("supabase.key");
    });
});