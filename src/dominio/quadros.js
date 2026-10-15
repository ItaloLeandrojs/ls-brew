// Regras puras da sequência de quadros da abertura (canvas preso na rolagem).
// Sem DOM aqui: o motor em src/cliente/sequencia.js usa estas funções e os testes cobrem cada uma.

// A animação termina em 90% da rolagem; os últimos 10% são a saída (degradê para o creme).
export const FIM_DA_SEQUENCIA = 0.9;

const limitar = (x, min, max) => Math.min(max, Math.max(min, x));

// Quanto da seção já foi rolado (0..1). topo = getBoundingClientRect().top da seção;
// o palco fica preso (sticky) enquanto a seção anda alturaSecao - alturaPalco pixels.
export function progressoDaSecao(topo, alturaSecao, alturaPalco) {
  const curso = alturaSecao - alturaPalco;
  if (!(curso > 0)) return 0;
  return limitar(-topo / curso, 0, 1);
}

// Quadro (com fração, para misturar com o vizinho) que corresponde ao progresso da rolagem.
export function quadroDaRolagem(progresso, total, fim = FIM_DA_SEQUENCIA) {
  if (!(total > 1)) return 0;
  const p = limitar(progresso, 0, 1);
  return Math.min(1, p / fim) * (total - 1);
}

// Ordem de download do grosso para o fino: primeiro e último, depois um a cada 16, 8, 4, 2 e o resto.
// Assim, logo no começo, qualquer posição da rolagem tem um quadro perto para mostrar.
export function ordemDeCarga(total) {
  const ordem = [];
  const visto = new Set();
  const por = (i) => { if (i >= 0 && i < total && !visto.has(i)) { visto.add(i); ordem.push(i); } };
  por(0);
  por(total - 1);
  for (const passo of [16, 8, 4, 2, 1]) for (let i = 0; i < total; i += passo) por(i);
  return ordem;
}

// Quadros que devem ficar abertos (decodificados) em volta do alvo, em ordem de prioridade.
// O atual e o seguinte primeiro (a mistura usa os dois); depois os vizinhos, dois à frente para cada um atrás
// (a rolagem costuma continuar no mesmo sentido). Nunca passa de "maximo".
export function janelaDeQuadros(alvo, total, maximo, sentido = 1) {
  if (!(total > 0) || !(maximo > 0)) return [];
  const base = limitar(Math.floor(alvo), 0, total - 1);
  const frente = sentido >= 0 ? 1 : -1;
  const lista = [];
  const visto = new Set();
  const por = (i) => { if (i >= 0 && i < total && !visto.has(i) && lista.length < maximo) { visto.add(i); lista.push(i); } };
  por(base);
  por(base + 1);
  // Ponteiros para a frente e para trás, pulando o atual e o seguinte, que já entraram.
  let f = frente > 0 ? base + 2 : base - 1;
  let t = frente > 0 ? base - 1 : base + 2;
  const dentro = (i) => i >= 0 && i < total;
  while (lista.length < maximo && (dentro(f) || dentro(t))) {
    por(f); f += frente;
    por(f); f += frente;
    por(t); t -= frente;
  }
  return lista;
}

// Quadro aberto mais perto de i (procura para os dois lados, primeiro para trás). -1 se nenhum.
export function quadroMaisPerto(i, total, aberto) {
  const base = limitar(Math.round(i), 0, total - 1);
  for (let d = 0; d < total; d++) {
    if (base - d >= 0 && aberto(base - d)) return base - d;
    if (base + d < total && aberto(base + d)) return base + d;
  }
  return -1;
}

// Passo suave até o alvo (em quadros). Perto: encosta. Muito longe (rolagem rápida): pula direto,
// para a cena não ficar segundos atrás do dedo.
export function aproximar(atual, alvo, fator = 0.25, salto = 24) {
  const dif = alvo - atual;
  if (Math.abs(dif) < 0.01 || Math.abs(dif) > salto) return alvo;
  return atual + dif * fator;
}

// Teto de quadros abertos pelo APARELHO, não pela orientação: celular ou tablet deitado usa os quadros de
// paisagem (maiores) e não pode abrir 24 deles (~138 MB). Toque ou até 4 GB de memória: ~70 MB; senão ~160 MB.
export function tetoDeQuadros({ largura, altura, maxAbertos }, toque, memoriaGb) {
  const mb = toque || (memoriaGb && memoriaGb <= 4) ? 70 : 160;
  return Math.max(8, Math.min(maxAbertos, Math.floor((mb * 1e6) / (largura * altura * 4))));
}
