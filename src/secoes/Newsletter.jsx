import { useState } from "react";
import { emailValido } from "../dominio/email.js";

// Só visual: valida e agradece, não envia nada.
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const enviar = (e) => {
    e.preventDefault();
    if (!emailValido(email)) { setErro("Digite um e-mail válido, como nome@exemplo.com"); return; }
    setOk(true);
  };
  if (ok) return <p className="news-ok" role="status">Inscrito! Você vai saber dos lotes novos primeiro.</p>;
  return (
    <form className="news" onSubmit={enviar} noValidate>
      <label htmlFor="news-email">Seu e-mail</label>
      <div className="news-linha">
        <input id="news-email" type="email" autoComplete="email" value={email} aria-invalid={!!erro} aria-describedby={erro ? "news-erro" : undefined}
          onChange={(e) => { setEmail(e.target.value); setErro(""); }} />
        <button className="botao" type="submit">Assinar</button>
      </div>
      {erro && <p id="news-erro" role="alert" className="erro">{erro}</p>}
    </form>
  );
}
