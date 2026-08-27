import { screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { renderEditor } from "./Editor.test-utils";

/**
 * L'alignement suit un contrat qui s'applique au bloc <p> via un style: 
 */
function getParagraphContaining(textbox: HTMLElement, text: string) {
  return Array.from(textbox.querySelectorAll("p")).find((p) =>
    p.textContent?.includes(text)
  );
}

describe("Éditeur : alignement du texte — justify", () => {
  it("ne s'applique pas par défaut", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour");

    expect(
      textbox.querySelector("p[style='text-align: justify']")
    ).not.toBeInTheDocument();
  });

  it("affiche le bouton correspondant", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Bonjour Jixie");

    expect(screen.getByRole("button", { name: "Justify" })).toBeInTheDocument();
  });

  it("s'applique au paragraphe sélectionné", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: "Justify" });

    await user.type(textbox, "Bonjour Jixie");
    await user.tripleClick(textbox);
    await user.click(button);

    const paragraph = getParagraphContaining(textbox, "Bonjour Jixie");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveStyle({ textAlign: "justify" });
  });

  it("peut être retiré après application", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: "Justify" });

    await user.type(textbox, "Bonjour Jixie");
    await user.tripleClick(textbox);
    await user.click(button);

    const paragraph = getParagraphContaining(textbox, "Bonjour Jixie");
    expect(paragraph).toHaveStyle({ textAlign: "justify" });

    await user.tripleClick(textbox);
    await user.click(button);

    expect(paragraph).not.toHaveStyle({ textAlign: "justify" });
  });

  it("indique via aria-pressed quand le curseur est dans un paragraphe justifié", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: "Justify" });

    await user.type(textbox, "Bonjour Jixie");
    await user.tripleClick(textbox);
    await user.click(button);

    const paragraph = getParagraphContaining(textbox, "Bonjour Jixie");
    expect(paragraph).toHaveTextContent("Bonjour Jixie");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });
});
