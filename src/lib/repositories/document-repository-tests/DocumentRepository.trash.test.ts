import { describe, it, expect } from "vitest";
import * as Y from "yjs";
import { DocumentRepository } from "../DocumentRepository";
import { createTestRepository, supabase } from "./DocumentRepository.test-utils";

describe("DocumentRepository : corbeille", () => {
    const { repository, trackDocument } = createTestRepository();

    it("delete() marque le document comme supprimé", async () => {
        const documentId = trackDocument(await repository.create());

        await repository.delete(documentId);

        const { data } = await supabase
            .from("documents")
            .select("deleted_at")
            .eq("id", documentId)
            .single();

        expect(data?.deleted_at).not.toBeNull();
    });

    it("restore() réinitialise deleted_at à null", async () => {
        const documentId = trackDocument(await repository.create());
        await repository.delete(documentId);

        await repository.restore(documentId);

        const { data } = await supabase
            .from("documents")
            .select("deleted_at")
            .eq("id", documentId)
            .single();

        expect(data?.deleted_at).toBeNull();
    });

    it("permanentlyDelete() supprime le document et son historique de versions", async () => {
        // Pas de trackDocument() : c'est justement l'opération testée qui
        // nettoie ; le afterEach retentera un permanentlyDelete() sur un id
        // déjà supprimé, ce qui échoue silencieusement (voir test-utils).
        const documentId = await repository.create();

        await repository.permanentlyDelete(documentId);

        const { data: document } = await supabase
            .from("documents")
            .select("id")
            .eq("id", documentId)
            .maybeSingle();
        const { data: versions } = await supabase
            .from("document_versions")
            .select("id")
            .eq("document_id", documentId);

        expect(document).toBeNull();
        expect(versions).toHaveLength(0);
    });

    /**
     * load, save, getTitle et updateTitle partagent le même contrat vis-à-vis
     * de la corbeille : ils doivent échouer tant que le document n'a pas été
     * restauré. Plutôt que dupliquer 4 fois le même scénario, on le décrit
     * une fois et on le fait tourner pour chaque méthode (même approche que
     * pour les marks gras/italic/underline de Editor.formatting.test.ts).
     */
    const blockedOperations: Array<{
        name: string;
        run: (repo: DocumentRepository, id: string) => Promise<unknown>;
    }> = [
        { name: "load", run: (repo, id) => repo.load(id) },
        { name: "save", run: (repo, id) => repo.save(id, new Y.Doc()) },
        { name: "getTitle", run: (repo, id) => repo.getTitle(id) },
        {
            name: "updateTitle",
            run: (repo, id) => repo.updateTitle(id, "Nouveau titre")
        }
    ];

    describe.each(blockedOperations)(
        "$name sur un document dans la corbeille",
        ({ run }) => {
            it("échoue tant que le document n'a pas été restauré", async () => {
                const documentId = trackDocument(await repository.create());
                await repository.delete(documentId);

                await expect(run(repository, documentId)).rejects.toThrow(
                    "in trash"
                );
            });
        }
    );

    it("redevient accessible après restore()", async () => {
        const documentId = trackDocument(await repository.create());
        await repository.delete(documentId);
        await repository.restore(documentId);

        await expect(repository.load(documentId)).resolves.toBeInstanceOf(Y.Doc);
    });

    // emptyTrash() supprime TOUS les documents de la corbeille, pas
    // seulement ceux créés par ce test. Comme seuls les développeurs (local
    // ou CI) lancent cette suite, il suffit de ne pas exécuter les tests
    // contre un projet Supabase contenant de vraies données à conserver.
    describe("emptyTrash()", () => {
        it("supprime tous les documents de la corbeille", async () => {
            const keptId = trackDocument(await repository.create());
            const trashedId = await repository.create();
            await repository.delete(trashedId);

            await repository.emptyTrash();

            const { data } = await supabase
                .from("documents")
                .select("id")
                .in("id", [keptId, trashedId]);

            expect(data?.map((d) => d.id)).toEqual([keptId]);
        });
    });
});
