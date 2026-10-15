import { describe, it, expect } from "vitest";
import { tempoDoVideo, proximoTempo, FIM_DO_VIDEO } from "../src/dominio/rolagem-video.js";

describe("tempoDoVideo", () => {
  it("começa no zero", () => expect(tempoDoVideo(0, 13.8)).toBe(0));
  it("chega ao fim do vídeo antes da saída (90% da rolagem)", () => {
    expect(FIM_DO_VIDEO).toBe(0.9);
    expect(tempoDoVideo(0.9, 13.8)).toBeCloseTo(13.8);
    expect(tempoDoVideo(1, 13.8)).toBeCloseTo(13.8);
  });
  it("no meio do caminho, proporcional", () => expect(tempoDoVideo(0.45, 13.8)).toBeCloseTo(6.9));
  it("sem duração conhecida, fica no zero", () => { expect(tempoDoVideo(0.5, 0)).toBe(0); expect(tempoDoVideo(0.5, NaN)).toBe(0); });
  it("progresso fora da faixa é limitado", () => { expect(tempoDoVideo(-1, 10)).toBe(0); expect(tempoDoVideo(5, 10)).toBe(10); });
});

describe("proximoTempo", () => {
  it("perto do alvo, anda 18% da distância (suave)", () => expect(proximoTempo(0, 0.3)).toBeCloseTo(0.054));
  it("também volta suave, se a pessoa rolar um pouco para cima", () => expect(proximoTempo(0.3, 0)).toBeCloseTo(0.246));
  it("muito atrás (mais de 0,4 s), pula direto para o alvo numa busca só", () => { expect(proximoTempo(0, 10)).toBe(10); expect(proximoTempo(10, 0)).toBe(0); });
  it("encosta no alvo quando falta pouco (sem ficar oscilando)", () => expect(proximoTempo(4.995, 5)).toBe(5));
  it("aceita outro fator e outro limite de salto", () => expect(proximoTempo(0, 10, 0.5, 20)).toBe(5));
});
