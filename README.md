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
- Celular: 120 quadros de 810 × 1440 em `public/seq/v60-celular`, recortados do meio do vídeo (não é o quadro do computador encolhido), para ficar nítido na tela vertical.
- Para gerar de novo (precisa de ffmpeg e da skill ls-motion):

  ```bash
  ffmpeg -ss 0 -t 18 -i _midia/v15-latte.mp4 -an -c:v libx264 -crf 16 -pix_fmt yuv420p _midia/v15-trecho.mp4
  ffmpeg -i _midia/v15-trecho.mp4 -vf "crop=810:1440:875:0" -an -c:v libx264 -crf 14 -pix_fmt yuv420p _midia/v15-trecho-vertical.mp4
  node ~/.claude/skills/ls-motion/scripts/extrair-quadros.mjs _midia/v15-trecho.mp4 public/seq/v60 --quadros 120 --largura 1920 --qualidade 72
  node ~/.claude/skills/ls-motion/scripts/extrair-quadros.mjs _midia/v15-trecho-vertical.mp4 public/seq/v60-celular --quadros 120 --largura 810 --qualidade 70
  ```

- `bash scripts/quadros-teste.sh` gera quadros numerados só para testar; nunca publique com eles.

## Pendências

- Galeria (9 fotos) e foto da origem: WebP de 1200 px em `public/fotos`, dados e créditos em `src/dados/fotos.js`, lista em `docs/fotos-escolhidas.md`.
- Imagem de compartilhamento `public/og.jpg` (1200 × 630): será gerada com os quadros reais.

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
