# LS Brew · especificação do site

Data: 15/10/2026 · Status: aguardando revisão do Italo

## 1. Objetivo

Site de cafeteria de café especial para o **portfólio** do Italo (Vitrine e LinkedIn). A
cafeteria é a própria marca **LS Brew**, não uma empresa fictícia com outro nome. O site precisa
mostrar duas coisas ao mesmo tempo:

- **impacto visual:** abertura cinematográfica guiada pela rolagem;
- **utilidade de negócio:** cardápio, origem, preparo, quiz, clube, endereço e pedido.

**Sucesso:** parecer o site de uma cafeteria real e bem feita. A abertura deve impressionar
logo na primeira tela. Tudo deve funcionar no celular. Metas: Lighthouse 100 em
acessibilidade e pelo menos 85 de desempenho no celular.

## 2. Marca (pronta)

Fica em `Desktop\LINKEDIN\ls-brew-marca\` (ver o README de lá).

- **Símbolo "Grão S":** o L é um canto em grafite (mesmo traço da Curva S da LS Dados). O S é
  o sulco vazado de um grão de café. Cores do site (alteração de 15/10, pedido do Italo): L e nome em café `#3B2A20` e grão `#A8743E` no fundo claro; L e nome em creme `#F6F0E7` e grão caramelo `#C08A4E` no fundo escuro. O azul LS saiu do logo.
- **Nome:** "LS" em Outfit 640 e "Brew" em Outfit 400, nas mesmas medidas do "LS Dados".
- **Arquivos:** versões clara, escura, grafite e branca; `favicon.svg`, que acompanha o tema
  do navegador; `apple-touch-icon-180.png`.

## 3. Identidade do site

| Item | Decisão |
|---|---|
| Fundo | creme `#F6F0E7` |
| Texto principal | café escuro `#3B2A20` |
| Destaque, botões | caramelo `#C08A4E` como fundo de botão, com texto `#3B2A20` (contraste 4,54:1; branco daria 3,01 e reprova) |
| Texto em tom caramelo | `#8A5A3B` (5,14:1 no creme). O caramelo `#C08A4E` nunca vai como texto no creme (2,65:1) |
| Cartões, divisórias | bege `#E8DBC8` |
| Azul LS | não é usado (o logo segue as cores do site) |
| Títulos | Fraunces (Google Fonts, OFL) |
| Textos | Outfit (OFL); preços com `tabular-nums` |
| Tema | só claro; a abertura é a única parte escura (vídeo) |

Contrastes já conferidos: texto `#3B2A20` no creme dá 12,05:1 e no bege dá 10,01:1. Os tons
de hover e de texto secundário seguem a mesma regra: toda combinação de texto passa no AA
(4,5:1), conferida com script na implementação.

## 4. Roteiro da página (uma página só)

1. **Abertura cinematográfica:**
   - vídeo real de banco gratuito: latte art sendo desenhada na xícara (Pexels 6769791, de 0 a 18 s);
   - o vídeo vira uma sequência de quadros controlada pela rolagem, com uma versão vertical
     para o celular;
   - três frases aparecem por cima: "Espresso da serra", "Leite vaporizado", "Arte na xícara" (o vídeo escolhido em 15/10 é o latte art V15 do Pexels);
   - no fim, o logo LS Brew se assenta.
2. **Origem dos grãos:**
   - café sombreado da Serra de Baturité (CE);
   - mapa ilustrado simples, cuja linha se desenha ao rolar;
   - 3 lotes com fazenda, altitude (o número conta até o valor), processo e notas de sabor.
3. **Cardápio:**
   - abas Coados, Espressos, Gelados e Para comer;
   - cada item com nome, descrição curta e preço; os cafés também com notas de sabor;
   - a troca de aba tem transição suave.
4. **Guia de preparo:**
   - V60, prensa francesa e espresso, cada um com proporção, moagem, temperatura e tempo;
   - cronômetro que funciona, com um anel que vai enchendo e etapas, como o "bloom" na V60.
