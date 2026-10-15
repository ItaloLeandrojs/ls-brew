// Qual frase da abertura aparece, pela fração da rolagem (0..1). 3 = logo.
export function faseDaAbertura(progresso) {
  const p = Math.min(1, Math.max(0, progresso));
  if (p < 0.3) return 0;
  if (p < 0.6) return 1;
  if (p < 0.85) return 2;
  return 3;
}
export const FRASES = ["Grão escolhido", "Torra lenta", "Café na hora"];
