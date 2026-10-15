// Roteiro da página inteira: rode depois de "npm run build" com "node e2e/pagina.mjs".
// Telas: computador, Android (412×915), Android pequeno (360×800) e iPhone (390×844).
import { servidor, navegador, pagina, confere, resultado, URL_BASE } from "./util.mjs";
import { quadroDaRolagem } from "../src/dominio/quadros.js";

const TELAS = [
  ["computador", {}],
  ["android", { viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true }],
  ["android pequeno", { viewport: { width: 360, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ["iphone", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }],
];

// Rola até uma fração (0..1) da cena da abertura, sem animação (o html tem scroll-behavior: smooth).
const irNaAbertura = (page, p) => page.evaluate((p) => {
  const s = document.getElementById("inicio");
  const curso = s.offsetHeight - s.querySelector(".cena-palco").offsetHeight;
  scrollTo({ top: s.offsetTop + p * curso, behavior: "instant" });
}, p);
const irPara = (page, sel) => page.evaluate((sel) => document.querySelector(sel).scrollIntoView({ behavior: "instant" }), sel);
const innerHeightAprox = () => 915;
const estado = (page) => page.evaluate(() => window.__lsAbertura?.estado());

const parar = await servidor();
const browser = await navegador();
try {
  for (const [nome, opts] of TELAS) {
    console.log(`\n${nome}`);
    const celular = !!opts.isMobile;
    const { ctx, page, erros } = await pagina(browser, opts);
    await page.goto(URL_BASE);
    confere(await page.locator('meta[name="robots"][content="noindex"]').count() === 1, "noindex presente");
    for (const id of ["inicio", "origem", "cardapio", "preparo", "quiz", "clube", "galeria", "visite"])
      confere(await page.locator(`#${id}`).count() === 1, `seção #${id}`);
    confere(await page.locator("script[src*='react'], script[src*='gsap']").count() === 0, "sem React e sem GSAP");

    const largura = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    confere(largura[0] <= largura[1], `sem rolagem lateral (${largura[0]} <= ${largura[1]})`);

    // Galeria 3×3 sem buraco: a última foto termina na borda direita da grade.
    const buraco = await page.evaluate(() => {
      const g = document.querySelector(".galeria"); const ul = g.lastElementChild;
      return Math.abs(g.getBoundingClientRect().right - ul.getBoundingClientRect().right);
    });
    confere(buraco < 2, `galeria sem buraco na última linha (sobra ${buraco.toFixed(0)} px)`);

    // Topo e barra de baixo
    const barra = await page.locator(".barra").isVisible();
    const topoFixo = await page.locator(".topo").evaluate((el) => getComputedStyle(el).position === "fixed");
    if (celular) confere(barra && !topoFixo, "celular: barra de baixo visível e topo não fixo");
    else confere(!barra && topoFixo, "computador: topo fixo e sem barra de baixo");

    // Abertura: quadros no canvas, conjunto certo para a tela
    await page.waitForFunction(() => document.getElementById("inicio").classList.contains("cena-pronta"), null, { timeout: 15000 }).catch(() => {});
    const conjunto = await page.locator("#inicio").getAttribute("data-conjunto");
    confere(await page.locator("#inicio.cena-pronta").count() === 1, "abertura desenhou o primeiro quadro no canvas");
    confere(conjunto === (celular ? "celular" : "computador"), `quadros do ${conjunto} para esta tela`);
    const maximo = celular ? 14 : 24;

    // Rolagem rápida de ida e volta: a memória nunca passa do teto de quadros abertos.
    let pior = 0;
    for (const p of [0.1, 0.3, 0.6, 0.9, 0.5, 0.2, 0.7]) {
      await irNaAbertura(page, p);
      for (let k = 0; k < 6; k++) { await page.waitForTimeout(50); pior = Math.max(pior, (await estado(page)).abertos); }
    }
    confere(pior <= maximo, `no máximo ${maximo} quadros abertos na memória (pior: ${pior})`);

    // O quadro acompanha a rolagem
    await irNaAbertura(page, 0.45);
    await page.waitForTimeout(1200);
    const e45 = await estado(page);
    const esperado = quadroDaRolagem(0.45, 120);
    confere(Math.abs(e45.atual - esperado) < 1.5, `quadro acompanha a rolagem (${e45.atual.toFixed(1)}, esperado ~${esperado.toFixed(1)})`);
    confere(await page.locator("#inicio").getAttribute("data-fase") === "1", "frase 2 aparece perto do meio");

    // Fim da cena: logo e saída em degradê para o creme
    await irNaAbertura(page, 0.8);
    await page.waitForTimeout(700);
    const logo = await page.locator(".cena-logo").evaluate((el) => +getComputedStyle(el).opacity);
    confere(logo > 0.95, `logo aparece no fim da abertura (opacidade ${logo.toFixed(2)})`);
    await irNaAbertura(page, 1);
    await page.waitForTimeout(400);
    const saida = await page.locator(".cena-saida").evaluate((el) => +getComputedStyle(el).opacity);
    confere(saida > 0.95, `cena esmaece para o creme no fim (opacidade ${saida.toFixed(2)})`);

    // Longe da abertura, os quadros abertos são fechados (memória livre para o resto da página).
    await irPara(page, "#cardapio");
    await page.waitForTimeout(600);
    confere((await estado(page)).abertos === 0, "longe da abertura: nenhum quadro aberto");

    // Cardápio
    await page.getByRole("tab", { name: "Gelados" }).click();
    confere(await page.getByRole("tabpanel").getByText("Cold brew").isVisible(), "aba Gelados mostra Cold brew");
    confere(/R\$ \d/.test(await page.getByRole("tabpanel").locator(".preco").first().innerText()), "preço formatado");
    await page.getByRole("tab", { name: "Gelados" }).press("ArrowRight");
    confere(await page.evaluate(() => document.activeElement?.getAttribute("aria-selected")) === "true", "seta → leva o foco para a próxima aba, já ativa");

    // Cronômetro: Iniciar/Pausar/Iniciar não acelera; o anel anda enquanto conta
    await irPara(page, "#preparo");
    await page.getByRole("button", { name: "Espresso", exact: true }).click();
    const iniciar = page.getByRole("button", { name: "Iniciar" });
    await iniciar.click(); await page.getByRole("button", { name: "Pausar" }).click(); await iniciar.click();
    // O anel precisa andar durante a contagem, não só quando pausa: compara no mesmo quadro o valor desenhado
    // (estilo calculado) com o certo (atributo). Com transição no anel, o desenhado fica atrasado.
    const atraso = () => page.locator(".relogio .anel").evaluate(async (c) => {
      let pior = 0;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        pior = Math.max(pior, Math.abs(parseFloat(getComputedStyle(c).strokeDashoffset) - parseFloat(c.getAttribute("stroke-dashoffset"))));
      }
      return pior;
    });
    const anel = () => page.locator(".relogio .anel").evaluate((c) => parseFloat(getComputedStyle(c).strokeDashoffset));
    await page.waitForTimeout(300); const anel1 = await anel();
    const piorAtraso = await atraso(); // ~0,5 s
    await page.waitForTimeout(500); const anel2 = await anel();
    // Espresso: 30 s para a volta toda (339 de comprimento) = ~11 por segundo; em ~1 s, mais de 8.
    confere(anel1 - anel2 > 8 && piorAtraso < 0.5, `anel acompanha o tempo enquanto conta (${anel1.toFixed(1)} → ${anel2.toFixed(1)}, atraso máx. ${piorAtraso.toFixed(2)})`);
    await page.waitForTimeout(800); // ~2,1 s desde a partida
    const tempo = await page.locator("[data-tempo]").innerText();
    confere(tempo === "0:28" || tempo === "0:27", `cronômetro anda 1 s por segundo (${tempo})`);
    await page.getByRole("button", { name: "Zerar" }).click();
    confere(await page.locator("[data-tempo]").innerText() === "0:30", "Zerar volta a 0:30");
    await iniciar.click(); await page.waitForTimeout(1300);
    const depois = await page.locator("[data-tempo]").innerText();
    confere(depois === "0:29" || depois === "0:28", `depois de Zerar, recomeça do zero (${depois})`);
    await page.getByRole("button", { name: "Zerar" }).click();
    confere(await page.locator("[data-ficha]:not([hidden])").count() === 1, "só a ficha do método escolhido aparece");

    // Quiz
    await irPara(page, "#quiz");
    await page.getByRole("button", { name: "Próxima" }).click();
    confere(await page.getByRole("alert").filter({ hasText: "Escolha uma opção" }).isVisible(), "quiz exige resposta");
    for (const op of ["Cedo e cheia de energia", "Torta de limão", "Coado, puro, sem açúcar"]) {
      await page.getByRole("button", { name: op }).click(); await page.getByRole("button", { name: "Próxima" }).click();
      if (op === "Cedo e cheia de energia")
        confere(await page.evaluate(() => document.activeElement?.tagName) === "H3", "depois de Próxima, o foco vai para o título da nova pergunta");
    }
    await page.getByRole("button", { name: "Sítio na serra, rede e fogão a lenha" }).click();
    await page.getByRole("button", { name: "Ver resultado" }).click();
    confere(await page.locator("#quiz").getByRole("heading", { name: "Pedra Branca" }).isVisible(), "quiz b,b,b,a → Pedra Branca");
    confere(await page.evaluate(() => document.activeElement?.tagName) === "H3", "depois de Ver resultado, o foco vai para o título do resultado");
    await page.locator("#quiz").getByRole("button", { name: "Refazer" }).click();
    confere(await page.getByText("Pergunta 1 de 4").isVisible(), "Refazer volta para a primeira pergunta");

    // WhatsApp
    const href = await page.locator("#visite").getByRole("link", { name: "Pedir pelo WhatsApp" }).getAttribute("href");
    confere(href.startsWith("https://wa.me/5585000000000?text=Ol%C3%A1"), "link do WhatsApp com mensagem");

    // Newsletter
    await irPara(page, "footer");
    const campo = page.getByLabel("Seu e-mail");
    confere(await campo.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)) >= 16, "campo de e-mail com letra de 16 px ou mais (sem zoom no iPhone)");
    await campo.fill("ana"); await page.getByRole("button", { name: "Assinar" }).click();
    confere(await page.getByRole("alert").filter({ hasText: "e-mail válido" }).isVisible(), "newsletter recusa e-mail inválido");
    await campo.fill(" Ana@Ex.com "); await page.getByRole("button", { name: "Assinar" }).click();
    confere(await page.getByText("Inscrito!").isVisible(), "newsletter aceita e agradece");
    confere((await page.getByRole("status").innerText()).includes("Inscrito!"), "a região de status da newsletter anuncia 'Inscrito!'");

    if (celular) {
      // Fim da página não fica embaixo da barra
      await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
      const cobre = await page.evaluate(() => document.querySelector(".barra").getBoundingClientRect().top - document.querySelector(".rodape small").getBoundingClientRect().bottom);
      confere(cobre >= 0, `barra de baixo não cobre o fim do rodapé (folga ${cobre.toFixed(0)} px)`);

      // Alvos de toque de 48 px (botões, abas, opções, links-botão)
      const pequenos = await page.evaluate(() => [...document.querySelectorAll(".botao, .aba, .opcao, .barra-secoes, .topo-logo")]
        .filter((el) => el.offsetParent !== null).map((el) => [el.textContent.trim().slice(0, 20), Math.round(el.getBoundingClientRect().height)])
        .filter(([, h]) => h < 48));
      confere(pequenos.length === 0, `alvos de toque com 48 px ou mais ${pequenos.length ? JSON.stringify(pequenos) : ""}`);

      // Gaveta de seções
      await page.getByRole("button", { name: "Seções" }).click();
      const gaveta = page.getByRole("dialog", { name: "Seções" });
      await gaveta.waitFor({ state: "visible" });
      confere(await gaveta.isVisible(), "Seções abre a gaveta");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      confere(!(await gaveta.isVisible()), "Esc fecha a gaveta");
      await page.getByRole("button", { name: "Seções" }).click();
      await gaveta.getByRole("link", { name: "Quiz" }).click();
      await page.waitForTimeout(1200);
      const quizTopo = await page.locator("#quiz").evaluate((el) => el.getBoundingClientRect().top);
      confere(!(await gaveta.isVisible()) && Math.abs(quizTopo) < 4, `link da gaveta fecha e leva até a seção (topo em ${quizTopo.toFixed(0)} px)`);
    } else {
      await page.locator(".topo-nav").getByRole("link", { name: "Clube" }).click();
      await page.waitForTimeout(1200);
      const clubeTopo = await page.locator("#clube").evaluate((el) => el.getBoundingClientRect().top);
      confere(Math.abs(clubeTopo - 64) < 4, `menu do topo leva até a seção, logo abaixo do topo fixo (${clubeTopo.toFixed(0)} px)`);
    }

    confere(erros.length === 0, `sem erros no console ${erros.length ? JSON.stringify(erros) : ""}`);
    await ctx.close();
  }

  console.log("\ncelular deitado e girando");
  {
    const { ctx, page, erros } = await pagina(browser, { viewport: { width: 915, height: 412 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
    // Conta os requestAnimationFrame pedidos pela página (para ver se o laço dorme com a cena parada).
    await page.addInitScript(() => { const r = window.requestAnimationFrame.bind(window); window.__rafs = 0; window.requestAnimationFrame = (f) => { window.__rafs++; return r(f); }; });
    await page.goto(URL_BASE);
    await page.waitForFunction(() => document.getElementById("inicio").classList.contains("cena-pronta"), null, { timeout: 15000 }).catch(() => {});
    confere(await page.locator("#inicio").getAttribute("data-conjunto") === "computador", "deitado: quadros de paisagem");
    confere(await page.locator(".barra").isVisible(), "deitado: continua no layout de celular (barra de baixo)");
    let pior = 0;
    for (const p of [0.1, 0.4, 0.8, 0.3, 0.6]) {
      await irNaAbertura(page, p);
      for (let k = 0; k < 6; k++) { await page.waitForTimeout(50); pior = Math.max(pior, (await estado(page)).abertos); }
    }
    confere(pior <= 12, `deitado: no máximo 12 quadros grandes abertos (~70 MB), pior ${pior}`);
    await page.waitForTimeout(1500);
    const r0 = await page.evaluate(() => window.__rafs);
    await page.waitForTimeout(1000);
    const porSegundo = (await page.evaluate(() => window.__rafs)) - r0;
    confere(porSegundo < 5, `cena parada: o laço dorme (${porSegundo} quadros pedidos em 1 s)`);
    // Gira para em pé no meio da cena
    await page.setViewportSize({ width: 412, height: 915 });
    await page.waitForTimeout(400);
    confere(await page.locator("#inicio canvas").count() <= 2, "ao girar, no máximo o canvas antigo e o novo ao mesmo tempo");
    await irNaAbertura(page, 0.5);
    await page.waitForFunction(() => document.getElementById("inicio").dataset.conjunto === "celular", null, { timeout: 8000 }).catch(() => {});
    confere(await page.locator("#inicio").getAttribute("data-conjunto") === "celular" && await page.locator("#inicio canvas").count() === 1, "girou: troca para os quadros em pé e sobra um canvas só");
    await page.waitForTimeout(800);
    const e = await estado(page);
    confere(Math.abs(e.atual - quadroDaRolagem(0.5, 120)) < 1.5 && e.abertos <= 14, `girou: quadro certo (${e.atual.toFixed(1)}) e memória no teto (${e.abertos})`);
    // Girar duas vezes seguidas: sobra um canvas só
    await page.setViewportSize({ width: 915, height: 412 });
    await page.waitForTimeout(50);
    await page.setViewportSize({ width: 412, height: 915 });
    await page.waitForTimeout(2500);
    confere(await page.locator("#inicio canvas").count() === 1, `girar duas vezes seguidas: sobra um canvas só (${await page.locator("#inicio canvas").count()})`);
    // Girar lendo o Cardápio: a página não volta para o topo
    await irPara(page, "#cardapio");
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: 915, height: 412 });
    await page.waitForTimeout(500);
    await page.setViewportSize({ width: 412, height: 915 });
    await page.waitForTimeout(500);
    const cardapioTopo = await page.locator("#cardapio").evaluate((el) => el.getBoundingClientRect().top);
    confere(await page.evaluate(() => scrollY) > 1000 && Math.abs(cardapioTopo) < innerHeightAprox(), `girar lendo o Cardápio não volta para o topo (topo do Cardápio em ${cardapioTopo.toFixed(0)} px)`);
    await page.locator(".barra").waitFor({ state: "visible" });
    // Gaveta aberta: a página não rola por trás
    await page.getByRole("button", { name: "Seções" }).click();
    await page.getByRole("dialog", { name: "Seções" }).waitFor({ state: "visible" });
    const antes = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);
    confere(await page.evaluate(() => scrollY) === antes, "gaveta aberta: a página não rola por trás");
    await page.keyboard.press("Escape");
    confere(erros.length === 0, `sem erros no console ${erros.length ? JSON.stringify(erros) : ""}`);
    await ctx.close();
  }

  console.log("\nreduzir movimento");
  {
    const { ctx, page } = await pagina(browser, { reducedMotion: "reduce", viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
    const quadros = [];
    page.on("request", (r) => { if (r.url().includes("/abertura/")) quadros.push(r.url().split("/abertura/")[1]); });
    await page.goto(URL_BASE);
    await page.waitForTimeout(2500);
    confere(await page.locator("#inicio").getAttribute("data-modo") === "parado", "abertura parada");
    confere(quadros.filter((q) => !q.endsWith("001.webp") && !q.endsWith("120.webp")).length === 0, `não baixa a sequência (${quadros.join(", ")})`);
    confere(await page.locator(".frase").evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === "1")), "as três frases aparecem paradas");
    confere(await page.locator("#origem .lotes").evaluate((el) => getComputedStyle(el).opacity) === "1", "conteúdo visível sem animação");
    await ctx.close();
  }

  console.log("\nsem JavaScript");
  for (const [nome, vp] of [["computador", { width: 1440, height: 900 }], ["celular", { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vp, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(URL_BASE);
    for (const t of ["Cold brew", "Pão de queijo", "Espresso", "V60 Boa Sombra"])
      confere(await page.locator("#cardapio .itens").getByText(t, { exact: false }).first().isVisible(), `sem JS (${nome}): cardápio mostra "${t}"`);
    for (const t of ["1:15", "1:16", "1:2"])
      confere(await page.locator("#preparo .preparo-fichas").getByText(t, { exact: true }).isVisible(), `sem JS (${nome}): ficha de preparo com ${t}`);
    for (const t of ["Espresso da serra", "Leite vaporizado", "Arte na xícara"]) {
      const f = page.locator(".frase", { hasText: t });
      confere(await f.isVisible() && await f.evaluate((el) => getComputedStyle(el).opacity) === "1", `sem JS (${nome}): frase "${t}" legível`);
    }
    confere(await page.getByText("O quiz precisa de JavaScript ligado.").isVisible(), `sem JS (${nome}): aviso do quiz`);
    if (nome === "celular") {
      const link = page.locator(".barra").getByRole("link", { name: "Seções" });
      confere(await link.isVisible() && (await link.getAttribute("href")) === "#secoes-rodape", "sem JS (celular): Seções leva à lista de seções do rodapé");
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  parar();
}
process.exit(resultado() ? 1 : 0);
