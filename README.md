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

Tudo em `src/dados/` (cardápio, lotes, planos, preparo, quiz, contato). Endereço e telefone ficam em `src/dados/contato.js`.

## Abertura em vídeo (quadros)

A abertura usa uma sequência de quadros em `public/seq/`.

- Hoje ela usa **quadros de teste** (`bash scripts/quadros-teste.sh`). Por isso `public/seq/` está no `.gitignore` **somente enquanto houver quadros de teste**.
- O vídeo real do Pexels ainda será escolhido pelo Italo: veja os candidatos em `docs/candidatos-midia.md`.
- Depois da escolha, gere os quadros reais (plano da Task 11, Step 4), **remova a linha `public/seq/` do `.gitignore`** e faça commit dos quadros. Vídeos originais ficam fora do repositório, em `_midia/`.

## Pendências

- Galeria de fotos: aguardando a escolha das fotos em `docs/candidatos-midia.md`.
- Imagem de compartilhamento `public/og.jpg` (1200 × 630): será gerada com os quadros reais.

## Como publicar

```bash
npm run publicar
```

Roda os testes, gera o site com base `/ls-brew/` e envia para a branch `gh-pages` (GitHub Pages). O script se recusa a publicar enquanto os quadros da abertura forem de teste ou não estiverem no git. Endereço final: https://italoleandrojs.github.io/ls-brew/

## Como liberar o Google

O site nasce com `noindex`. Para liberar, troque `INDEXAR = true` em `src/config.js` e ajuste o teste em `tests/config.test.js`.

## Créditos

- Vídeo e fotos: [Pexels](https://www.pexels.com/) (autor e link de cada item serão preenchidos aqui quando forem escolhidos).
- Fontes: Fraunces e Outfit, licença SIL OFL.
- Marca: pasta `../ls-brew-marca`.
