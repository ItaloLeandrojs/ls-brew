# LS Brew

Site de uma cafeteria de café especial (Astro 7 + React 19, uma página, em português do Brasil). É um projeto de portfólio: todos os dados são fictícios (veja `AVISOS.md`).

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento
npm test         # testes unitários (vitest)
npm run build && npm run e2e   # testes de navegador, depois do build
```

## Onde mexer no conteúdo

Tudo em `src/dados/` (cardápio, lotes, planos, preparo, quiz, contato). Endereço, bairro e horários ficam em `src/dados/contato.js`; o número de WhatsApp fica em `src/config.js`.

## Abertura em vídeo (controlado pela rolagem)

A abertura é um vídeo que avança conforme a pessoa rola (`src/secoes/ScrollVideo.jsx`), em `public/video/`. Antes eram 120 imagens; o vídeo é mais leve e não estoura a memória do celular.

- Vídeo: latte art de K no Pexels (https://www.pexels.com/video/making-latte-art-close-up-6769791/), trecho de **3,5 a 17,3 s** (o leite começa já caindo e termina quando o coração fecha), baixado em 2560 × 1440. O original fica fora do repositório, em `_midia/`.
- Computador: `abertura.mp4`, 1920 × 1080, quadro-chave a cada 8 quadros (≈1,9 MB).
- Celular: `abertura-celular.mp4`, 1080 × 1440, recorte aberto do meio com as bordas de cima e de baixo esfumando no escuro da seção, quadro-chave a cada 4 quadros (≈2,1 MB). No celular o vídeo aparece inteiro na largura.
- Capas: `abertura-inicio.webp` e `abertura-celular-inicio.webp` (por baixo até o vídeo pintar) e `-fim.webp` (modo reduzir movimento).
- Roteiro da rolagem (`src/dominio/abertura.js` e `rolagem-video.js`): frases em 0–25–50–72%, logo de 72% em diante, o vídeo termina em 90% e de 90% a 100% a parte de baixo esmaece para o creme da página.
- Para gerar de novo (precisa de ffmpeg; o quadro-chave frequente é o que deixa a busca rápida):

  ```bash
  X="colorprim=bt709:transfer=bt709:colormatrix=bt709"
  ffmpeg -ss 3.5 -to 17.3 -i _midia/v15-latte.mp4 -an -vf "scale=1920:-2" -c:v libx264 -crf 27 -preset slow -g 8 -keyint_min 8 -sc_threshold 0 -pix_fmt yuv420p -x264-params $X -movflags +faststart public/video/abertura.mp4
  ffmpeg -ss 3.5 -to 17.3 -i _midia/v15-latte.mp4 -an -vf "crop=1080:1440:740:0,format=gbrp,geq=r='26+(r(X,Y)-26)*min(1,min(Y,H-Y)/(0.22*H))':g='18+(g(X,Y)-18)*min(1,min(Y,H-Y)/(0.22*H))':b='13+(b(X,Y)-13)*min(1,min(Y,H-Y)/(0.22*H))',format=yuv420p" -c:v libx264 -crf 27 -preset slow -g 4 -keyint_min 4 -sc_threshold 0 -pix_fmt yuv420p -x264-params $X -movflags +faststart public/video/abertura-celular.mp4
  for v in abertura abertura-celular; do ffmpeg -i public/video/$v.mp4 -frames:v 1 -quality 80 public/video/$v-inicio.webp; ffmpeg -sseof -0.1 -i public/video/$v.mp4 -frames:v 1 -update 1 -quality 80 public/video/$v-fim.webp; done
  ```

## Fotos

Galeria (9 fotos) e foto da origem: WebP de 1200 px em `public/fotos`, dados e créditos em `src/dados/fotos.js`, lista em `docs/fotos-escolhidas.md`. Os originais ficam em `_midia/fotos` (fora do git).

## Prévia de compartilhamento

`public/og.jpg` (1200 × 630) é o quadro final da abertura, com o logo sobre o latte art. Se a abertura mudar, gere de novo com um print de 1200 × 630 no fim da rolagem da abertura, sem o topo.

## Desempenho (Lighthouse local, 15/10/2026)

| | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Celular | 90 | 100 | 81 | 66 |
| Computador | 100 | 100 | 81 | 66 |

Medido sem o script que o antivírus da máquina injeta nas páginas (com ele, o celular cai para cerca de 80). Boas práticas 81 é o aviso de "sem HTTPS" do servidor local; no GitHub Pages o site é HTTPS. SEO 66 é o `noindex`, de propósito.

## Como publicar

```bash
npm run publicar
```

Roda os testes, gera o site com base `/ls-brew/` e envia para a branch `gh-pages` (GitHub Pages). O script se recusa a publicar enquanto os quadros da abertura forem de teste ou não estiverem no git. Endereço final: https://italoleandrojs.github.io/ls-brew/

## Como liberar o Google

O site nasce com `noindex`. Para liberar, troque `INDEXAR = true` em `src/config.js` e ajuste o teste em `tests/config.test.js`.

## Créditos

- Vídeo e fotos: [Pexels](https://www.pexels.com/). Autor e link de cada foto estão em `src/dados/fotos.js` e aparecem no site, embaixo da galeria; vídeo da abertura de K (link acima).
- Fontes: Fraunces e Outfit, licença SIL OFL.
- Marca: pasta `../ls-brew-marca`.
