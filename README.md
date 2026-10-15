# LS Brew

Site de uma cafeteria de café especial (Astro 7, uma página, em português do Brasil), feito **celular primeiro**: o HTML vem pronto do servidor e scripts pequenos fazem o resto (sem React e sem GSAP). A pesquisa que guiou a versão de 15/10/2026 está em `docs/pesquisa-celular.md`. É um projeto de portfólio: todos os dados são fictícios (veja `AVISOS.md`).

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento
npm test         # testes unitários (vitest)
npm run build && npm run e2e   # testes de navegador, depois do build
```

## Onde mexer no conteúdo

Tudo em `src/dados/` (cardápio, lotes, planos, preparo, quiz, contato). Endereço, bairro e horários ficam em `src/dados/contato.js`; o número de WhatsApp fica em `src/config.js`.

## Abertura (quadros no canvas, presos com sticky)

A abertura são 120 quadros WebP desenhados num `<canvas>` conforme a pessoa rola (`src/cliente/sequencia.js` e `src/cliente/abertura.js`; regras puras e testadas em `src/dominio/quadros.js`). Já foi vídeo controlado pela rolagem e, antes, 120 imagens grandes: o vídeo engasgava no celular (cada busca passa pelo decodificador do aparelho) e as imagens grandes estouravam a memória.

- Vídeo de origem: latte art de K no Pexels (https://www.pexels.com/video/making-latte-art-close-up-6769791/), trecho de **3,5 a 17,3 s**, em 2560 × 1440. Fica fora do repositório, em `_midia/v15-latte.mp4`.
- `public/abertura/celular/`: 960 × 1280 (recorte aberto 3:4 com bordas de cima e de baixo esfumando no escuro), ~2,6 MB. Usado em tela **em pé**.
- `public/abertura/computador/`: 1600 × 900, ~2,9 MB. Usado em tela **deitada**.
- Gerar de novo: `bash scripts/quadros.sh` (precisa de ffmpeg).
- Como não engasga: a cena fica presa com `position: sticky` (o navegador prende, sem pulo); só os quadros perto da posição ficam abertos na memória (14 no celular, 24 no computador); os quadros abrem fora da thread principal; entre dois quadros o seguinte é desenhado por cima com transparência; o download começa depois da primeira pintura, com prioridade baixa, do grosso para o fino.
- Roteiro: frases em 0–25–50–72%, logo de 72% em diante, a animação termina em 90% e de 90% a 100% a parte de baixo esmaece para o creme.
- Reduzir movimento ou economia de dados: imagem parada (`120.webp`) e as frases juntas, sem baixar a sequência.

## Celular

- Topo não fixo (só o logo, por cima da abertura). Barra fixa embaixo, na área do polegar: "Seções" abre uma gaveta (`<dialog>`) e "Pedir pelo WhatsApp".
- Alvos de toque de 48 px, campo de e-mail com 16 px, `viewport-fit=cover` com margens seguras, hover só com mouse.
- Galeria em 3 × 3 (como um perfil do Instagram), lotes em carrossel deslizante, abas do cardápio numa linha deslizante.
- e2e (`npm run e2e`) roda em computador, Android (412 × 915), Android pequeno (360 × 800) e iPhone (390 × 844), mais "reduzir movimento" e sem JavaScript.

## Fotos

Galeria (9 fotos) e foto da origem: WebP de 1200 px em `public/fotos`, dados e créditos em `src/dados/fotos.js`, lista em `docs/fotos-escolhidas.md`. Os originais ficam em `_midia/fotos` (fora do git).

## Prévia de compartilhamento

`public/og.jpg` (1200 × 630) é o quadro final da abertura, com o logo sobre o latte art. Se a abertura mudar, gere de novo com um print de 1200 × 630 no fim da rolagem da abertura, sem o topo.

## Desempenho (Lighthouse local, 15/10/2026, versão celular primeiro)

| | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Celular | 93 a 99 (LCP 2,1 s) | 100 | 82 | 66 |
| Computador | 100 (LCP 0,5 s) | 100 | 81 | 66 |

Antes da versão nova: celular 90 local e 86 a 88 no ar. Medido sem o script que o antivírus da máquina injeta nas páginas. Boas práticas abaixo de 100 é o aviso de "sem HTTPS" do servidor local; no GitHub Pages o site é HTTPS. SEO 66 é o `noindex`, de propósito.

Teste de fluidez (`_shots/medir-abertura.mjs`, rolagem de dedo simulada, CPU 6x mais lenta): mediana de 17 a 19 ms por quadro de tela, o canvas redesenha em todos, nenhum quadro longo (> 50 ms) de script. A emulação não reproduz a placa de vídeo do celular: a prova final é no aparelho.

## Como publicar

```bash
npm run publicar
```

Roda os testes, gera o site com base `/ls-brew/` e envia para a branch `gh-pages` (GitHub Pages). O script se recusa a publicar se faltar algum dos 120 quadros (celular e computador) no git, sem o `og.jpg` ou com mudanças não commitadas. Endereço final: https://italoleandrojs.github.io/ls-brew/

## Como liberar o Google

O site nasce com `noindex`. Para liberar, troque `INDEXAR = true` em `src/config.js` e ajuste o teste em `tests/config.test.js`.

## Créditos

- Vídeo (abertura) e fotos: [Pexels](https://www.pexels.com/). Autor e link de cada foto estão em `src/dados/fotos.js` e aparecem no site, embaixo da galeria; vídeo da abertura de K (link acima).
- Fontes: Fraunces e Outfit, licença SIL OFL.
- Marca: pasta `../ls-brew-marca`.
