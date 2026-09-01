import { describe, it, expect } from "vitest";
import {
    createTestRepository,
    docWithText,
    supabase
} from "./DocumentRepository.test-utils";

describe("DocumentRepository : historique des versions", () => {
    const { repository, trackDocument } = createTestRepository();

    it("recharge une ancienne version du document", async () => {
        const documentId = trackDocument(crypto.randomUUID());

        await repository.save(documentId, docWithText("Bonjour"));

        const { data } = await supabase
            .from("document_versions")
            .select("id")
            .eq("document_id", documentId)
            .single();

        const loaded = await repository.loadVersion(data!.id);

        expect(loaded.getXmlFragment("prosemirror").toString()).toContain(
            "Bonjour"
        );
    });

    it("restaure une ancienne version comme nouvelle version", async () => {
        const documentId = trackDocument(crypto.randomUUID());

        await repository.save(documentId, docWithText("Version 1"));

        const { data: versions } = await supabase
            .from("document_versions")
            .select("id")
            .eq("document_id", documentId)
            .order("created_at", { ascending: true });

        await repository.restoreVersion(documentId, versions![0].id);

        const loaded = await repository.load(documentId);

        expect(loaded.getXmlFragment("prosemirror").toString()).toContain(
            "Version 1"
        );
    });
});
