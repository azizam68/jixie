import { describe, it, expect } from "vitest";
import * as Y from "yjs";
import {
    createTestRepository,
    docWithText,
    supabase
} from "./DocumentRepository.test-utils";

describe("DocumentRepository : sauvegarde et chargement", () => {
    const { repository, trackDocument } = createTestRepository();

    it("sauvegarde et recharge le contenu d'un document Yjs", async () => {
        const documentId = trackDocument(crypto.randomUUID());

        await repository.save(documentId, docWithText("Hello World"));
        const loaded = await repository.load(documentId);

        expect(loaded.getXmlFragment("prosemirror").toString()).toContain(
            "Hello World"
        );
    });

    it("sauvegarde réellement le document dans Supabase", async () => {
        const documentId = trackDocument(crypto.randomUUID());

        await repository.save(documentId, new Y.Doc());

        const { data, error } = await supabase
            .from("documents")
            .select("id")
            .eq("id", documentId)
            .single();

        expect(error).toBeNull();
        expect(data?.id).toBe(documentId);
    });

    it("crée une version du document lors de la sauvegarde", async () => {
        const documentId = trackDocument(crypto.randomUUID());

        await repository.save(documentId, new Y.Doc());

        const { data, error } = await supabase
            .from("document_versions")
            .select("id, document_id, content")
            .eq("document_id", documentId);

        expect(error).toBeNull();
        expect(data).toHaveLength(1);
        expect(data?.[0].document_id).toBe(documentId);
        expect(data?.[0].content).toBeTruthy();
    });

    it("conserve plusieurs versions d'un document", async () => {
        const documentId = trackDocument(crypto.randomUUID());
        const ydoc = docWithText("Bonjour");

        await repository.save(documentId, ydoc);

        ydoc.getXmlFragment("prosemirror").insert(1, [new Y.XmlText(" Jixie")]);
        await repository.save(documentId, ydoc);

        const { data, error } = await supabase
            .from("document_versions")
            .select("id, document_id, content, created_at")
            .eq("document_id", documentId)
            .order("created_at", { ascending: true });

        expect(error).toBeNull();
        expect(data).toHaveLength(2);
        expect(data?.[0].document_id).toBe(documentId);
        expect(data?.[1].document_id).toBe(documentId);
        expect(data?.[0].content).not.toBe(data?.[1].content);
    });

    it("charge la dernière version du document", async () => {
        const documentId = trackDocument(crypto.randomUUID());

        await repository.save(documentId, docWithText("Version 1"));
        await repository.save(documentId, docWithText("Version 2"));

        const loaded = await repository.load(documentId);

        expect(loaded.getXmlFragment("prosemirror").toString()).toContain(
            "Version 2"
        );
    });
});
