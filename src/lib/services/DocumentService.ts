import * as Y from "yjs";
import type { IDocumentListItem, IDocumentRepository } from "../repositories/IDocumentRepository";

export class DocumentService {
    constructor(private repository: IDocumentRepository) {}

    async list(): Promise<IDocumentListItem[]> {
		return this.repository.list();
	}
    async load(documentId: string): Promise<Y.Doc> {
        return this.repository.load(documentId);
    }

    async save(documentId: string, ydoc: Y.Doc): Promise<void> {
        await this.repository.save(documentId, ydoc);
    }

    async loadVersion(versionId: number): Promise<Y.Doc> {
        return this.repository.loadVersion(versionId);
    }

    async restoreVersion(
        documentId: string,
        versionId: number
    ): Promise<void> {
        await this.repository.restoreVersion(documentId, versionId);
    }

    async loadOrCreate(documentId: string): Promise<Y.Doc> {
        try {
            return await this.repository.load(documentId);
        } catch (error) {
            if (error instanceof Error && error.message === "Document introuvable") {
                const newDoc = new Y.Doc();
                return newDoc;
            }
            throw error;
        }
    }
    async create(): Promise<string> {
    return this.repository.create();
}
}