import type * as Y from "yjs";

export interface IDocumentListItem {
    id: string;
    title: string;
    deletedAt: string | null;
}

export interface IDocumentRepository {
    create(): Promise<string>;
    save(id: string, ydoc: Y.Doc): Promise<void>;
    load(id: string): Promise<Y.Doc>;
    list(includeTrash?: boolean): Promise<IDocumentListItem[]>;
    getTitle(id: string): Promise<{ title: string }>;
    updateTitle(id: string, title: string): Promise<{ title: string }>;
    loadVersion(versionId: string): Promise<Y.Doc>;
    restoreVersion(
        documentId: string,
        versionId: string
    ): Promise<void>;

    // Corbeille
    delete(id: string): Promise<void>;
    restore(id: string): Promise<void>;
    permanentlyDelete(id: string): Promise<void>;
    emptyTrash(): Promise<void>;
}