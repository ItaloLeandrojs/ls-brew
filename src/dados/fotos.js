// Fotos do Pexels aprovadas pelo Italo em 15/10/2026 (lista em docs/fotos-escolhidas.md).
// Arquivos em public/fotos, em WebP de 1200 px e uma cópia de 600 px (nome-600.webp) para telas pequenas.
export const versao600 = (arquivo) => arquivo.replace(/\.webp$/, "-600.webp");
export const FOTOS = [
  { arquivo: "01.webp", largura: 1200, altura: 1800, alt: "Cappuccino com latte art em forma de folha na mão do barista, ao lado da máquina de espresso", autor: "Zehra K.", link: "https://www.pexels.com/photo/close-up-of-latte-art-in-a-coffee-shop-29621584/" },
  { arquivo: "02.webp", largura: 1200, altura: 1800, alt: "Água quente caindo de uma chaleira de bico fino sobre o filtro de um café coado", autor: "Esra Erdem", link: "https://www.pexels.com/photo/close-up-of-brewing-coffee-19723762/" },
  { arquivo: "03.webp", largura: 1200, altura: 1800, alt: "Canto do salão à meia-luz, com abajur aceso, quadros na parede e mesas de madeira", autor: "Gül Işık", link: "https://www.pexels.com/photo/wall-in-cafe-at-night-20418285/" },
  { arquivo: "04.webp", largura: 1200, altura: 800, alt: "Pães de queijo dourados num cesto de vime, recém-saídos do forno", autor: "Giovanna Kamimura", link: "https://www.pexels.com/photo/delicious-brazilian-pao-de-queijo-in-basket-37778433/" },
  { arquivo: "05.webp", largura: 1200, altura: 798, alt: "Grãos de café torrados espalhados sobre um fundo preto", autor: "Moussa Idrissi", link: "https://www.pexels.com/photo/dark-coffee-beans-19162213/" },
  { arquivo: "06.webp", largura: 1200, altura: 1800, alt: "Leite vaporizado sendo despejado numa xícara de espresso segurada com as duas mãos", autor: "Alexey Demidov", link: "https://www.pexels.com/photo/pouring-milk-into-coffee-in-cup-10803610/" },
  { arquivo: "07.webp", largura: 1200, altura: 1800, alt: "Copo de café gelado com cubos de gelo sobre o balcão do café", autor: "Yuan Cao", link: "https://www.pexels.com/photo/refreshing-glass-of-iced-coffee-on-cafe-counter-28901490/" },
  { arquivo: "08.webp", largura: 1200, altura: 1800, alt: "Latte em caneca de vidro sobre um porta-copos, num ambiente escuro com luz quente ao fundo", autor: "Saim Gürses", link: "https://www.pexels.com/photo/a-cup-of-latte-on-a-coaster-6393542/" },
  { arquivo: "09.webp", largura: 1200, altura: 1800, alt: "Grãos de café girando dentro do torrador, com a haste de amostra de aço", autor: "cottonbro studio", link: "https://www.pexels.com/photo/black-and-brown-coffee-beans-4820680/" },
];

export const FOTO_ORIGEM = {
  arquivo: "origem.webp", largura: 1200, altura: 1600,
  alt: "Galho de cafeeiro com cerejas de café vermelhas e verdes, com a mata desfocada ao fundo",
  autor: "ØNSK Burrows", link: "https://www.pexels.com/photo/a-close-up-shot-of-coffee-cherries-7010603/",
};
