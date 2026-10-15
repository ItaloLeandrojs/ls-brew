export const emailValido = (texto) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(texto).trim());
