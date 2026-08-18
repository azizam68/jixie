import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";
import { DocumentService } from "./DocumentService";
import type { IDocumentRepository } from "../repositories/IDocumentRepository";

describe("DocumentService", () => {
    const repositoryMock: IDocumentRepository = {
        save: vi.fn(),
        load: vi.fn(),
        loadVersion: vi.fn(),
        restoreVersion: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('sauvegarde un document via le repository', async () => {

        const service = new DocumentService(repositoryMock);

        const ydoc = new Y.Doc();

        await service.save('document-1', ydoc);

        expect(repositoryMock.save).toHaveBeenCalledWith(
            'document-1',
            ydoc
        );
    });
    it("charge un document", async () => {
        const ydoc = new Y.Doc();

        vi.mocked(repositoryMock.load).mockResolvedValue(ydoc);

        const service = new DocumentService(repositoryMock);

        const documentId = crypto.randomUUID();

        const result = await service.load(documentId);

        expect(repositoryMock.load).toHaveBeenCalledWith(documentId);
        expect(result).toBe(ydoc);
    });
    it("crée un nouveau document lorsqu'il n'existe pas", async () => {
    const documentId = crypto.randomUUID();

    vi.mocked(repositoryMock.load).mockRejectedValue(
        new Error("Document introuvable")
    );

    const service = new DocumentService(repositoryMock);

    const ydoc = await service.loadOrCreate(documentId);

    expect(ydoc).toBeInstanceOf(Y.Doc);
    expect(repositoryMock.load).toHaveBeenCalledWith(documentId);
    expect(repositoryMock.save).not.toHaveBeenCalled();
});
});
