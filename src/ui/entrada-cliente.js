import { deveMostrarEntrada } from "../dominio/entrada.js";

// Mostra o grão se montando uma vez por visita; sai quando as fontes chegam (mínimo 1,2 s, máximo 6 s).
export async function iniciarEntrada() {
  const el = document.getElementById("entrada");
  if (!el) return;
  let visto = false;
  try { visto = sessionStorage.getItem("ls-brew:entrada") === "1"; } catch {}
  const forcar = new URLSearchParams(location.search).get("abertura") === "1";
  if (!deveMostrarEntrada({ visto, automatizado: !!navigator.webdriver, forcar })) { el.remove(); dispatchEvent(new Event("ls-brew:entrada-fim")); return; }
  try { sessionStorage.setItem("ls-brew:entrada", "1"); } catch {}
  const minimo = matchMedia("(prefers-reduced-motion: reduce)").matches ? 400 : 1200;
  // Falha ao esperar (ex.: fontes) não pode prender a entrada na tela.
  try { await Promise.race([Promise.all([document.fonts?.ready, new Promise((r) => setTimeout(r, minimo))]), new Promise((r) => setTimeout(r, 6000))]); } catch {}
  el.classList.add("saindo");
  dispatchEvent(new Event("ls-brew:entrada-fim"));
  setTimeout(() => el.remove(), 520);
}
