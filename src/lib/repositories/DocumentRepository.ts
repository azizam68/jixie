import * as Y from "yjs";
import { supabase } from "../supabase";
import { Base64 } from "js-base64";

export class DocumentRepository {
async save(id: string, ydoc: Y.Doc): Promise<void> {
    const update = Y.encodeStateAsUpdate(ydoc);
    const content = Base64.fromUint8Array(update);

    const { error } = await supabase
        .from("documents")
        .upsert({
            id,
            content
        });

    if (error) {
        throw error;
    }
}
async load(id: string): Promise<Y.Doc> {
    const { data, error } = await supabase
        .from("documents")
        .select("content")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    const ydoc = new Y.Doc();

    const update = Base64.toUint8Array(data.content);

    Y.applyUpdate(ydoc, update);

    return ydoc;
}
}