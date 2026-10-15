// Em que etapa do preparo estamos, dado o tempo decorrido.
export const totalSegundos = (etapas) => etapas.reduce((s, e) => s + e.segundos, 0);

export function estadoCronometro(etapas, decorridoMs) {
  const total = totalSegundos(etapas);
  const t = Math.max(0, decorridoMs) / 1000;
  if (t >= total) {
    const u = etapas.length - 1;
    return { indice: u, nome: etapas[u].nome, restanteEtapa: 0, progressoEtapa: 1, progresso: 1, fim: true };
  }
  let inicio = 0;
  for (let i = 0; i < etapas.length; i++) {
    const fimEtapa = inicio + etapas[i].segundos;
    if (t < fimEtapa) {
      const dentro = t - inicio;
      return {
        indice: i, nome: etapas[i].nome,
        restanteEtapa: Math.ceil(etapas[i].segundos - dentro),
        progressoEtapa: dentro / etapas[i].segundos,
        progresso: t / total, fim: false,
      };
    }
    inicio = fimEtapa;
  }
}

export const formatarTempo = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
