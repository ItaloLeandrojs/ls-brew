// Link do WhatsApp com a mensagem pronta.
export function linkWhatsApp(numero, mensagem) {
  const digitos = String(numero).replace(/\D/g, "");
  if (!digitos) throw new Error("número vazio");
  const base = `https://wa.me/${digitos}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
