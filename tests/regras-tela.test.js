import { describe, it, expect } from "vitest";
import { emailValido } from "../src/dominio/email.js";
import { faseDaAbertura, saidaDaAbertura } from "../src/dominio/abertura.js";
import { valorContagem } from "../src/dominio/contagem.js";

describe("emailValido", () => {
  it("aceita com espaços e maiúsculas", () => expect(emailValido("  Ana@Ex.com ")).toBe(true));
  it("recusa vazio, sem @ e sem domínio", () => {
    for (const e of ["", "   ", "ana", "ana@", "ana@ex", "@ex.com", "a b@ex.com"]) expect(emailValido(e)).toBe(false);
  });
});

describe("faseDaAbertura", () => {
  it("limites", () => {
    expect([0, 0.24, 0.25, 0.49, 0.5, 0.71, 0.72, 1].map(faseDaAbertura)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });
  it("fora da faixa é limitado", () => { expect(faseDaAbertura(-1)).toBe(0); expect(faseDaAbertura(2)).toBe(3); });
});

describe("saidaDaAbertura", () => {
  it("nada de creme até 90% da rolagem", () => { expect(saidaDaAbertura(0)).toBe(0); expect(saidaDaAbertura(0.9)).toBe(0); });
  it("esmaece de 90% a 100%", () => { expect(saidaDaAbertura(0.95)).toBeCloseTo(0.5); expect(saidaDaAbertura(1)).toBe(1); });
  it("fora da faixa é limitado", () => { expect(saidaDaAbertura(-1)).toBe(0); expect(saidaDaAbertura(2)).toBe(1); });
});

describe("valorContagem", () => {
  it("começa em 0 e termina no alvo", () => { expect(valorContagem(870, 0)).toBe(0); expect(valorContagem(870, 1)).toBe(870); });
  it("desacelera: passou da metade do valor na metade do tempo", () => expect(valorContagem(870, 0.5)).toBeGreaterThan(435));
  it("t fora de 0..1 é limitado", () => { expect(valorContagem(100, -1)).toBe(0); expect(valorContagem(100, 9)).toBe(100); });
});
