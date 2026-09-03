import * as Y from "yjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Base64 } from "js-base64";
import type { IDocumentRepository, IDocumentListItem } from "./IDocumentRepository";

export class DocumentRepository implements IDocumentRepository {

    constructor(private supabase: SupabaseClient) { }

    private decodeDocument(content: string): Y.Doc {
        const ydoc = new Y.Doc();
        const update = Base64.toUint8Array(content);
        Y.applyUpdate(ydoc, update);
        return ydoc;
    }

    /**
     * Bloque load/save/getTitle/updateTitle tant qu'un document est dans
     * la corbeille : il doit être restauré avant de pouvoir être édité
     * ou consulté à nouveau.
     */
    private async assertNotDeleted(id: string): Promise<void> {
        const { data, error } = await this.supabase
            .from("documents")
            .select("deleted_at")
            .eq("id", id)
            .maybeSingle();

        if (error) {
            throw new Error(`Failed to check document ${id}: ${error.message}`);
        }

        // data === null signifie que le document n'existe pas encore
        // (ex: create() sur un nouvel id) — il ne peut alors pas être
        // dans la corbeille, donc on laisse passer. L'opération réelle
        // qui suit (insert/select/update) gère elle-même le cas
        // "document introuvable" avec son propre message d'erreur.
        if (data?.deleted_at) {
            throw new Error(
                `Document ${id} is in trash and must be restored before it can be edited`
            );
        }
    }

    async list(includeTrash = false): Promise<IDocumentListItem[]> {
        let query = this.supabase
            .from('documents')
            .select('id, title, deleted_at')
            .order('updated_at', { ascending: false })
            .limit(10);

        if (!includeTrash) {
            query = query.is('deleted_at', null);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return data.map((item) => ({
            id: item.id,
            title: item.title,
            deletedAt: item.deleted_at
        }));
    }

    async save(id: string, ydoc: Y.Doc): Promise<void> {
        await this.assertNotDeleted(id);

        const update = Y.encodeStateAsUpdate(ydoc);
        const content = Base64.fromUint8Array(update);

        // Sauvegarde de l'état courant
        const { error: documentError } = await this.supabase
            .from("documents")
            .upsert({
                id,
                content
            });

        if (documentError) {
            throw documentError;
        }

        // Ajout à l'historique
        const { error: versionError } = await this.supabase
            .from("document_versions")
            .insert({
                document_id: id,
                content
            });

        if (versionError) {
            throw versionError;
        }
    }

    async load(id: string): Promise<Y.Doc> {
        await this.assertNotDeleted(id);

        const { data, error } = await this.supabase
            .from("document_versions")
            .select("content")
            .eq("document_id", id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            throw error;
        }

        return this.decodeDocument(data.content);
    }

    async loadVersion(versionId: string): Promise<Y.Doc> {
        const { data, error } = await this.supabase
            .from("document_versions")
            .select("content")
            .eq("id", versionId)
            .single();

        if (error) {
            throw error;
        }

        return this.decodeDocument(data.content);
    }

    async restoreVersion(
        documentId: string,
        versionId: string
    ): Promise<void> {
        const ydoc = await this.loadVersion(versionId);
        await this.save(documentId, ydoc);
    }

    async create(): Promise<string> {
        const documentId = crypto.randomUUID();
        const ydoc = new Y.Doc();
        await this.save(documentId, ydoc);
        return documentId;
    }

    async getTitle(id: string): Promise<{ title: string }> {
        await this.assertNotDeleted(id);

        const { data, error } = await this.supabase
            .from("documents")
            .select("title")
            .eq("id", id)
            .single();

        if (error) {
            throw new Error(`Failed to get title for document ${id}: ${error.message}`);
        }

        return { title: data.title ?? "" };
    }

    async updateTitle(id: string, title: string): Promise<{ title: string }> {
        await this.assertNotDeleted(id);

        const { data, error } = await this.supabase
            .from("documents")
            .update({ title })
            .eq("id", id)
            .select("title")
            .single();

        if (error) {
            throw new Error(`Failed to update title for document ${id}: ${error.message}`);
        }

        return { title: data.title ?? "" };
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from("documents")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", id);

        if (error) {
            throw new Error(`Failed to delete document ${id}: ${error.message}`);
        }
    }

    async restore(id: string): Promise<void> {
        const { error } = await this.supabase
            .from("documents")
            .update({ deleted_at: null })
            .eq("id", id);

        if (error) {
            throw new Error(`Failed to restore document ${id}: ${error.message}`);
        }
    }

    async permanentlyDelete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from("documents")
            .delete()
            .eq("id", id);

        if (error) {
            throw new Error(`Failed to permanently delete document ${id}: ${error.message}`);
        }
    }

    async emptyTrash(): Promise<void> {
        const { error } = await this.supabase
            .from("documents")
            .delete()
            .not("deleted_at", "is", null);

        if (error) {
            throw new Error(`Failed to empty trash: ${error.message}`);
        }
    }
}