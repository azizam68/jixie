import type * as Y from "yjs";

export interface IDocumentListItem {
    id: string;
    title: string;
}

export interface IDocumentRepository {
    save(id: string, ydoc: Y.Doc): Promise<void>;

    load(id: string): Promise<Y.Doc>;

    loadVersion(versionId: string): Promise<Y.Doc>;

    restoreVersion(
        documentId: string,
        versionId: string
    ): Promise<void>;

    create(): Promise<string>;

    list():Promise<IDocumentListItem[]>;

    getTitle(id: string): Promise<{ title: string }>;
    updateTitle(id: string, title: string): Promise<{ title: string }>;
}