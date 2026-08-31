import { describe, it, expect } from "vitest";
import * as Y from "yjs";
import { createTestRepository, supabase } from "./DocumentRepository.test-utils";

describe("DocumentRepository : création", () => {
    const { repository, trackDocument } = createTestRepository();

    it("crée un nouveau document", async () => {
        const documentId = trackDocument(await repository.create());

        expect(documentId).toBeTruthy();

        const { data, error } = await supabase
            .from("documents")
            .select("id")
            .eq("id", documentId)
            .single();

        expect(error).toBeNull();
        expect(data?.id).toBe(documentId);
    });

    it("crée un document immédiatement chargeable", async () => {
        const documentId = trackDocument(await repository.create());

        const loaded = await repository.load(documentId);

        expect(loaded).toBeInstanceOf(Y.Doc);
    });
});
