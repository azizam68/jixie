import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import DocumentList from './DocumentList.svelte';

import userEvent from "@testing-library/user-event";
describe('DocumentList', () => {
	it('affiche les documents', () => {
		const documents = [
			{
				id: 1,
				title: 'Mon premier document',
			},
			{
				id: 2,
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
		render(DocumentList, { documents:[], onSelect });

	expect(
		screen.getByText('Aucun document')
	).toBeInTheDocument();
});
it('permet de sélectionner un document', async () => {
	const documents = [
		{
			id: 42,
			title: 'Mon document',
		},
	];

	const onSelect = vi.fn();

	render(DocumentList, {
		documents,
		onSelect,
	});

	const document = screen.getByText('Mon document');

	await userEvent.click(document);

	expect(onSelect).toHaveBeenCalledWith("Mon document");
});
});