# Plano: LS Brew refeito do zero, celular primeiro (15/10/2026)

Pedido: "faça do zero, tanto para computador quanto para celular, utilizando todas as melhorias" (o Italo saiu e deixou o notebook aberto; decisões tomadas por mim estão marcadas com **Decidi** para ele revisar).

Base: `docs/pesquisa-celular.md`. Ficam iguais o conteúdo aprovado (textos, dados, fotos, marca, cores, letras, ordem das seções) e as regras já testadas (`src/dominio`, `src/dados`, testes de unidade). Muda o código das telas, do zero.

## Decisões

1. **Abertura:** quadros WebP num canvas, presos com `position: sticky` (sem GSAP). Janela de memória (celular até 14 quadros abertos, computador 24), abertura dos quadros fora da thread principal, mistura entre quadros vizinhos, carga do grosso para o fino. 120 quadros: celular 960×1280 (recorte aberto aprovado, com bordas esfumadas), computador 1600×900.
2. **Sem React e sem GSAP:** HTML pronto do servidor (legível sem JavaScript) e scripts pequenos por cima.
3. **Celular:** topo não fixo (só o logo); **barra de baixo fixa** na área do polegar com "Seções" (gaveta `<dialog>`) e "Pedir pelo WhatsApp". **Decidi.**
4. **Computador:** topo fixo com menu, sem desfoque (cor sólida).
5. **Sem a tela cheia de entrada com o grão** (piora o LCP; a abertura já é o momento da marca). **Decidi.**
6. **Espaço entre seções menor no celular** (64 px em vez de até 140 px) — pendência que ele tinha apontado.
7. **Galeria no celular em 3 colunas quadradas, estilo perfil do Instagram** (9 fotos = 3×3, sem buraco, ocupa 1/3 da altura de antes). **Decidi.**
8. **Lotes da origem no celular em carrossel deslizante** com o próximo card aparecendo na borda. **Decidi.**
9. **Abas do cardápio no celular numa linha deslizante** (sem quebrar em duas linhas).
10. Alvos de toque de 48 px, campos com 16 px, `viewport-fit=cover` e margens seguras, hover só com mouse.
11. Testes: e2e reescrito para a estrutura nova (celular 360, 390 e 412 de largura + computador), medição de quadros com CPU 6x e contagem de quadros abertos na memória.

## Ordem

1. Branch `refazer-celular`; extrair quadros (script em `scripts/quadros.sh`).
2. Regras puras novas com testes (`src/dominio/quadros.js`).
3. Motor da sequência (`src/cliente/sequencia.js`) e abertura.
4. Base, topo, barra de baixo e gaveta.
5. Seções, uma a uma, celular primeiro.
6. e2e, medição, varredura de prints quadro a quadro, Lighthouse, revisão independente.
7. Skill `ls-celular` com a pesquisa, o checklist e os erros.
8. **Não publicar sem o OK do Italo** (a branch fica pronta; publicar é um comando).
