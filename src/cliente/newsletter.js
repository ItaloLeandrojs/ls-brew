// Newsletter (só visual): valida e agradece. O formulário some no sucesso e o foco vai para a mensagem.
import { emailValido } from "../dominio/email.js";

export function iniciarNewsletter(form, ok) {
  if (!form || !ok) return;
  const campo = form.querySelector("input");
  const erro = form.querySelector(".erro");
  const limpar = () => { erro.textContent = ""; campo.removeAttribute("aria-invalid"); campo.removeAttribute("aria-describedby"); };
  campo.addEventListener("input", limpar);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!emailValido(campo.value)) {
      erro.textContent = "Digite um e-mail válido, como nome@exemplo.com";
      campo.setAttribute("aria-invalid", "true");
      campo.setAttribute("aria-describedby", "news-erro");
      return;
    }
    limpar();
    form.hidden = true;
    ok.textContent = "Inscrito! Você vai saber dos lotes novos primeiro.";
    ok.focus();
  });
}
