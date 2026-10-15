// Vídeo controlado pela rolagem: em que segundo o vídeo deve estar, e o passo suave até lá.

// O vídeo termina em 90% da rolagem; os últimos 10% são a saída (esmaecer para o creme).
export const FIM_DO_VIDEO = 0.9;

export function tempoDoVideo(progresso, duracao) {
  if (!Number.isFinite(duracao) || duracao <= 0) return 0;
  const p = Math.min(1, Math.max(0, progresso));
  return Math.min(1, p / FIM_DO_VIDEO) * duracao;
}

// A cada quadro de tela o vídeo anda uma fração da distância até o alvo (lerp), sem saltos secos.
// Muito atrás (rolagem rápida, celular lento), pula direto: cada passinho seria uma busca nova e o vídeo
// ficaria segundos atrás da rolagem (medido: 7,7 s de atraso com 4G e processador 4x mais lento).
export function proximoTempo(atual, alvo, fator = 0.18, salto = 0.4) {
  const dif = alvo - atual;
  if (Math.abs(dif) < 0.01 || Math.abs(dif) > salto) return alvo;
  return atual + dif * fator;
}
