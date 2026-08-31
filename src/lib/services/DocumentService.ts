import * as Y from "yjs";
import type { IDocumentListItem, IDocumentRepository } from "../repositories/IDocumentRepository";


const MAX_TITLE_LENGTH = 255; // à ajuster selon ton besoin

export class TitleTooLongError extends Error {
    constructor(maxLength: number) {
        super(`Title exceeds maximum length of ${maxLength} characters`);
        this.name = "TitleTooLongError";
    }
}

export class DocumentService {
    constructor(private repository: IDocumentRepository) { }

    async list(includeTrash?: boolean | undefined): Promise<IDocumentListItem[]> {
        return this.repository.list(includeTrash);
    }

    async load(documentId: string): Promise<Y.Doc> {
        return this.repository.load(documentId);
    }

    async save(documentId: string, ydoc: Y.Doc): Promise<void> {
        await this.repository.save(documentId, ydoc);
    }

    async delete(documentId: string): Promise<void> {
        await this.repository.delete(documentId);
    }

    async loadVersion(versionId: string): Promise<Y.Doc> {
        return this.repository.loadVersion(versionId);
    }

    async restoreVersion(
        documentId: string,
        versionId: string
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

    async getDocumentTitle(documentId: string): Promise<{ title: string }> {
        return  this.repository.getTitle(documentId);
    }

    async updateDocumentTitle(id: string, title: string): Promise<{ title: string }> {
        if (title.length > MAX_TITLE_LENGTH) {
            throw new TitleTooLongError(MAX_TITLE_LENGTH);
        }

        return this.repository.updateTitle(id, title);
    }
}