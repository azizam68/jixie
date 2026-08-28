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

/**
 * Left, Center, Right & Justify suivent exactement le même contrat :
 * - un bouton toggle avec un name accessible donné
 * - un style inline (text-align: left/center/right/justify) ajouté sur le paragraphe de la sélection
 * - un état aria-pressed reflétant si le curseur est dans l'alignement 
 *
 */
interface AlignmentConfig {
  alignmentName: string;
  buttonName: string;
  getElement: (textbox: HTMLElement) => Element | null;
}

const alignments: AlignmentConfig[] = [
  {
    alignmentName: "left",
    buttonName: "Left Align",
    getElement: (textbox) =>
      textbox.querySelector("p[style='text-align: left']"),
  },
  {
    alignmentName: "center",
    buttonName: "Center Align",
    getElement: (textbox) =>
      textbox.querySelector("p[style='text-align: center']"),
  },
  {
    alignmentName: "right",
    buttonName: "Right Align",
    getElement: (textbox) =>
      textbox.querySelector("p[style='text-align: right']"),
  },
  {
    alignmentName: "justify",
    buttonName: "Justify",
    getElement: (textbox) =>
      textbox.querySelector("p[style='text-align: justify']"),
  },
];

describe.each(alignments)(
  "Éditeur : alignement du texte — $alignmentName",
  ({ alignmentName, buttonName, getElement }) => {
    
  it("ne s'applique pas par défaut", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "Bonjour");

    expect(getElement(textbox)).not.toBeInTheDocument();
  });

  it("affiche le bouton correspondant", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Bonjour Jixie");

    expect(screen.getByRole("button", { name: buttonName })).toBeInTheDocument();
  });

  it("s'applique au paragraphe sélectionné", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: buttonName });

    await user.type(textbox, "Bonjour Jixie");
    await user.tripleClick(textbox);
    await user.click(button);

    const paragraph = getParagraphContaining(textbox, "Bonjour Jixie");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveStyle({ textAlign: alignmentName });
  });

  it("peut être retiré après application", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: buttonName });

    await user.type(textbox, "Bonjour Jixie");
    await user.tripleClick(textbox);
    await user.click(button);

    const paragraph = getParagraphContaining(textbox, "Bonjour Jixie");
    expect(paragraph).toHaveStyle({ textAlign: alignmentName });

    await user.tripleClick(textbox);
    await user.click(button);

    expect(paragraph).not.toHaveStyle({ textAlign: alignmentName });
  });

  it("indique via aria-pressed quand le curseur est dans un paragraphe justifié", async () => {
    const user = userEvent.setup();
    renderEditor();
    const textbox = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: buttonName });

    await user.type(textbox, "Bonjour Jixie");
    await user.tripleClick(textbox);
    await user.click(button);

    const paragraph = getParagraphContaining(textbox, "Bonjour Jixie");
    expect(paragraph).toHaveTextContent("Bonjour Jixie");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });
});
