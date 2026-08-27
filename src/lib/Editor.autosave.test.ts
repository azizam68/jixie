import { screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderEditor, createDeferredSave } from "./Editor.test-utils";

describe("Éditeur : sauvegarde automatique", () => {
  it("sauvegarde automatiquement le document lorsqu'il est modifié", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderEditor({ onSave });
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it("regroupe les modifications rapprochées en une seule sauvegarde (debounce)", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderEditor({ onSave });
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    // L'utilisateur vient juste de terminer sa saisie : pas de sauvegarde
    // déclenchée à chaque caractère.
    expect(onSave).not.toHaveBeenCalled();

    // On laisse passer le délai de sauvegarde automatique.
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("indique quand le document est en cours de sauvegarde", async () => {
    const user = userEvent.setup();
    const { onSave } = createDeferredSave();
    renderEditor({ onSave });
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    await waitFor(() => {
      expect(screen.getByText("Enregistrement…")).toBeInTheDocument();
    });
  });

  it("indique quand le document a été sauvegardé", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderEditor({ onSave });
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText("Enregistré")).toBeInTheDocument();
    });
  });

  it("indique une erreur lorsque la sauvegarde échoue", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error("Erreur réseau"));
    renderEditor({ onSave });
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour Jixie");

    await waitFor(() => {
      expect(screen.getByText("Erreur d'enregistrement")).toBeInTheDocument();
    });
  });

  it("retente automatiquement la sauvegarde après une erreur", async () => {
    const user = userEvent.setup();
    const onSave = vi
      .fn()
      .mockRejectedValueOnce(new Error("Erreur réseau"))
      .mockResolvedValue(undefined);
    renderEditor({ onSave });
    const textbox = screen.getByRole("textbox");

    // Première modification : la sauvegarde échoue.
    await user.type(textbox, "Bonjour");

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByText("Erreur d'enregistrement")).toBeInTheDocument();
    });

    // Nouvelle modification : une nouvelle tentative doit être déclenchée.
    await user.type(textbox, " Jixie");

    await waitFor(
      () => {
        expect(onSave).toHaveBeenCalledTimes(2);
      },
      { timeout: 1000 }
    );
    await waitFor(() => {
      expect(screen.getByText("Enregistré")).toBeInTheDocument();
    });
  });
});
