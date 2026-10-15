import { describe, it, expect } from "vitest";
import { progressoDaSecao, quadroDaRolagem, ordemDeCarga, janelaDeQuadros, quadroMaisPerto, aproximar, FIM_DA_SEQUENCIA } from "../src/dominio/quadros.js";

describe("progressoDaSecao", () => {
  it("0 antes de chegar, 1 depois de passar", () => {
    expect(progressoDaSecao(100, 4000, 1000)).toBe(0);
    expect(progressoDaSecao(-3000, 4000, 1000)).toBe(1);
    expect(progressoDaSecao(-9000, 4000, 1000)).toBe(1);
  });
  it("meio do curso", () => expect(progressoDaSecao(-1500, 4000, 1000)).toBe(0.5));
  it("seção sem curso não quebra", () => { expect(progressoDaSecao(-10, 1000, 1000)).toBe(0); expect(progressoDaSecao(-10, NaN, 1000)).toBe(0); });
});

describe("quadroDaRolagem", () => {
  it("começa no primeiro e chega no último em 90%", () => {
    expect(quadroDaRolagem(0, 120)).toBe(0);
    expect(quadroDaRolagem(FIM_DA_SEQUENCIA, 120)).toBe(119);
    expect(quadroDaRolagem(1, 120)).toBe(119);
  });
  it("meio dos 90% é o quadro do meio, com fração", () => expect(quadroDaRolagem(0.45, 120)).toBeCloseTo(59.5));
  it("fora da faixa é limitado", () => { expect(quadroDaRolagem(-1, 120)).toBe(0); expect(quadroDaRolagem(3, 120)).toBe(119); });
  it("sem quadros dá 0", () => { expect(quadroDaRolagem(0.5, 0)).toBe(0); expect(quadroDaRolagem(0.5, 1)).toBe(0); });
});

describe("ordemDeCarga", () => {
  const o = ordemDeCarga(120);
  it("tem todos os quadros, uma vez cada", () => { expect(o.length).toBe(120); expect(new Set(o).size).toBe(120); });
  it("primeiro e último antes de tudo, depois um a cada 16", () => {
    expect(o.slice(0, 2)).toEqual([0, 119]);
    expect(o.slice(2, 9)).toEqual([16, 32, 48, 64, 80, 96, 112]);
  });
  it("nos primeiros 17 downloads nenhuma posição fica a mais de 8 quadros de um baixado", () => {
    const tem = new Set(o.slice(0, 17));
    for (let i = 0; i < 120; i++) expect(quadroMaisPerto(i, 120, (j) => tem.has(j)) - i).toBeLessThanOrEqual(8);
  });
});

describe("janelaDeQuadros", () => {
  it("atual e seguinte primeiro, depois dois à frente para cada um atrás", () => {
    expect(janelaDeQuadros(50.4, 120, 7, 1)).toEqual([50, 51, 52, 53, 49, 54, 55]);
  });
  it("rolando para cima, a frente é para trás", () => {
    expect(janelaDeQuadros(50.4, 120, 5, -1)).toEqual([50, 51, 49, 48, 52]);
  });
  it("nunca passa do máximo nem sai da faixa", () => {
    const j = janelaDeQuadros(118.9, 120, 14, 1);
    expect(j.length).toBe(14);
    expect(Math.max(...j)).toBe(119);
    expect(Math.min(...j)).toBeGreaterThanOrEqual(0);
    expect(new Set(j).size).toBe(14);
  });
  it("menos quadros que o máximo: pega todos", () => expect(janelaDeQuadros(1, 3, 14).sort()).toEqual([0, 1, 2]));
  it("entrada inválida dá lista vazia", () => { expect(janelaDeQuadros(1, 0, 14)).toEqual([]); expect(janelaDeQuadros(1, 10, 0)).toEqual([]); });
});

describe("quadroMaisPerto", () => {
  it("o próprio, se aberto", () => expect(quadroMaisPerto(10, 120, () => true)).toBe(10));
  it("procura para os dois lados, primeiro para trás", () => {
    const abertos = new Set([4, 16]);
    expect(quadroMaisPerto(10, 120, (j) => abertos.has(j))).toBe(4);
    expect(quadroMaisPerto(11, 120, (j) => abertos.has(j))).toBe(16);
  });
  it("-1 se nada aberto", () => expect(quadroMaisPerto(10, 120, () => false)).toBe(-1));
});

describe("aproximar", () => {
  it("anda um quarto da distância", () => expect(aproximar(0, 8)).toBe(2));
  it("encosta quando está perto", () => expect(aproximar(9.995, 10)).toBe(10));
  it("pula direto quando está muito longe (rolagem rápida)", () => expect(aproximar(0, 60)).toBe(60));
  it("fator e salto configuráveis", () => expect(aproximar(0, 10, 0.5, 100)).toBe(5));
});
