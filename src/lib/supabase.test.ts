import { describe, it, expect } from 'vitest';
import { supabase } from './supabase';

describe('Supabase', () => {
    it('se connecte à Supabase', async () => {
        const { error } = await supabase
            .from('documents')
            .select('id')
            .limit(1);

        expect(error).toBeNull();
    });
});