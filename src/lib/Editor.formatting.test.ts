import { screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { renderEditor } from "./Editor.test-utils";

/**
 * Gras, italic et underline suivent exactement le même contrat :
 * - un bouton toggle avec un name accessible donné
 * - un élément inline (strong / em / u) ajouté autour de la sélection
 * - un état aria-pressed reflétant si le curseur est dans le mark
 *
 */
interface MarkConfig {
  markName: string;
  buttonName: string;
  getElement: (textbox: HTMLElement) => Element | null;
}

const marks: MarkConfig[] = [
  {
    markName: "gras",
    buttonName: "Gras",
    getElement: (textbox) => textbox.querySelector("strong"),
  },
  {
    markName: "italic",
    buttonName: "Italic",
    getElement: (textbox) => textbox.querySelector("em"),
  },
  {
    markName: "underline",
    buttonName: "Underline",
    getElement: (textbox) => textbox.querySelector("u"),
  },
  {
    markName: "strikethrough",
    buttonName: "Strikethrough",
    getElement: (textbox) => textbox.querySelector("s"),
  },
];

describe.each(marks)(
  "Éditeur : mise en forme — $markName",
  ({ buttonName, getElement }) => {
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

      expect(
        screen.getByRole("button", { name: buttonName })
      ).toBeInTheDocument();
    });

    it("s'applique au texte sélectionné", async () => {
      const user = userEvent.setup();
      renderEditor();
      const textbox = screen.getByRole("textbox");
      const button = screen.getByRole("button", { name: buttonName });

      await user.type(textbox, "Bonjour Jixie");
      await user.tripleClick(textbox);
      await user.click(button);

      const element = getElement(textbox);
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent("Bonjour Jixie");
    });

    it("peut être retiré après application", async () => {
      const user = userEvent.setup();
      renderEditor();
      const textbox = screen.getByRole("textbox");
      const button = screen.getByRole("button", { name: buttonName });

      await user.type(textbox, "Bonjour Jixie");
      await user.tripleClick(textbox);
      await user.click(button);
      await user.tripleClick(textbox);
      await user.click(button);

      expect(getElement(textbox)).not.toBeInTheDocument();
    });

    it("indique via aria-pressed quand le curseur est dans le texte formaté", async () => {
      const user = userEvent.setup();
      renderEditor();
      const textbox = screen.getByRole("textbox");
      const button = screen.getByRole("button", { name: buttonName });

      await user.type(textbox, "Bonjour Jixie");
      await user.tripleClick(textbox);
      await user.click(button);

      expect(getElement(textbox)).toHaveTextContent("Bonjour Jixie");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  }
);
