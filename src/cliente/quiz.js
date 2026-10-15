// Quiz sobre HTML pronto: mostra uma pergunta por vez, exige resposta e no fim mostra o lote que combina.
import { PERGUNTAS } from "../dados/quiz.js";
import { resultadoQuiz } from "../dominio/quiz.js";

export function iniciarQuiz(raiz) {
  if (!raiz) return;
  const passos = [...raiz.querySelectorAll("[data-pergunta]")];
  const resultados = [...raiz.querySelectorAll("[data-resultado]")];
  let respostas = {};
  let passo = 0;

  // O botão tocado some ao trocar de passo: o foco vai para o título novo (o leitor de tela anuncia a pergunta).
  const mostrar = (el) => {
    [...passos, ...resultados].forEach((x) => { x.hidden = x !== el; });
    el.querySelector("h3").focus({ preventScroll: true });
    if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" }); // no celular o título pode ter subido da tela
  };

  passos.forEach((fs, i) => {
    const id = fs.dataset.pergunta;
    const erro = fs.querySelector(".erro");
    fs.querySelectorAll("[data-opcao]").forEach((b) => b.addEventListener("click", () => {
      respostas[id] = b.dataset.opcao;
      fs.querySelectorAll("[data-opcao]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      erro.textContent = "";
    }));
    fs.querySelector("[data-avancar]").addEventListener("click", () => {
      if (!respostas[id]) { erro.textContent = "Escolha uma opção"; return; }
      erro.textContent = "";
      if (i < passos.length - 1) { passo = i + 1; mostrar(passos[passo]); }
      else mostrar(resultados.find((r) => r.dataset.resultado === resultadoQuiz(PERGUNTAS, respostas)));
    });
  });

  raiz.querySelectorAll("[data-refazer]").forEach((b) => b.addEventListener("click", () => {
    respostas = {};
    passo = 0;
    raiz.querySelectorAll("[data-opcao]").forEach((x) => x.setAttribute("aria-pressed", "false"));
    mostrar(passos[0]);
  }));
}
