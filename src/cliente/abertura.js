// Abertura: a cena fica presa com position: sticky (CSS, sem pulo no celular) e a rolagem escolhe o quadro.
// As frases e o logo trocam pelo atributo data-fase (CSS faz a transição). A saída é um degradê para o creme.
import { criarSequencia } from "./sequencia.js";
import { progressoDaSecao, quadroDaRolagem, tetoDeQuadros } from "../dominio/quadros.js";
import { faseDaAbertura, saidaDaAbertura } from "../dominio/abertura.js";

export function iniciarAbertura(secao) {
  if (!secao) return;
  const palco = secao.querySelector(".cena-palco");
  const saida = secao.querySelector(".cena-saida");
  const capa = secao.querySelector(".cena-capa");
  const conjuntos = JSON.parse(secao.dataset.conjuntos);
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const economia = !!navigator.connection?.saveData;
  const retrato = matchMedia("(orientation: portrait)");

  // Reduzir movimento: o <picture> já troca a capa pelo último quadro (funciona sem JavaScript e acompanha a rotação).
  // Economia de dados: a mesma troca, feita aqui. Nos dois casos, nada de quadros.
  if (reduz || economia || !("createImageBitmap" in window)) {
    secao.dataset.modo = "parado";
    if (!reduz) {
      const trocar = () => {
        capa.closest("picture").querySelectorAll("source").forEach((s) => s.remove());
        const c = retrato.matches ? conjuntos.celular : conjuntos.computador;
        capa.src = c.pasta + c.final;
      };
      trocar();
      retrato.addEventListener("change", trocar);
    }
    return;
  }

  const toque = matchMedia("(pointer: coarse)").matches;
  let canvas = secao.querySelector(".cena-canvas");
  let pendente = null; // canvas novo (depois de girar) que ainda não desenhou
  let seq = null;
  let total = 0;
  let fase = -1;
  let opacidadeSaida = -1;
  let alturaSecao = 0;
  let alturaPalco = 0;
  let raf = 0;
  let parado = 0;
  let visivel = false;

  // Os quadros só começam a baixar depois que a página carregou, a capa foi pintada e o navegador ficou ocioso:
  // antes disso eles disputavam a rede e a CPU com a primeira pintura (Lighthouse simulava LCP de 4,4 s).
  const ocioso = () => new Promise((r) => ("requestIdleCallback" in window ? requestIdleCallback(r, { timeout: 1500 }) : setTimeout(r, 300)));
  const pintou = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const carregou = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })))
    .then(() => capa.decode?.().catch(() => {}))
    .then(pintou)
    .then(ocioso);

  const medir = () => { alturaSecao = secao.offsetHeight; alturaPalco = palco.offsetHeight; acordar(); };

  function montar() {
    const antiga = seq;
    const c = retrato.matches ? conjuntos.celular : conjuntos.computador;
    total = c.total;
    // Ao girar o aparelho: o canvas novo fica escondido até desenhar o primeiro quadro e só então substitui
    // o antigo (limpar o mesmo canvas deixava a cena preta por um instante).
    // Girou de novo antes do pendente desenhar: ele sai (senão sobrava um canvas escondido a cada giro).
    pendente?.remove();
    pendente = null;
    const novo = antiga ? canvas.cloneNode(false) : canvas;
    if (antiga) { novo.style.visibility = "hidden"; canvas.after(novo); pendente = novo; }
    seq = criarSequencia({
      canvas: novo,
      total: c.total,
      largura: c.largura,
      altura: c.altura,
      maxAbertos: tetoDeQuadros(c, toque, navigator.deviceMemory),
      endereco: (i) => `${c.pasta}${String(i + 1).padStart(3, "0")}.webp`,
      comecarQuando: carregou,
      aoMudar: acordar,
      aoDesenharPrimeiro: () => {
        if (novo !== canvas) { canvas.remove(); canvas = novo; novo.style.visibility = ""; pendente = null; }
        secao.dataset.conjunto = retrato.matches ? "celular" : "computador";
        secao.classList.add("cena-pronta");
      },
    });
    antiga?.destruir();
    window.__lsAbertura = seq; // para os testes medirem a memória
    if (!visivel) seq.desligar();
    acordar();
  }

  function atualizar() {
    const p = progressoDaSecao(secao.getBoundingClientRect().top, alturaSecao, alturaPalco);
    seq.irPara(quadroDaRolagem(p, total));
    const f = faseDaAbertura(p);
    if (f !== fase) { fase = f; secao.dataset.fase = String(f); }
    const s = Math.round(saidaDaAbertura(p) * 100) / 100;
    if (s !== opacidadeSaida) { opacidadeSaida = s; saida.style.opacity = String(s); }
    return seq.passo();
  }

  // O laço dorme quando a cena para (sem rolagem e sem quadro abrindo) e acorda com a rolagem ou um quadro novo:
  // parado no topo, não fica gastando bateria 60 vezes por segundo.
  const laco = () => {
    parado = atualizar() ? 0 : parado + 1;
    raf = parado > 10 ? 0 : requestAnimationFrame(laco);
  };
  function acordar() {
    parado = 0;
    if (visivel && !raf && seq) raf = requestAnimationFrame(laco);
  }
  addEventListener("scroll", acordar, { passive: true });
  new ResizeObserver(medir).observe(secao);

  // Só trabalha perto da tela; longe, fecha os quadros e para o laço.
  new IntersectionObserver((entradas) => {
    visivel = entradas[entradas.length - 1].isIntersecting; // a última entrada é o estado mais novo
    if (visivel) { seq.ligar(); acordar(); }
    else { cancelAnimationFrame(raf); raf = 0; seq.desligar(); }
  }, { rootMargin: "50% 0px" }).observe(secao);

  // Girou o aparelho: troca o conjunto de quadros (retrato e paisagem têm recortes diferentes).
  retrato.addEventListener("change", montar);
  medir();
  montar();
}
