# Pesquisa: desenvolvimento de site para celular (15/10/2026)

Pedido do Italo: "dá uma pesquisada geral sobre desenvolvimento para celular" e depois refazer o LS Brew do zero, para celular e computador, com todas as melhorias. Abaixo, o que a pesquisa mostrou e o que muda no site.

## 1. Por que a abertura ainda engasga no celular

| Técnica | O que acontece no celular | Fonte |
|---|---|---|
| Vídeo com `currentTime` mudando na rolagem (versão de hoje) | Cada busca no vídeo passa pelo decodificador do aparelho. No Android, a busca é lenta e o vídeo **não atualiza enquanto o dedo ainda está rolando**. Quadro-chave frequente ajuda, mas não resolve. | Teste do Abhishek Ghosh (OnePlus 5: "sem atualização de quadro durante a rolagem"); PR "Smooth scroll-driven scene on mobile" (moses); estudo da Codrops (OPTIKKA) |
| 120 imagens grandes abertas de uma vez (versão antiga) | Cada imagem 1080×1440 aberta ocupa ~6 MB: 120 dão ~750 MB. O celular joga quadros fora e abre de novo, e engasga mais no fim. | Medição nossa + MDN (frames decodificados são grandes) |
| **Quadros pequenos já decodificados (ImageBitmap) desenhados num canvas** | Desenhar um bitmap pronto é barato e não passa pelo decodificador de vídeo. É o que funcionou liso em celular nos testes publicados. | Ghosh (abordagens 2, 3 e 5 lisas no celular); PR moses; Apple usa canvas com quadros |

**Decisão:** a abertura nova usa quadros WebP pequenos num canvas, com três cuidados que faltavam antes:
1. **Janela de memória:** só ficam abertos os quadros perto da posição atual (no celular, até 14). O resto fica guardado comprimido (~17 KB cada). Memória máxima ~70 MB em vez de ~750 MB.
2. **Abrir fora da thread principal:** no Chrome, `fetch` → `blob` → `createImageBitmap(blob)` não trava a página; no Safari, `img.decode()` + `createImageBitmap(img)` (Web Performance Calendar 2025).
3. **Mistura entre quadros vizinhos:** desenha o quadro atual e o próximo por cima com transparência proporcional. Com isso o movimento fica contínuo mesmo com poucos quadros, e na rolagem rápida sempre há um quadro perto para mostrar.

Carga do mais grosso para o mais fino: primeiro e último quadro, depois um a cada 16, a cada 8, a cada 4… Assim qualquer posição tem um quadro próximo logo no começo.

## 2. Rolagem presa (pin) no celular

- No celular a rolagem roda numa thread separada do JavaScript. Um pin feito por JavaScript (GSAP `pin`) troca a seção para `position: fixed` com alguns milissegundos de atraso: a cena **pula** ao prender e soltar (documentação do GSAP, `normalizeScroll`).
- A barra de endereço que some e volta muda a altura da tela e faz o GSAP recalcular tudo no meio da cena (já sofremos isso).
- `normalizeScroll` resolve passando a rolagem para o JavaScript, mas é "experimental", tira a barra de rolagem e mexe na acessibilidade. A própria GSAP não recomenda por padrão.

**Decisão:** `position: sticky` do CSS no lugar do pin do GSAP. O navegador prende a cena na mesma thread da rolagem, sem pulo. O progresso é lido a cada quadro com `getBoundingClientRect()`. Sai o GSAP do site inteiro.

## 3. Altura da tela no celular

- `100dvh` muda quando a barra some (pulo). `100svh` deixa faixa quando a barra some. `100lvh` é fixo e grande (o que usamos).
- No Android ainda aparece uma faixa atrás da barra de gestos no começo: a folga de 6rem continua.
- Frases centralizadas na parte sempre visível: `padding-bottom: calc(100lvh - 100svh)`.
- Teclado: o Chrome (desde o 108) e o Firefox (132) só encolhem a "viewport visual" quando o teclado abre; nada fixo pula. Não precisamos de `interactive-widget`.

## 4. Toque, polegar e navegação

