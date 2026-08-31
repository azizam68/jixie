import { describe, it, expect } from "vitest";
import * as Y from "yjs";
import { createTestRepository, supabase } from "./DocumentRepository.test-utils";

describe("DocumentRepository : titre", () => {
    const { repository, trackDocument } = createTestRepository();

    it("retourne le titre confirmé en cas de succès", async () => {
        const documentId = trackDocument(crypto.randomUUID());
        await repository.save(documentId, new Y.Doc());

        const result = await repository.updateTitle(
            documentId,
            "New Title updated"
        );

        expect(result).toEqual({ title: "New Title updated" });

        const { data, error } = await supabase
            .from("documents")
            .select("title")
            .eq("id", documentId)
            .single();

        expect(error).toBeNull();
        expect(data?.title).toBe("New Title updated");
    });

    it("normalise un titre vide en chaîne vide", async () => {
        const documentId = trackDocument(crypto.randomUUID());
        await repository.save(documentId, new Y.Doc());

        const result = await repository.updateTitle(documentId, "");

        expect(result).toEqual({ title: "" });
    });

    it("lève une erreur si le document n'existe pas", async () => {
        // Jamais créé : rien à nettoyer, pas de trackDocument() ici.
        const documentId = crypto.randomUUID();

        await expect(repository.updateTitle(documentId, "Title")).rejects.toThrow(
            "Failed to update title for document " + documentId
        );
    });
});
