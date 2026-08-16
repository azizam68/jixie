import { describe, it, expect, vi } from 'vitest';
import * as Y from 'yjs';
import { DocumentService } from './DocumentService';
import type { DocumentRepository } from '$lib/repositories/DocumentRepository';

const mockRepository: DocumentRepository = {
  save: vi.fn(),
  load: vi.fn().mockResolvedValue(null),
  //delete: vi.fn().mockResolvedValue(undefined),
  //list: vi.fn().mockResolvedValue([]),
};

describe('DocumentService', () => {
    it('sauvegarde un document via le repository', async () => {

        const service = new DocumentService(mockRepository);

        const ydoc = new Y.Doc();

        await service.save('document-1', ydoc);

        expect(mockRepository.save).toHaveBeenCalledWith(
            'document-1',
            ydoc
        );
    });
});