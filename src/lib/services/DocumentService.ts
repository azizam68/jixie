import type * as Y from 'yjs';
import type { DocumentRepository } from '../repositories/DocumentRepository';

export class DocumentService {
    constructor(private repository: DocumentRepository) {}

    async save(id: string, ydoc: Y.Doc): Promise<void> {
        await this.repository.save(id, ydoc);
    }
}