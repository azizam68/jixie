import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import Counter from './Counter.svelte';

test('affiche le compteur', () => {
	render(Counter);

	expect(screen.getByText('Compteur : 0')).toBeInTheDocument();
});

test('incrémente le compteur', async () => {
	const user = userEvent.setup();

	render(Counter);

	const button = screen.getByRole('button', {
		name: 'Incrémenter'
	});

	await user.click(button);

	expect(screen.getByText('Compteur : 1')).toBeInTheDocument();
});