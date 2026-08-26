import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import DocumentList from './DocumentList.svelte';

import userEvent from "@testing-library/user-event";
describe('DocumentList', () => {
	it('affiche les documents', () => {
		const documents = [
			{
				id: "88888888-8888-8888-8888-888888888888",
				title: 'Mon premier document',
			},
			{
				id: "99999999-9999-9999-9999-999999999999",
				title: 'Mon deuxième document',
			},
		];
		const onSelect = vi.fn();
		render(DocumentList, { documents, onSelect });

		expect(screen.getByText('Mon premier document')).toBeInTheDocument();
		expect(screen.getByText('Mon deuxième document')).toBeInTheDocument();
	});
	it('affiche un message lorsqu’il n’y a aucun document', () => {

		const onSelect = vi.fn();
		render(DocumentList, { documents: [], onSelect });

		expect(
			screen.getByText('Aucun document')
		).toBeInTheDocument();
	});
	it('permet de sélectionner un document', async () => {
		const onSelect = vi.fn();
		const documents = [{ id: "88888888-8888-8888-8888-888888888888", title: 'Mon document' }];

		render(DocumentList, {
			props: { documents, onSelect }
		});

		const button = screen.getByRole('button', { name: 'open' });
		await userEvent.click(button);

		expect(onSelect).toHaveBeenCalledWith('88888888-8888-8888-8888-888888888888');
	});
});