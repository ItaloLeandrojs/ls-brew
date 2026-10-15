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

## Abertura em vídeo (quadros)

A abertura usa uma sequência de quadros em `public/seq/`.

- Vídeo: latte art de K no Pexels (https://www.pexels.com/video/making-latte-art-close-up-6769791/), trecho de 0 a 18 s, baixado em 2560 × 1440. O original fica fora do repositório, em `_midia/`.
- Computador: 120 quadros de 1920 px em `public/seq/v60`.
- Celular: 120 quadros de 1080 × 1440 em `public/seq/v60-celular`, um recorte mais aberto do meio do vídeo (pega a borda da xícara), com as bordas de cima e de baixo esfumando no escuro da seção. No celular o quadro encaixa inteiro na largura (`ajusteCelular="contain"`).
- Para gerar de novo (precisa de ffmpeg e da skill ls-motion):

  ```bash
  ffmpeg -ss 0 -t 18 -i _midia/v15-latte.mp4 -an -c:v libx264 -crf 16 -pix_fmt yuv420p _midia/v15-trecho.mp4
  ffmpeg -i _midia/v15-trecho.mp4 -vf "crop=1080:1440:740:0,format=gbrp,geq=r='26+(r(X,Y)-26)*min(1,min(Y,H-Y)/(0.22*H))':g='18+(g(X,Y)-18)*min(1,min(Y,H-Y)/(0.22*H))':b='13+(b(X,Y)-13)*min(1,min(Y,H-Y)/(0.22*H))',format=yuv420p" -an -c:v libx264 -crf 12 -colorspace bt709 -color_primaries bt709 -color_trc bt709 _midia/v15-celular-aberto.mp4
  node ~/.claude/skills/ls-motion/scripts/extrair-quadros.mjs _midia/v15-trecho.mp4 public/seq/v60 --quadros 120 --largura 1920 --qualidade 72
  node ~/.claude/skills/ls-motion/scripts/extrair-quadros.mjs _midia/v15-celular-aberto.mp4 public/seq/v60-celular --quadros 120 --largura 1080 --qualidade 70
  ```

- `bash scripts/quadros-teste.sh` gera quadros numerados só para testar; nunca publique com eles.

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
