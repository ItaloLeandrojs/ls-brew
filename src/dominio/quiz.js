// Conta quantas respostas apontam para cada lote. Empate: vence o lote que apareceu primeiro nas respostas.
export function resultadoQuiz(perguntas, respostas) {
  const ordem = [];
  const votos = new Map();
  for (const p of perguntas) {
    const op = p.opcoes.find((o) => o.id === respostas?.[p.id]);
    if (!op) return null;
    if (!votos.has(op.lote)) ordem.push(op.lote);
    votos.set(op.lote, (votos.get(op.lote) || 0) + 1);
  }
  let melhor = null;
  for (const lote of ordem) if (melhor === null || votos.get(lote) > votos.get(melhor)) melhor = lote;
  return melhor;
}
