// Cada opção aponta para o lote que combina com ela (sombra, pedra ou pico).
export const PERGUNTAS = [
  { id: "manha", texto: "Como é a sua manhã ideal?", opcoes: [
    { id: "a", texto: "Calma, com um pão quentinho", lote: "sombra" },
    { id: "b", texto: "Cedo e cheia de energia", lote: "pedra" },
    { id: "c", texto: "Sem rotina, cada dia uma coisa", lote: "pico" } ] },
  { id: "doce", texto: "Qual sobremesa você escolhe?", opcoes: [
    { id: "a", texto: "Brigadeiro", lote: "sombra" },
    { id: "b", texto: "Torta de limão", lote: "pedra" },
    { id: "c", texto: "Cheesecake de frutas vermelhas", lote: "pico" } ] },
  { id: "preparo", texto: "Como você prefere tomar café?", opcoes: [
    { id: "a", texto: "Com leite, bem cremoso", lote: "sombra" },
    { id: "b", texto: "Coado, puro, sem açúcar", lote: "pedra" },
    { id: "c", texto: "Quero provar algo diferente", lote: "pico" } ] },
  { id: "lugar", texto: "Um lugar para o fim de semana?", opcoes: [
    { id: "a", texto: "Sítio na serra, rede e fogão a lenha", lote: "sombra" },
    { id: "b", texto: "Praia logo cedo", lote: "pedra" },
    { id: "c", texto: "Uma cidade que eu não conheço", lote: "pico" } ] },
];
