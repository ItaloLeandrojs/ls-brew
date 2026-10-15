import { describe, it, expect } from "vitest";
import { LOTES } from "../src/dados/lotes.js";
import { CARDAPIO } from "../src/dados/cardapio.js";
import { PLANOS } from "../src/dados/planos.js";
import { METODOS } from "../src/dados/preparo.js";
import { PERGUNTAS } from "../src/dados/quiz.js";
import { CONTATO } from "../src/dados/contato.js";

const ids = (l) => l.map((x) => x.id);

describe("dados", () => {
  it("3 lotes com id único, altitude e notas", () => {
    expect(ids(LOTES)).toEqual(["sombra", "pedra", "pico"]);
    for (const l of LOTES) { expect(l.altitude).toBeGreaterThan(500); expect(l.notas.length).toBeGreaterThanOrEqual(2); }
  });
  it("cardápio com as 4 abas e todo item com preço inteiro positivo", () => {
    expect(ids(CARDAPIO)).toEqual(["coados", "espressos", "gelados", "comer"]);
    for (const c of CARDAPIO) {
      expect(c.itens.length).toBeGreaterThanOrEqual(3);
      for (const i of c.itens) { expect(Number.isInteger(i.preco)).toBe(true); expect(i.preco).toBeGreaterThan(0); expect(i.nome).toBeTruthy(); }
    }
  });
  it("cafés (não comida) têm notas de sabor", () => {
    for (const c of CARDAPIO.filter((c) => c.id !== "comer")) for (const i of c.itens) expect(i.notas?.length).toBeGreaterThan(0);
  });
  it("3 planos com preço", () => { expect(PLANOS).toHaveLength(3); for (const p of PLANOS) expect(p.preco).toBeGreaterThan(0); });
  it("3 métodos e toda etapa com tempo positivo", () => {
    expect(ids(METODOS)).toEqual(["v60", "prensa", "espresso"]);
    for (const m of METODOS) for (const e of m.etapas) expect(e.segundos).toBeGreaterThan(0);
  });
  it("quiz: 4 perguntas de 3 opções e toda opção aponta para um lote que existe", () => {
    expect(PERGUNTAS).toHaveLength(4);
    const lotes = new Set(ids(LOTES));
    for (const p of PERGUNTAS) { expect(p.opcoes).toHaveLength(3); for (const o of p.opcoes) expect(lotes.has(o.lote)).toBe(true); }
  });
  it("cada pergunta oferece os 3 lotes (o quiz consegue chegar em qualquer um)", () => {
    for (const p of PERGUNTAS) expect(new Set(p.opcoes.map((o) => o.lote)).size).toBe(3);
  });
  it("contato fictício em Fortaleza", () => { expect(CONTATO.cidade).toBe("Fortaleza/CE"); expect(CONTATO.horarios.length).toBeGreaterThan(0); });
});
