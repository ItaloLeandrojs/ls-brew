// Número que conta até o alvo, desacelerando no fim (easeOutCubic).
export function valorContagem(alvo, t) {
  const x = Math.min(1, Math.max(0, t));
  return Math.round(alvo * (1 - (1 - x) ** 3));
}
