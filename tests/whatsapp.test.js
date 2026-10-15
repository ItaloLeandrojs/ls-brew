import { describe, it, expect } from "vitest";
import { linkWhatsApp } from "../src/dominio/whatsapp.js";

describe("linkWhatsApp", () => {
  it("monta o link com só os dígitos do número", () =>
    expect(linkWhatsApp("+55 (85) 0000-0000", "Oi")).toBe("https://wa.me/558500000000?text=Oi"));
  it("codifica acentos, espaço e &", () => {
    const url = linkWhatsApp("5585000000000", "Café & pão de queijo");
    expect(url).toBe("https://wa.me/5585000000000?text=Caf%C3%A9%20%26%20p%C3%A3o%20de%20queijo");
    expect(decodeURIComponent(new URL(url).searchParams.get("text"))).toBe("Café & pão de queijo");
  });
  it("sem mensagem, não põe ?text", () => expect(linkWhatsApp("5585000000000", "")).toBe("https://wa.me/5585000000000"));
  it("recusa número sem dígitos", () => expect(() => linkWhatsApp("abc", "Oi")).toThrow("número vazio"));
});
