import { describe, it, expect } from "vitest";
import { resultadoQuiz } from "../src/dominio/quiz.js";
import { PERGUNTAS } from "../src/dados/quiz.js";
import { LOTES } from "../src/dados/lotes.js";

const resp = (...ops) => Object.fromEntries(PERGUNTAS.map((p, i) => [p.id, ops[i]]));

describe("resultadoQuiz", () => {
  it("maioria vence", () => expect(resultadoQuiz(PERGUNTAS, resp("b", "b", "b", "a"))).toBe("pedra"));
  it("empate 2 x 2: vence o lote escolhido primeiro", () => {
    expect(resultadoQuiz(PERGUNTAS, resp("c", "a", "a", "c"))).toBe("pico");
    expect(resultadoQuiz(PERGUNTAS, resp("a", "c", "c", "a"))).toBe("sombra");
  });
  it("falta resposta → null", () => expect(resultadoQuiz(PERGUNTAS, { manha: "a" })).toBeNull());
  it("opção que não existe → null", () => expect(resultadoQuiz(PERGUNTAS, resp("a", "a", "a", "z"))).toBeNull());
  it("todas as 81 combinações dão um lote que existe", () => {
    const validos = new Set(LOTES.map((l) => l.id));
    const ops = ["a", "b", "c"];
    let n = 0;
    for (const a of ops) for (const b of ops) for (const c of ops) for (const d of ops) {
      expect(validos.has(resultadoQuiz(PERGUNTAS, resp(a, b, c, d)))).toBe(true); n++;
    }
    expect(n).toBe(81);
  });
});
