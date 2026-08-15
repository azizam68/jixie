import { describe, it, expect } from "vitest";
import * as Y from "yjs";
import { DocumentRepository } from "./DocumentRepository";

describe("DocumentRepository", () => {
  it("sauvegarde et recharge un document Yjs", async () => {
    const repository = new DocumentRepository();
    const ydoc = new Y.Doc();

    await repository.save("document-1", ydoc);

    const loaded = await repository.load("document-1");

    expect(loaded).toBeInstanceOf(Y.Doc);
  });
});