- Alvo de toque: **48×48 px** (Material) cobre também os 44 pt da Apple. Espaço de 8 px entre alvos.
- Área fácil do polegar: terço de baixo da tela. Cantos de cima são os mais difíceis.
- `viewport-fit=cover` + `env(safe-area-inset-*)` para nada ficar embaixo da barra de gestos ou do recorte da câmera (o `env()` vale 0 sem o `viewport-fit=cover`).
- Campos com letra de 16 px ou mais (o iPhone dá zoom em campo menor). Nunca bloquear o zoom.
- Âncoras: `scroll-margin-top` do tamanho do topo fixo.
- Hover só com `@media (hover: hover) and (pointer: fine)`.

**Decisão:** no celular o topo deixa de ser fixo (ganha 60 px de tela) e aparece uma **barra de baixo**, na área do polegar, com "Seções" (abre uma gaveta de baixo para cima, feita com `<dialog>`, que já prende o foco e fecha no Esc) e "Pedir pelo WhatsApp". No computador fica o topo fixo com o menu.

## 5. Velocidade no celular (Core Web Vitals)

- Metas: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS < 0,1, medidas no celular por padrão. O INP no celular costuma ser bem pior que no computador.
- Menos JavaScript = menos tarefas longas = INP melhor. Hoje o site leva React + GSAP só para abas, quiz, cronômetro e newsletter.
- Imagem principal: `fetchpriority="high"`, nunca `loading="lazy"`; o resto com `loading="lazy"`.
- `backdrop-filter` (desfoque) no topo pesa ao rolar no celular: o PR do moses tirou do celular pelo mesmo motivo.
- Tela cheia de carregamento (preloader) piora o LCP e é vista como antiquada em site comum (pesquisa de 14/10/2026).
- Lighthouse "celular" = CPU 4x mais lenta + rede 4G lenta simulada: serve para comparar versões, não substitui o aparelho de verdade.

**Decisão:** sem React e sem GSAP. As partes interativas viram HTML pronto do servidor (legível sem JavaScript) e JavaScript pequeno por cima. Sai a tela cheia de entrada com o grão. Topo sem desfoque.

## 6. Como testar sem o aparelho (e o limite disso)

- A emulação do navegador não emula o processador nem o decodificador de vídeo do celular: serve para layout, toque e regras, não prova que está liso (Microsoft Edge DevTools; DebugBear).
- Prova de verdade: o celular do Italo. Com cabo USB dá para ver o console do celular no `chrome://inspect` (sem instalar nada).
- No teste automático: medir tempo de cada quadro durante a rolagem com CPU 6x mais lenta, e contar quantos quadros abertos ficam na memória.

## Fontes

- [Playing with video scrubbing animations on the web (Abhishek Ghosh)](https://www.ghosh.dev/posts/playing-with-video-scrubbing-animations-on-the-web/)
- [Smooth scroll-driven scene on mobile (PR moses)](https://github.com/romuload/moses/pull/2)
- [Codrops: OPTIKKA, de vídeo HTML5 para sequência de quadros](https://tympanus.net/codrops/2025/10/16/creating-smooth-scroll-synchronized-animation-for-optikka-from-html5-video-to-frame-sequences/)
- [Web Performance Calendar 2025: imagem no canvas sem travar](https://calendar.perfplanet.com/2025/non-blocking-image-canvas/)
- [MDN: createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap) e [Using the WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API/Using_the_WebCodecs_API)
- [GSAP: normalizeScroll](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll()) e [fórum: pin no celular](https://gsap.com/community/forums/topic/34581-problem-with-pin-on-mobile-devices/)
- [Chrome: mudança no redimensionamento com teclado](https://developer.chrome.com/blog/viewport-resize-behavior)
- [Chrome: como reduziram o engasgo de rolagem no Android](https://blog.google/chromium/smoother-scrolling-how-we-halved-scroll-jank-in-chrome-on-android/)
- [5 mobile web papercuts (OpenReplay)](https://blog.openreplay.com/5-mobile-web-papercuts-fixes/)
- [web.dev: as formas mais eficazes de melhorar os Core Web Vitals](https://web.dev/articles/top-cwv)
- [Como funciona o throttling simulado do Lighthouse](https://calendar.perfplanet.com/2021/how-does-lighthouse-simulated-throttling-work/)
- [Edge DevTools: emulação de dispositivos](https://learn.microsoft.com/it-it/microsoft-edge/devtools-guide-chromium/device-mode) e [DebugBear: depurar sites no celular](https://www.debugbear.com/blog/debugging-mobile-websites)
