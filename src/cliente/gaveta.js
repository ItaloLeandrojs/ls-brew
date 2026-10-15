// Gaveta de seções do celular (<dialog> modal).
export function iniciarGaveta(gaveta, botao) {
  if (!gaveta || !botao || typeof gaveta.showModal !== "function") return;
  let indoParaSecao = false;
  botao.addEventListener("click", () => { indoParaSecao = false; gaveta.showModal(); });
  gaveta.querySelector(".gaveta-fechar").addEventListener("click", () => gaveta.close());
  // Toque fora da gaveta (no fundo escuro) fecha.
  gaveta.addEventListener("click", (e) => { if (e.target === gaveta) gaveta.close(); });
  // Link de seção: fecha antes, para a página rolar até a seção com a gaveta já fora do caminho.
  gaveta.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { indoParaSecao = true; gaveta.close(); }));
  // Fechou sem escolher: o foco volta ao botão. Escolheu uma seção: o foco fica com a navegação da página.
  gaveta.addEventListener("close", () => { if (!indoParaSecao) botao.focus({ preventScroll: true }); });
}
