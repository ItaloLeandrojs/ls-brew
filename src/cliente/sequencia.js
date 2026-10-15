// Motor da sequência de quadros num canvas (abertura). Feito para o celular não engasgar:
// - os quadros chegam comprimidos (WebP, ~20 KB) e ficam guardados assim;
// - só os quadros perto da posição atual ficam abertos (ImageBitmap); o resto é fechado na hora;
// - abrir um quadro não trava a página (Chrome: blob -> createImageBitmap; Safari/Firefox: img.decode());
// - entre dois quadros, desenha o seguinte por cima com transparência: movimento contínuo.
// Pesquisa e números em docs/pesquisa-celular.md.
import { ordemDeCarga, janelaDeQuadros, quadroMaisPerto, aproximar } from "../dominio/quadros.js";

const CHROMIUM = typeof window !== "undefined" && !!window.chrome;

async function abrirQuadro(blob) {
  if (CHROMIUM) return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return await createImageBitmap(img);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * @param {object} o
 * @param {HTMLCanvasElement} o.canvas
 * @param {(i: number) => string} o.endereco  URL do quadro i (0..total-1)
 * @param {number} o.total
 * @param {number} o.largura  tamanho real dos quadros
 * @param {number} o.altura
 * @param {number} o.maxAbertos  teto de quadros decodificados na memória
 * @param {() => void} [o.aoDesenharPrimeiro]
 */
export function criarSequencia({ canvas, endereco, total, largura, altura, maxAbertos, aoDesenharPrimeiro }) {
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d", { alpha: false });
  const blobs = new Array(total);
  const abertos = new Map();
  const abrindo = new Set();
  let alvo = 0;
  let atual = 0;
  let sentido = 1;
  let ultimoDesenho = "";
  let desenhos = 0;
  let baixados = 0;
  let ligada = true; // desligada = fora da tela: não abre quadros novos
  let destruida = false;

  // Download do grosso para o fino, 6 de cada vez.
  const ordem = ordemDeCarga(total);
  let proximo = 0;
  const baixar = async () => {
    while (proximo < ordem.length && !destruida) {
      const i = ordem[proximo++];
      try {
        const r = await fetch(endereco(i));
        if (!r.ok) continue;
        blobs[i] = await r.blob();
        baixados++;
        organizar();
      } catch { /* rede caiu: o quadro vizinho cobre */ }
    }
  };
  for (let k = 0; k < 6; k++) baixar();

  // Abre os quadros da janela (até 2 ao mesmo tempo) e fecha os que saíram dela.
  function organizar() {
    if (destruida || !ligada) return;
    const desejados = janelaDeQuadros(alvo, total, maxAbertos, sentido);
    const manter = new Set(desejados);
    for (const [i, bmp] of abertos) if (!manter.has(i)) { bmp.close(); abertos.delete(i); }
    for (const i of desejados) {
      if (abrindo.size >= 2) break;
      if (!blobs[i] || abertos.has(i) || abrindo.has(i)) continue;
      abrindo.add(i);
      abrirQuadro(blobs[i]).then((bmp) => {
        abrindo.delete(i);
        const aindaQuero = ligada && !destruida && janelaDeQuadros(alvo, total, maxAbertos, sentido).includes(i);
        if (aindaQuero) abertos.set(i, bmp); else bmp.close();
        organizar();
      }, () => { abrindo.delete(i); });
    }
  }

  // Um passo por quadro de tela: aproxima do alvo e redesenha só se mudou.
  function passo() {
    if (destruida) return;
    atual = aproximar(atual, alvo);
    const i0 = Math.floor(atual);
    const fracao = atual - i0;
    const tem = (i) => abertos.has(i);
    const a = tem(i0) ? i0 : quadroMaisPerto(atual, total, tem);
    if (a < 0) return;
    const b = a === i0 && fracao > 0.02 && tem(i0 + 1) ? i0 + 1 : -1;
    const chave = b < 0 ? `${a}` : `${a}+${fracao.toFixed(2)}`;
    if (chave === ultimoDesenho) return;
    ctx.globalAlpha = 1;
    ctx.drawImage(abertos.get(a), 0, 0);
    if (b >= 0) {
      ctx.globalAlpha = fracao;
      ctx.drawImage(abertos.get(b), 0, 0);
      ctx.globalAlpha = 1;
    }
    if (!desenhos) aoDesenharPrimeiro?.();
    ultimoDesenho = chave;
    desenhos++;
  }

  return {
    passo,
    /** Novo alvo em quadros (com fração). */
    irPara(q) {
      if (q === alvo) return;
      sentido = q > alvo ? 1 : -1;
      alvo = q;
      organizar();
    },
    /** Fora da tela: fecha todos os quadros abertos (libera a memória para o resto da página). */
    desligar() {
      ligada = false;
      for (const bmp of abertos.values()) bmp.close();
      abertos.clear();
      ultimoDesenho = "";
    },
    ligar() {
      ligada = true;
      organizar();
    },
    destruir() {
      destruida = true;
      for (const bmp of abertos.values()) bmp.close();
      abertos.clear();
    },
    /** Para os testes e para medir no celular. */
    estado: () => ({ abertos: abertos.size, abrindo: abrindo.size, baixados, desenhos, alvo, atual }),
  };
}
