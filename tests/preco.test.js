import { describe, it, expect } from "vitest";
import { formatarPreco } from "../src/dominio/preco.js";

describe("formatarPreco", () => {
  it("centavos para real", () => expect(formatarPreco(1250)).toBe("R$ 12,50"));
  it("milhar com ponto", () => expect(formatarPreco(129900)).toBe("R$ 1.299,00"));
  it("zero", () => expect(formatarPreco(0)).toBe("R$ 0,00"));
  it("usa espaço comum depois do R$", () => expect(formatarPreco(500).includes("\u00a0")).toBe(false));
});
