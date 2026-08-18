import { describe, it, expect } from "vitest";
import * as Y from "yjs";
import { DocumentRepository } from "./DocumentRepository";
import { createSupabaseClient } from "../supabase";
import {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
} from "$env/static/public";

describe("DocumentRepository", () => {
    
const supabase = createSupabaseClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
);
it("sauvegarde et recharge le contenu d'un document Yjs", async () => {
    const repository = new DocumentRepository(supabase);

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
    const repository = new DocumentRepository(supabase);

    const ydoc = new Y.Doc();
const documentId = crypto.randomUUID();

await repository.save(documentId, ydoc);
    const { data, error } = await supabase
        .from("documents")
        .select("id")
        .eq("id", documentId)
        .single();

    expect(error).toBeNull();
    expect(data?.id).toBe(documentId);
});
it("crée une version du document lors de la sauvegarde", async () => {
    const repository = new DocumentRepository(supabase);
    const documentId = crypto.randomUUID();

    const ydoc = new Y.Doc();

    await repository.save(documentId, ydoc);

    const { data, error } = await supabase
        .from("document_versions")
        .select("id, document_id, content")
        .eq("document_id", documentId);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].document_id).toBe(documentId);
    expect(data?.[0].content).toBeTruthy();
});
it("conserve plusieurs versions d'un document", async () => {
    const repository = new DocumentRepository(supabase);
    const documentId = crypto.randomUUID();

    const ydoc = new Y.Doc();
    const fragment = ydoc.getXmlFragment("prosemirror");

    // Première version
    fragment.insert(0, [
        new Y.XmlText("Bonjour")
    ]);

    await repository.save(documentId, ydoc);

    // Modification du document
    fragment.insert(1, [
        new Y.XmlText(" Jixie")
    ]);

    // Deuxième version
    await repository.save(documentId, ydoc);

    const { data, error } = await supabase
        .from("document_versions")
        .select("id, document_id, content, created_at")
        .eq("document_id", documentId)
        .order("created_at", { ascending: true });

    expect(error).toBeNull();
    expect(data).toHaveLength(2);

    expect(data?.[0].document_id).toBe(documentId);
    expect(data?.[1].document_id).toBe(documentId);

    expect(data?.[0].content).not.toBe(data?.[1].content);
});
it("recharge une ancienne version du document", async () => {
    const repository = new DocumentRepository(supabase);
    const documentId = crypto.randomUUID();

    const ydoc = new Y.Doc();
    const fragment = ydoc.getXmlFragment("prosemirror");

    fragment.insert(0, [
        new Y.XmlText("Bonjour")
    ]);

    await repository.save(documentId, ydoc);

    const { data } = await supabase
        .from("document_versions")
        .select("id")
        .eq("document_id", documentId)
        .single();

    const versionId = data!.id;

    const loaded = await repository.loadVersion(versionId);

    expect(
        loaded.getXmlFragment("prosemirror").toString()
    ).toContain("Bonjour");
});
it("charge la dernière version du document", async () => {
    const repository = new DocumentRepository(supabase);

    const documentId = crypto.randomUUID();

    const first = new Y.Doc();
    first.getXmlFragment("prosemirror").insert(0, [
        new Y.XmlText("Version 1")
    ]);

    await repository.save(documentId, first);

    const second = new Y.Doc();
    second.getXmlFragment("prosemirror").insert(0, [
        new Y.XmlText("Version 2")
    ]);

    await repository.save(documentId, second);

    const loaded = await repository.load(documentId);

    expect(
        loaded.getXmlFragment("prosemirror").toString()
    ).toContain("Version 2");
});
it("restaure une ancienne version comme nouvelle version", async () => {
    const repository = new DocumentRepository(supabase);

    const documentId = crypto.randomUUID();

    const first = new Y.Doc();

    first.getXmlFragment("prosemirror").insert(0, [
        new Y.XmlText("Version 1")
    ]);

    await repository.save(documentId, first);

    const { data: versions } = await supabase
        .from("document_versions")
        .select("id")
        .eq("document_id", documentId)
        .order("created_at", { ascending: true });

    const versionId = versions![0].id;

    await repository.restoreVersion(documentId, versionId);

    const loaded = await repository.load(documentId);

    expect(
        loaded.getXmlFragment("prosemirror").toString()
    ).toContain("Version 1");
});
it("crée un nouveau document", async () => {
    const repository = new DocumentRepository(supabase);

    const documentId = await repository.create();

    expect(documentId).toBeTruthy();

    const { data, error } = await supabase
        .from("documents")
        .select("id")
        .eq("id", documentId)
        .single();

    expect(error).toBeNull();
    expect(data?.id).toBe(documentId);
});
it("crée un document immédiatement chargeable", async () => {
    const repository = new DocumentRepository(supabase);

    const documentId = await repository.create();

    const loaded = await repository.load(documentId);

    expect(loaded).toBeInstanceOf(Y.Doc);
});
});