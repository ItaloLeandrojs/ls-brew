// Preço em centavos para "R$ 12,50" (o Intl põe um espaço especial que quebra a busca em testes e leitores).
const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatarPreco = (centavos) => fmt.format(centavos / 100).replace(/\s/g, " ");
