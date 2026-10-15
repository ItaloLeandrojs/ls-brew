// Qual frase da abertura aparece, pela fração da rolagem (0..1). 3 = logo.
export function faseDaAbertura(progresso) {
  const p = Math.min(1, Math.max(0, progresso));
  if (p < 0.25) return 0;
  if (p < 0.5) return 1;
  if (p < 0.72) return 2;
  return 3;
}
export const FRASES = ["Espresso da serra", "Leite vaporizado", "Arte na xícara"];

// Saída da abertura: de 90% a 100% da rolagem a parte de baixo da cena esmaece para o creme (0 = nada, 1 = todo).
// Assim o fim nunca fica parado e a cena emenda na seção seguinte, sem faixa escura nem vazia.
export function saidaDaAbertura(progresso) {
  const p = Math.min(1, Math.max(0, progresso));
  if (p <= 0.9) return 0;
  if (p >= 1) return 1; // (1 - 0,9) / 0,1 dá 0,9999… em ponto flutuante
  return (p - 0.9) / 0.1;
}
