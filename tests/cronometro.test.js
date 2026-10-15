import { describe, it, expect } from "vitest";
import { estadoCronometro, formatarTempo, totalSegundos } from "../src/dominio/cronometro.js";

const E = [{ nome: "Bloom", segundos: 45 }, { nome: "Despejo", segundos: 45 }, { nome: "Escorrer", segundos: 30 }];

describe("cronômetro", () => {
  it("total", () => expect(totalSegundos(E)).toBe(120));
  it("início", () => expect(estadoCronometro(E, 0)).toEqual({ indice: 0, nome: "Bloom", restanteEtapa: 45, progressoEtapa: 0, progresso: 0, fim: false }));
  it("no meio da 2ª etapa", () => {
    const s = estadoCronometro(E, 60_000);
    expect(s.indice).toBe(1); expect(s.restanteEtapa).toBe(30); expect(s.progressoEtapa).toBeCloseTo(15 / 45); expect(s.progresso).toBeCloseTo(0.5);
  });
  it("arredonda o restante para cima (mostra 45 até completar 1 s)", () => expect(estadoCronometro(E, 400).restanteEtapa).toBe(45));
  it("fronteira exata vai para a próxima etapa", () => expect(estadoCronometro(E, 45_000).indice).toBe(1));
  it("passou do total: fim, nunca negativo", () => {
    const s = estadoCronometro(E, 999_000);
    expect(s).toEqual({ indice: 2, nome: "Escorrer", restanteEtapa: 0, progressoEtapa: 1, progresso: 1, fim: true });
  });
  it("tempo negativo conta como zero", () => expect(estadoCronometro(E, -500).progresso).toBe(0));
  it("formata m:ss", () => { expect(formatarTempo(0)).toBe("0:00"); expect(formatarTempo(65)).toBe("1:05"); expect(formatarTempo(240)).toBe("4:00"); });
});
