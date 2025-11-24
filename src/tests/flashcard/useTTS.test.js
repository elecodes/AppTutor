import { describe, it, expect, vi, beforeEach } from "vitest"; 
import { renderHook } from "@testing-library/react";
import { useTTS } from "../../components/hooks/useTTS"; 

// 2. Mock global para evitar errores de Audio y URL en JSDOM
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

// Mock simple de la clase Audio
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  onended: null, // Simulamos la propiedad onended
}));

describe("useTTS", () => {
  // Limpiamos los mocks antes de cada test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve una función speak", () => {
    const { result } = renderHook(() => useTTS());
    expect(typeof result.current.speak).toBe("function");
  });

  it("llama a fetch al usar speak", async () => {
    //  mock de fetch existente
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });

    const { result } = renderHook(() => useTTS());

    await result.current.speak("Hello");

    expect(mockFetch).toHaveBeenCalled();

    // Opcional: Verificar que se intentó reproducir audio
    // expect(global.Audio).toHaveBeenCalled();

    mockFetch.mockRestore();
  });
});
