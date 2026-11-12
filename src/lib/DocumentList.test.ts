import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import DocumentList from './DocumentList.svelte';
import userEvent from '@testing-library/user-event';

const doc1 = { id: '88888888-8888-8888-8888-888888888888', title: 'Doc 1', deletedAt: null };
const doc2 = { id: '99999999-9999-9999-9999-999999999999', title: 'Doc 2', deletedAt: null };

describe('DocumentList', () => {
	it('T01 affiche les documents', () => {
		render(DocumentList, { props: { documents: [doc1, doc2], onSelect: vi.fn(), onDelete: vi.fn() } });
		expect(screen.getByText('Doc 1')).toBeInTheDocument();
		expect(screen.getByText('Doc 2')).toBeInTheDocument();
	});

	it('T02 affiche un message quand il n’y a aucun document', () => {
		render(DocumentList, { props: { documents: [], onSelect: vi.fn(), onDelete: vi.fn() } });
		expect(screen.getByText('Aucun document')).toBeInTheDocument();
	});

	it('T03 permet de sélectionner un document', async () => {
		const onSelect = vi.fn();
		render(DocumentList, { props: { documents: [doc1], onSelect, onDelete: vi.fn() } });
		await userEvent.click(screen.getByRole('button', { name: 'open' }));
		expect(onSelect).toHaveBeenCalledWith(doc1.id);
	});

	it('T04 supprime les documents cochés', async () => {
		const onDelete = vi.fn();
		render(DocumentList, { props: { documents: [doc1, doc2], onSelect: vi.fn(), onDelete } });
		await userEvent.click(screen.getAllByRole('checkbox')[0]);
		await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
		expect(onDelete).toHaveBeenCalledWith([doc1.id]);
	});

	it('T05 désactive Delete quand rien n’est coché', () => {
		render(DocumentList, { props: { documents: [doc1], onSelect: vi.fn(), onDelete: vi.fn() } });
		expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
	});

	it('T06 affiche le compteur au singulier et au pluriel', () => {
		const { unmount } = render(DocumentList, { props: { documents: [doc1], onSelect: vi.fn(), onDelete: vi.fn() } });
		expect(screen.getByText('1 document')).toBeInTheDocument();
		unmount();
		render(DocumentList, { props: { documents: [doc1, doc2], onSelect: vi.fn(), onDelete: vi.fn() } });
		expect(screen.getByText('2 documents')).toBeInTheDocument();
	});

	it('T07 affiche l’identifiant quand le titre est vide', () => {
		render(DocumentList, { props: { documents: [{ ...doc1, title: '' }], onSelect: vi.fn(), onDelete: vi.fn() } });
		expect(screen.getByText(doc1.id)).toBeInTheDocument();
	});

	it('T08 affiche du HTML dans un titre comme du texte (XSS)', () => {
		const xss = { ...doc1, title: '<script>alert(1)</script>' };
		render(DocumentList, { props: { documents: [xss], onSelect: vi.fn(), onDelete: vi.fn() } });
		expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument();
	});
});