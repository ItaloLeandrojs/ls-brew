// Revela elementos ao entrar na tela: sobe e aparece, conta números e desenha traços SVG.
import { valorContagem } from "../dominio/contagem.js";

const reduz = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function contar(el) {
  const alvo = Number(el.dataset.contar);
  if (reduz()) { el.textContent = alvo.toLocaleString("pt-BR"); return; }
  const t0 = performance.now();
  const passo = (agora) => {
    const t = (agora - t0) / 1400;
    el.textContent = valorContagem(alvo, t).toLocaleString("pt-BR");
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

export function iniciarRevelar(raiz = document) {
  const alvos = raiz.querySelectorAll("[data-revelar], [data-contar], [data-desenhar]");
  if (!("IntersectionObserver" in window) || reduz()) {
    alvos.forEach((el) => { el.classList.add("visivel"); if (el.dataset.contar) contar(el); });
    return;
  }
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("visivel");
      if (e.target.dataset.contar) contar(e.target);
      io.unobserve(e.target);
    }
  }, { rootMargin: "0px 0px -12% 0px" });
  alvos.forEach((el) => io.observe(el));
}
