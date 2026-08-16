import { describe, it, expect } from "vitest";
import * as Y from "yjs";
import { DocumentRepository } from "./DocumentRepository";
import { supabase } from "../supabase";


describe("DocumentRepository", () => {
it("sauvegarde et recharge le contenu d'un document Yjs", async () => {
    const repository = new DocumentRepository();

    const ydoc = new Y.Doc();

    const fragment = ydoc.getXmlFragment("prosemirror");

    fragment.insert(0, [
        new Y.XmlText("Hello World")
    ]);

    await repository.save("document-1", ydoc);

    const loaded = await repository.load("document-1");

    expect(
        loaded.getXmlFragment("prosemirror").toString()
    ).toContain("Hello World");
});
  it("sauvegarde réellement le document dans Supabase", async () => {
    const repository = new DocumentRepository();

    const ydoc = new Y.Doc();

    await repository.save("document-test", ydoc);
    
    const { data, error } = await supabase
        .from("documents")
        .select("id")
        .eq("id", "document-test")
        .single();

    expect(error).toBeNull();
    expect(data?.id).toBe("document-test");
});
});