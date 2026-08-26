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
    async list(): Promise<IDocumentListItem[]> {
        const { data, error } = await this.supabase
            .from('documents')
            .select('id, title')
            .order('updated_at', { ascending: false })
            .limit(10);

        if (error) {
            throw error;
        }

        return data.map((item, index) => ({
            id: item.id, 
            title: item.title
        }));
    }
    async save(id: string, ydoc: Y.Doc): Promise<void> {
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

        return this.decodeDocument(data.content)
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

        return this.decodeDocument(data.content)
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
}