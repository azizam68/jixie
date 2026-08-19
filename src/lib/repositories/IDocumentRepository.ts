import type * as Y from "yjs";

export interface IDocumentListItem {
    id: Number;
    title: string;
}

export interface IDocumentRepository {
    save(id: string, ydoc: Y.Doc): Promise<void>;

    load(id: string): Promise<Y.Doc>;

    loadVersion(versionId: number): Promise<Y.Doc>;

    restoreVersion(
        documentId: string,
        versionId: number
    ): Promise<void>;

    create(): Promise<string>;

    list():Promise<IDocumentListItem[]>;
}