import { useEffect, useRef, useState } from "react";
import { emailValido } from "../dominio/email.js";

// Só visual: valida e agradece, não envia nada.
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const status = useRef(null);
  // O formulário some no sucesso (e leva o foco junto): o foco vai para a mensagem.
  useEffect(() => { if (ok) status.current?.focus(); }, [ok]);
  const enviar = (e) => {
    e.preventDefault();
    if (!emailValido(email)) { setErro("Digite um e-mail válido, como nome@exemplo.com"); return; }
    setOk(true);
  };
  return (
    <div>
      {!ok && (
        <form className="news" onSubmit={enviar} noValidate>
          <label htmlFor="news-email">Seu e-mail</label>
          <div className="news-linha">
            <input id="news-email" type="email" autoComplete="email" value={email} aria-invalid={!!erro} aria-describedby={erro ? "news-erro" : undefined}
              onChange={(e) => { setEmail(e.target.value); setErro(""); }} />
            <button className="botao" type="submit">Assinar</button>
          </div>
          {erro && <p id="news-erro" role="alert" className="erro">{erro}</p>}
        </form>
      )}
      {/* Sempre presente (vazia no começo): só assim o leitor de tela anuncia o texto quando ele entra. */}
      <p className="news-ok" role="status" tabIndex={-1} ref={status}>{ok ? "Inscrito! Você vai saber dos lotes novos primeiro." : ""}</p>
    </div>
  );
}
