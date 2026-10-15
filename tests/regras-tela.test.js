import { describe, it, expect } from "vitest";
import { emailValido } from "../src/dominio/email.js";
import { faseDaAbertura } from "../src/dominio/abertura.js";
import { deveMostrarEntrada } from "../src/dominio/entrada.js";
import { valorContagem } from "../src/dominio/contagem.js";

describe("emailValido", () => {
  it("aceita com espaços e maiúsculas", () => expect(emailValido("  Ana@Ex.com ")).toBe(true));
  it("recusa vazio, sem @ e sem domínio", () => {
    for (const e of ["", "   ", "ana", "ana@", "ana@ex", "@ex.com", "a b@ex.com"]) expect(emailValido(e)).toBe(false);
  });
});

describe("faseDaAbertura", () => {
  it("limites", () => {
    expect([0, 0.29, 0.3, 0.59, 0.6, 0.84, 0.85, 1].map(faseDaAbertura)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });
  it("fora da faixa é limitado", () => { expect(faseDaAbertura(-1)).toBe(0); expect(faseDaAbertura(2)).toBe(3); });
});

describe("deveMostrarEntrada", () => {
  it("primeira visita de gente", () => expect(deveMostrarEntrada({ visto: false, automatizado: false, forcar: false })).toBe(true));
  it("já viu nesta visita", () => expect(deveMostrarEntrada({ visto: true, automatizado: false, forcar: false })).toBe(false));
  it("navegador automatizado não vê", () => expect(deveMostrarEntrada({ visto: false, automatizado: true, forcar: false })).toBe(false));
  it("?abertura=1 força sempre", () => expect(deveMostrarEntrada({ visto: true, automatizado: true, forcar: true })).toBe(true));
});

describe("valorContagem", () => {
  it("começa em 0 e termina no alvo", () => { expect(valorContagem(870, 0)).toBe(0); expect(valorContagem(870, 1)).toBe(870); });
  it("desacelera: passou da metade do valor na metade do tempo", () => expect(valorContagem(870, 0.5)).toBeGreaterThan(435));
  it("t fora de 0..1 é limitado", () => { expect(valorContagem(100, -1)).toBe(0); expect(valorContagem(100, 9)).toBe(100); });
});
