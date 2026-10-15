// Abas acessíveis sobre HTML pronto: o servidor manda todos os painéis; aqui escondemos os outros.
// Setas ← → trocam de aba, Home/End vão para a primeira/última (padrão WAI-ARIA de tablist).
export function iniciarAbas(raiz) {
  const abas = [...raiz.querySelectorAll('[role="tab"]')];
  const paineis = abas.map((a) => document.getElementById(a.getAttribute("aria-controls")));
  if (!abas.length) return;
  const ativar = (n, focar = false) => {
    abas.forEach((a, i) => {
      const sim = i === n;
      a.setAttribute("aria-selected", String(sim));
      a.tabIndex = sim ? 0 : -1;
      paineis[i].hidden = !sim;
      if (sim) { paineis[i].classList.remove("entrando"); void paineis[i].offsetWidth; paineis[i].classList.add("entrando"); }
    });
    if (focar) abas[n].focus();
    abas[n].scrollIntoView({ block: "nearest", inline: "nearest" }); // na linha deslizante do celular, a aba ativa fica à vista
  };
  abas.forEach((a, i) => a.addEventListener("click", () => ativar(i)));
  raiz.querySelector('[role="tablist"]').addEventListener("keydown", (e) => {
    const atual = abas.findIndex((a) => a.getAttribute("aria-selected") === "true");
    const mapa = { ArrowRight: atual + 1, ArrowLeft: atual - 1, Home: 0, End: abas.length - 1 };
    if (!(e.key in mapa)) return;
    e.preventDefault();
    ativar((mapa[e.key] + abas.length) % abas.length, true);
  });
  paineis.forEach((p, i) => { p.hidden = i !== 0; });
}
