import { afterEach } from "vitest";
import * as Y from "yjs";
import { createSupabaseClient } from "../../supabase";
import {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
} from "$env/static/public";
import { DocumentRepository } from "../DocumentRepository";

export const supabase = createSupabaseClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Ces tests utilisent une vraie instance Supabase (pas de mock). Sans
 * nettoyage, chaque exécution laisse des lignes orphelines dans
 * `documents` et `document_versions`, ce qui finit par fausser list()
 * (limit 10, tri par updated_at) et ralentir la suite avec le temps.
 *
 * createTestRepository() fournit un repository et trackDocument() pour
 * enregistrer tout document créé pendant le test ; un afterEach() les
 * supprime définitivement (permanentlyDelete supprime la ligne quel
 * que soit son état : actif ou déjà dans la corbeille).
 */
export function createTestRepository() {
    const repository = new DocumentRepository(supabase);
    const createdIds: string[] = [];

    function trackDocument(id: string): string {
        createdIds.push(id);
        return id;
    }

    afterEach(async () => {
        for (const id of createdIds) {
            await repository.permanentlyDelete(id).catch(() => {
                // On ignore les erreurs de nettoyage (ex: le test a déjà
                // supprimé le document lui-même) pour ne pas faire
                // échouer un test à cause du afterEach.
            });
        }
        createdIds.length = 0;
    });

    return { repository, trackDocument };
}

/** Crée un Y.Doc contenant un unique fragment texte, pour éviter de
 * répéter la construction manuelle du fragment "prosemirror" dans
 * chaque test. */
export function docWithText(text: string): Y.Doc {
    const ydoc = new Y.Doc();
    ydoc.getXmlFragment("prosemirror").insert(0, [new Y.XmlText(text)]);
    return ydoc;
}
