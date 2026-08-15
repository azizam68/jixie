import { describe, it, expect, vi } from 'vitest';
import * as Y from 'yjs';
import { DocumentService } from './DocumentService';

describe('DocumentService', () => {
    it('sauvegarde un document via le repository', async () => {
        const repository = {
            save: vi.fn()
        };

        const service = new DocumentService(repository);

        const ydoc = new Y.Doc();

        await service.save('document-1', ydoc);

        expect(repository.save).toHaveBeenCalledWith(
            'document-1',
            ydoc
        );
    });
});