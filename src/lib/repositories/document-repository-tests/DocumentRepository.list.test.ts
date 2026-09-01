import { describe, it, expect } from "vitest";
import { createTestRepository } from "./DocumentRepository.test-utils";

describe("DocumentRepository : liste des documents", () => {
    const { repository, trackDocument } = createTestRepository();

    it("retourne un tableau", async () => {
        const documents = await repository.list();

        expect(documents).toBeInstanceOf(Array);
    });

    it("n'inclut pas les documents supprimés par défaut", async () => {
        const documentId = trackDocument(await repository.create());
        await repository.delete(documentId);

        const documents = await repository.list();

        expect(documents.find((doc) => doc.id === documentId)).toBeUndefined();
    });

    // Note : list() applique .limit(10) trié par updated_at. Si plus de 10
    // documents actifs+supprimés existent déjà sur l'instance testée, ce
    // document pourrait être hors de la fenêtre retournée et le test
    // deviendrait flaky. Le nettoyage via trackDocument() dans les autres
    // suites limite ce risque mais ne l'élimine pas pour des données déjà
    // présentes avant la mise en place de ce nettoyage.
    it("inclut les documents supprimés quand includeTrash est true", async () => {
        const documentId = trackDocument(await repository.create());
        await repository.delete(documentId);

        const documents = await repository.list(true);
        const found = documents.find((doc) => doc.id === documentId);

        expect(found).toBeDefined();
        expect(found?.deletedAt).not.toBeNull();
    });

    it("expose deletedAt à null pour un document actif", async () => {
        const documentId = trackDocument(await repository.create());

        const documents = await repository.list(true);
        const found = documents.find((doc) => doc.id === documentId);

        expect(found?.deletedAt).toBeNull();
    });
});
