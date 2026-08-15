import * as Y from "yjs";

export class DocumentRepository {
  private documents = new Map<string, Uint8Array>();

  async save(id: string, ydoc: Y.Doc): Promise<void> {
    this.documents.set(id, Y.encodeStateAsUpdate(ydoc));
  }

  async load(id: string): Promise<Y.Doc> {
    const ydoc = new Y.Doc();
    const update = this.documents.get(id);

    if (update) {
      Y.applyUpdate(ydoc, update);
    }

    return ydoc;
  }
}