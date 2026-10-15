// A entrada do grão aparece uma vez por visita; testes automáticos não a veem, a não ser com ?abertura=1.
export const deveMostrarEntrada = ({ visto, automatizado, forcar }) => forcar || (!visto && !automatizado);
