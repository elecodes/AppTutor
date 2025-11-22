import { render, screen } from "@testing-library/react";
import FlashcardTranslation from "../../components/FlashcardText";
import { describe, it, expect } from "vitest";

describe("FlashcardTranslation", () => {
  it("muestra la traducción solo si showTranslation=true", () => {
    
    render(
      <FlashcardTranslation
        english="Hello"
        spanish="Hola"
        showTranslation={true}
      />
    );

    expect(screen.getByText("Hola")).toBeInTheDocument();
  });

  it("no muestra la traducción si showTranslation=false", () => {
    render(
      <FlashcardTranslation
        english="Hello"
        spanish="Hola"
        showTranslation={false}
      />
    );

    // Verificamos que "Hola" NO esté en el documento
    expect(screen.queryByText("Hola")).not.toBeInTheDocument();
    // Pero el inglés sí debería estar
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