5. **Quiz "Qual café combina com você?":**
   - 4 perguntas de múltipla escolha, que deslizam uma de cada vez;
   - o resultado indica um dos 3 lotes da seção 2, com o grão do logo;
   - dá para refazer.
6. **Clube de assinatura:**
   - 3 planos mensais, só visuais;
   - o botão abre o WhatsApp com a mensagem "Quero o plano X".
7. **Galeria:**
   - grade estilo Instagram com 9 fotos de banco gratuito (3 × 3 no computador, 2 colunas no
     celular);
   - a foto aproxima levemente ao passar o mouse.
8. **Visite a gente:**
   - endereço fictício em Fortaleza, horários e mapa estático (sem chave de API);
   - botão "Pedir pelo WhatsApp" com a mensagem pronta e número fictício.
9. **Rodapé:**
   - newsletter só visual: valida o e-mail e mostra "inscrito!", sem enviar nada;
   - redes, créditos (Pexels, fontes OFL) e "Projeto de portfólio LS".

**Entrada da página:** uma vez por visita (sessionStorage), as duas metades do grão do logo se
encontram enquanto a página carrega. Mesmo padrão da abertura de tijolos do LS Campo, com
`?abertura=1` para forçar no teste.

**Reduzir movimento:** com `prefers-reduced-motion`, nada se mexe e todo o conteúdo continua
visível. A abertura mostra um quadro fixo com as frases empilhadas.

## 5. Tecnologia

- **Base:** Astro, com ilhas React só onde há interação (quiz, cronômetro, abas do cardápio,
  newsletter).
- **Movimento:** skill ls-motion, com componentes React Bits baixados e adaptados quando fizer
  sentido. A taste-skill entra no visual.
- **Dados em `src/dados/`:** `cardapio.js`, `lotes.js`, `quiz.js`, `planos.js`, `preparo.js` e
  `contato.js` (endereço, horários, número). Mudar um preço é editar uma linha.
- **Lógica pura, testável e sem tela:** `src/dominio/`. Fica lá a pontuação do quiz, as etapas
  do cronômetro e o montador do link do WhatsApp.
- **Mídia:**
  - vídeo e fotos do Pexels, com os candidatos listados em `docs/candidatos-midia.md`;
  - **nada entra sem aprovação do Italo**;
  - os quadros da abertura ficam em WebP/AVIF, com tamanho pensado para telas de cerca de
    1900 px (lição do LS Campo);
  - os vídeos originais ficam fora do repositório.

## 6. Quando algo falha

| Situação | Comportamento |
|---|---|
| Quadros da abertura não carregam | foto parada (pôster) com as frases |
| JavaScript desligado | todo o texto, cardápio e contato legíveis; quiz e cronômetro somem com aviso curto |
| Navegador automatizado | não mostra a entrada do grão (testes iguais ao LS Campo) |
| E-mail inválido na newsletter | mensagem de erro ao lado do campo, sem avançar |
| Quiz sem resposta | não avança e mostra "Escolha uma opção" |

## 7. Testes

- **`npm test`:** pontuação do quiz (cada combinação cai num lote válido), etapas e tempo do
  cronômetro, link do WhatsApp (número e mensagem codificados certos) e integridade dos dados
  (todo item com preço, todo lote do quiz existe).
- **e2e no Edge (Playwright):** um roteiro por seção, no computador e no celular (375 px).
- **Lighthouse local:** 100 em acessibilidade e pelo menos 85 de desempenho no celular, antes
  de publicar.
- **Conferência visual:** prints de cada seção comparados com este documento.

## 8. Publicação

- **Pasta:** `Desktop\LINKEDIN\ls-brew`.
- **Repositório:** público, `ItaloLeandrojs/ls-brew`.
- **Endereço:** GitHub Pages em `italoleandrojs.github.io/ls-brew/`.
- **Google:** começa com noindex (`INDEXAR = false`) até o Italo liberar.
- **Compartilhamento:** prévia `og.jpg` de 1200 × 630 com o logo e um quadro da abertura.

## 9. Fora do escopo

Pagamento ou assinatura real, envio real da newsletter, cadastro, versão em inglês, contador de
visitas, várias páginas. Podem virar etapas depois.
