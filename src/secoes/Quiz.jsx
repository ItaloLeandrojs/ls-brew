import { useState } from "react";
import { PERGUNTAS } from "../dados/quiz.js";
import { LOTES } from "../dados/lotes.js";
import { resultadoQuiz } from "../dominio/quiz.js";
import simbolo from "../assets/logo/ls-brew-simbolo-fundo-claro.svg?url";

export default function Quiz() {
  const [passo, setPasso] = useState(0);
  const [resp, setResp] = useState({});
  const [erro, setErro] = useState("");
  const [lote, setLote] = useState(null);
  const p = PERGUNTAS[passo];

  const avancar = () => {
    if (!resp[p.id]) { setErro("Escolha uma opção"); return; }
    setErro("");
    if (passo < PERGUNTAS.length - 1) setPasso(passo + 1);
    else setLote(LOTES.find((l) => l.id === resultadoQuiz(PERGUNTAS, resp)));
  };
  const refazer = () => { setPasso(0); setResp({}); setLote(null); setErro(""); };

  if (lote) return (
    <div className="quiz-resultado" aria-live="polite">
      <img src={simbolo} alt="" width="72" height="72" />
      <p className="rotulo">Seu café é</p>
      <h3>{lote.nome}</h3>
      <p>{lote.descricao}</p>
      <p className="notas">{lote.notas.join(" · ")}</p>
      <div className="controles"><a className="botao" href="#cardapio">Ver no cardápio</a><button className="botao contorno" onClick={refazer}>Refazer</button></div>
    </div>
  );

  return (
    <fieldset key={p.id} className="quiz-pergunta">
      <legend><span className="rotulo">Pergunta {passo + 1} de {PERGUNTAS.length}</span><h3>{p.texto}</h3></legend>
      <div className="opcoes">
        {p.opcoes.map((o) => (
          <button key={o.id} type="button" className="opcao" aria-pressed={resp[p.id] === o.id}
            onClick={() => { setResp({ ...resp, [p.id]: o.id }); setErro(""); }}>{o.texto}</button>
        ))}
      </div>
      {erro && <p role="alert" className="erro">{erro}</p>}
      <button type="button" className="botao" onClick={avancar}>{passo < PERGUNTAS.length - 1 ? "Próxima" : "Ver resultado"}</button>
    </fieldset>
  );
}
