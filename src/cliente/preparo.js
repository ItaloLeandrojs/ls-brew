// Cronômetro do guia de preparo. Atualiza o texto e o anel direto no DOM a cada quadro (sem re-renderizar nada).
import { METODOS } from "../dados/preparo.js";
import { estadoCronometro, formatarTempo, totalSegundos } from "../dominio/cronometro.js";

const R = 54, C = 2 * Math.PI * R;

export function iniciarPreparo(secao) {
  const relogio = secao?.querySelector("[data-relogio]");
  if (!relogio) return;
  const botoes = [...secao.querySelectorAll("[data-metodo]")];
  const fichas = [...secao.querySelectorAll("[data-ficha]")];
  const anel = relogio.querySelector(".anel");
  const tempo = relogio.querySelector("[data-tempo]");
  const etapa = relogio.querySelector("[data-etapa]");
  const iniciar = relogio.querySelector("[data-iniciar]");
  const zerarBotao = relogio.querySelector("[data-zerar]");

  let mi = 0;
  let acumulado = 0; // ms contados antes da última partida
  let partida = 0;   // performance.now() da última partida
  let rodando = false;
  let raf = 0;
  let ultimoTexto = "";
  let ultimaEtapa = "";

  const desenhar = (ms) => {
    const m = METODOS[mi];
    const st = estadoCronometro(m.etapas, ms);
    anel.setAttribute("stroke-dashoffset", String(C * (1 - st.progresso)));
    const texto = formatarTempo(Math.max(0, Math.ceil(totalSegundos(m.etapas) - ms / 1000)));
    if (texto !== ultimoTexto) { tempo.textContent = texto; ultimoTexto = texto; }
    const e = st.fim ? "Pronto. Bom café!" : `${st.indice + 1}/${m.etapas.length} · ${st.nome}`;
    if (e !== ultimaEtapa) { etapa.textContent = e; ultimaEtapa = e; }
    return st;
  };

  const laco = (agora) => {
    const st = desenhar(acumulado + (agora - partida));
    if (st.fim) { pausar(); return; }
    raf = requestAnimationFrame(laco);
  };

  function comecar() {
    if (estadoCronometro(METODOS[mi].etapas, acumulado).fim) acumulado = 0;
    rodando = true;
    partida = performance.now();
    iniciar.textContent = "Pausar";
    raf = requestAnimationFrame(laco);
  }
  function pausar() {
    if (rodando) acumulado += performance.now() - partida;
    rodando = false;
    cancelAnimationFrame(raf);
    iniciar.textContent = "Iniciar";
  }
  function zerar() {
    rodando = false;
    cancelAnimationFrame(raf);
    acumulado = 0;
    iniciar.textContent = "Iniciar";
    desenhar(0);
  }
  function escolher(i) {
    zerar();
    mi = i;
    botoes.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
    fichas.forEach((f, j) => { f.hidden = j !== i; });
    desenhar(0);
  }

  iniciar.addEventListener("click", () => (rodando ? pausar() : comecar()));
  zerarBotao.addEventListener("click", zerar);
  botoes.forEach((b, i) => b.addEventListener("click", () => escolher(i)));
  escolher(0);
}
