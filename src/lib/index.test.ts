import { describe, expect, it } from 'vitest';
import { addition } from './index';

describe('addition', () => {
	it('additionne deux nombres', () => {
		expect(addition(2, 3)).toBe(5);
	});
});