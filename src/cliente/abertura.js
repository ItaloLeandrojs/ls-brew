// Abertura: a cena fica presa com position: sticky (CSS, sem pulo no celular) e a rolagem escolhe o quadro.
// As frases e o logo trocam pelo atributo data-fase (CSS faz a transição). A saída é um degradê para o creme.
import { criarSequencia } from "./sequencia.js";
import { progressoDaSecao, quadroDaRolagem } from "../dominio/quadros.js";
import { faseDaAbertura, saidaDaAbertura } from "../dominio/abertura.js";

export function iniciarAbertura(secao) {
  if (!secao) return;
  const palco = secao.querySelector(".cena-palco");
  const canvas = secao.querySelector(".cena-canvas");
  const capa = secao.querySelector(".cena-capa");
  const saida = secao.querySelector(".cena-saida");
  const conjuntos = JSON.parse(secao.dataset.conjuntos);
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const economia = !!navigator.connection?.saveData;

  // Reduzir movimento ou economia de dados: uma imagem parada (a arte pronta) e as frases juntas. Nada de quadros.
  if (reduz || economia || !("createImageBitmap" in window)) {
    secao.dataset.modo = "parado";
    const retrato = matchMedia("(orientation: portrait)").matches;
    const c = retrato ? conjuntos.celular : conjuntos.computador;
    capa.closest("picture")?.querySelectorAll("source").forEach((s) => s.remove());
    capa.src = c.pasta + c.final;
    return;
  }

  let seq = null;
  let total = 0;
  let fase = -1;
  let opacidadeSaida = -1;
  let alturaSecao = 0;
  let alturaPalco = 0;
  let raf = 0;
  let visivel = false;

  const medir = () => { alturaSecao = secao.offsetHeight; alturaPalco = palco.offsetHeight; };
  medir();
  new ResizeObserver(medir).observe(secao);

  function montar() {
    seq?.destruir();
    secao.classList.remove("cena-pronta");
    const retrato = matchMedia("(orientation: portrait)").matches;
    const c = retrato ? conjuntos.celular : conjuntos.computador;
    secao.dataset.conjunto = retrato ? "celular" : "computador";
    total = c.total;
    seq = criarSequencia({
      canvas,
      total: c.total,
      largura: c.largura,
      altura: c.altura,
      maxAbertos: c.maxAbertos,
      endereco: (i) => `${c.pasta}${String(i + 1).padStart(3, "0")}.webp`,
      aoDesenharPrimeiro: () => secao.classList.add("cena-pronta"),
    });
    window.__lsAbertura = seq; // para os testes medirem a memória
    if (!visivel) seq.desligar();
    atualizar();
  }

  function atualizar() {
    const p = progressoDaSecao(secao.getBoundingClientRect().top, alturaSecao, alturaPalco);
    seq.irPara(quadroDaRolagem(p, total));
    const f = faseDaAbertura(p);
    if (f !== fase) { fase = f; secao.dataset.fase = String(f); }
    const s = Math.round(saidaDaAbertura(p) * 100) / 100;
    if (s !== opacidadeSaida) { opacidadeSaida = s; saida.style.opacity = String(s); }
    seq.passo();
  }

  const laco = () => { atualizar(); raf = requestAnimationFrame(laco); };

  // Só trabalha perto da tela; longe, fecha os quadros e para o laço.
  new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (visivel) { seq.ligar(); raf = requestAnimationFrame(laco); }
    else { seq.desligar(); atualizar(); }
  }, { rootMargin: "50% 0px" }).observe(secao);

  // Girou o celular: troca o conjunto de quadros (retrato e paisagem têm recortes diferentes).
  matchMedia("(orientation: portrait)").addEventListener("change", montar);
  montar();
}
