// Roteiro da página inteira: rode depois de "npm run build" com "node e2e/pagina.mjs".
import { servidor, navegador, pagina, confere, resultado, URL_BASE } from "./util.mjs";

// Ilhas com client:visible só ganham vida depois de entrar na tela: espera a hidratação antes de clicar.
const hidratada = (page, seletor) => page.locator(`${seletor} astro-island:not([ssr])`).first().waitFor({ state: "attached" });

const parar = await servidor();
const browser = await navegador();
try {
  for (const [nome, opts] of [["computador", {}], ["celular", { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }]]) {
    console.log(`\n${nome}`);
    const { ctx, page, erros } = await pagina(browser, opts);
    await page.goto(URL_BASE);
    confere(await page.locator("#entrada").count() === 0, "entrada do grão não aparece no navegador automatizado");
    confere(await page.locator('meta[name="robots"][content="noindex"]').count() === 1, "noindex presente");
    for (const id of ["origem", "cardapio", "preparo", "quiz", "clube", "galeria", "visite"])
      confere(await page.locator(`#${id}`).count() === 1, `seção #${id}`);

    // Galeria sem buraco: a última foto termina na borda direita da grade.
    const buraco = await page.evaluate(() => {
      const g = document.querySelector(".galeria"); const ul = g.lastElementChild;
      return Math.abs(g.getBoundingClientRect().right - ul.getBoundingClientRect().right);
    });
    confere(buraco < 2, `galeria sem buraco na última linha (sobra ${buraco.toFixed(0)} px)`);

    // Nada estoura a largura
    const largura = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    confere(largura[0] <= largura[1], `sem rolagem lateral (${largura[0]} <= ${largura[1]})`);

    // Abertura: rola até o fim da cena e vê o logo
    await page.evaluate(() => scrollTo(0, innerHeight * 2.9));
    await page.waitForTimeout(800);
    confere(await page.locator(".abertura-logo.visivel").count() === 1, "logo aparece no fim da abertura");

    // Cardápio
    await page.locator("#cardapio").scrollIntoViewIfNeeded();
    await hidratada(page, "#cardapio");
    await page.getByRole("tab", { name: "Gelados" }).click();
    confere(await page.getByRole("tabpanel").getByText("Cold brew").isVisible(), "aba Gelados mostra Cold brew");
    confere(/R\$ \d/.test(await page.getByRole("tabpanel").locator(".preco").first().innerText()), "preço formatado");

    // Cronômetro: Iniciar 3 vezes não acelera
    await page.locator("#preparo").scrollIntoViewIfNeeded();
    await hidratada(page, "#preparo");
    await page.getByRole("button", { name: "Espresso", exact: true }).click();
    const iniciar = page.getByRole("button", { name: "Iniciar" });
    await iniciar.click(); await page.getByRole("button", { name: "Pausar" }).click(); await iniciar.click();
    // O anel precisa andar durante a contagem, não só quando pausa (o valor desenhado, não só o atributo).
    // Mede no mesmo quadro o valor desenhado (estilo calculado) e o valor certo (atributo) várias vezes:
    // com transição no anel, o desenhado fica atrasado em relação ao certo.
    const atraso = () => page.locator(".relogio circle").nth(1).evaluate(async (c) => {
      let pior = 0;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        pior = Math.max(pior, Math.abs(parseFloat(getComputedStyle(c).strokeDashoffset) - parseFloat(c.getAttribute("stroke-dashoffset"))));
      }
      return pior;
    });
    const anel = () => page.locator(".relogio circle").nth(1).evaluate((c) => parseFloat(getComputedStyle(c).strokeDashoffset));
    await page.waitForTimeout(400); const anel1 = await anel();
    const piorAtraso = await atraso();
    await page.waitForTimeout(800); const anel2 = await anel();
    confere(anel1 - anel2 > 10 && piorAtraso < 0.5, `anel acompanha o tempo enquanto conta (${anel1.toFixed(1)} → ${anel2.toFixed(1)}, atraso máx. ${piorAtraso.toFixed(2)})`);
    await page.waitForTimeout(300);
    const tempo = await page.locator("[data-tempo]").innerText();
    confere(tempo === "0:28" || tempo === "0:27", `cronômetro anda 1 s por segundo (${tempo})`);
    await page.getByRole("button", { name: "Zerar" }).click();
    confere(await page.locator("[data-tempo]").innerText() === "0:30", "Zerar volta a 0:30");
    await iniciar.click(); await page.waitForTimeout(1300); // 1000 ms exatos podem ainda mostrar 0:30 (arredonda para cima)
    const depois = await page.locator("[data-tempo]").innerText();
    confere(depois === "0:29" || depois === "0:28", `depois de Zerar, recomeça do zero (${depois})`);
    await page.getByRole("button", { name: "Zerar" }).click();

    // Quiz
    await page.locator("#quiz").scrollIntoViewIfNeeded();
    await hidratada(page, "#quiz");
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

    // WhatsApp
    const href = await page.getByRole("link", { name: "Pedir pelo WhatsApp" }).getAttribute("href");
    confere(href.startsWith("https://wa.me/5585000000000?text=Ol%C3%A1"), "link do WhatsApp com mensagem");

    // Newsletter
    await page.locator("footer").scrollIntoViewIfNeeded();
    await hidratada(page, "footer");
    const campo = page.getByLabel("Seu e-mail");
    await campo.fill("ana"); await page.getByRole("button", { name: "Assinar" }).click();
    confere(await page.getByRole("alert").filter({ hasText: "e-mail válido" }).isVisible(), "newsletter recusa e-mail inválido");
    await campo.fill(" Ana@Ex.com "); await page.getByRole("button", { name: "Assinar" }).click();
    confere(await page.getByText("Inscrito!").isVisible(), "newsletter aceita e agradece");
    confere((await page.getByRole("status").innerText()).includes("Inscrito!"), "a região de status da newsletter anuncia 'Inscrito!'");

    confere(erros.length === 0, `sem erros no console ${erros.length ? JSON.stringify(erros) : ""}`);
    await page.screenshot({ path: `_shots/${nome}.png`, fullPage: true });
    await ctx.close();
  }

  console.log("\nreduzir movimento");
  const { ctx, page } = await pagina(browser, { reducedMotion: "reduce" });
  const pedidos = [];
  page.on("request", (r) => pedidos.push(r.url()));
  await page.goto(URL_BASE);
  await page.waitForTimeout(2500);
  confere(await page.locator("#entrada").count() === 0, "reduzir movimento: sem entrada");
  confere(!pedidos.some((u) => u.includes("/seq/v60/0002.webp")), "reduzir movimento: não baixa a sequência de quadros");
  await page.waitForFunction(() => document.querySelectorAll(".frase.visivel").length === 3, null, { timeout: 5000 }).catch(() => {});
  confere(await page.locator(".frase.visivel").count() === 3, "as três frases aparecem paradas");
  confere(await page.locator("#origem .lote").first().evaluate((el) => getComputedStyle(el).opacity) === "1", "conteúdo visível sem animação");
  await ctx.close();

  console.log("\nsem JavaScript");
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(URL_BASE);
    confere(!(await page.locator("#entrada").isVisible()), "sem JS: a entrada não cobre a página");
    for (const t of ["Cold brew", "Pão de queijo", "Espresso", "V60 Boa Sombra"])
      confere(await page.locator("#cardapio").getByText(t, { exact: false }).first().isVisible(), `sem JS: cardápio mostra "${t}"`);
    for (const t of ["1:15", "1:16", "1:2"])
      confere(await page.locator("#preparo .preparo-fichas").getByText(t, { exact: true }).isVisible(), `sem JS: ficha de preparo com ${t}`);
    for (const t of ["Espresso da serra", "Leite vaporizado", "Arte na xícara"]) {
      const f = page.locator(".frase", { hasText: t });
      confere(await f.isVisible() && await f.evaluate((el) => getComputedStyle(el).opacity) === "1", `sem JS: frase "${t}" legível`);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  parar();
}
process.exit(resultado() ? 1 : 0);
