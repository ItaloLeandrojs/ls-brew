import { useCallback, useEffect, useState } from "react";
import ScrollSequence from "./ScrollSequence.jsx";
import { faseDaAbertura, FRASES } from "../dominio/abertura.js";

export default function AberturaCena({ base, quadros, logo }) {
  const [fase, setFase] = useState(0);
  const [reduz, setReduz] = useState(false);
  const [montado, setMontado] = useState(false); // antes de montar (HTML do servidor, sem JS) nada fica escondido do leitor de tela
  useEffect(() => { setReduz(matchMedia("(prefers-reduced-motion: reduce)").matches); setMontado(true); }, []);
  // Função estável: ScrollSequence a tem nas dependências e não pode recriar a rolagem a cada fase.
  const aoProgredir = useCallback((p) => setFase(faseDaAbertura(p)), []);
  return (
    <ScrollSequence pasta={`${base}seq/v60`} pastaCelular={`${base}seq/v60-celular`} quadros={quadros}
      poster={`${base}seq/v60/0001.webp`} posterCelular={`${base}seq/v60-celular/0001.webp`}
      posterReduz={`${base}seq/v60/${String(quadros).padStart(4, "0")}.webp`} rolagem={3} topo={0}
      alt="Latte art sendo desenhada numa xícara de café" className="abertura" onProgresso={aoProgredir}>
      <div className="abertura-texto">
        {reduz ? (
          <>{FRASES.map((f) => <p key={f} className="frase visivel">{f}</p>)}<img className="abertura-logo visivel" src={logo} alt="LS Brew" width="766" height="236" /></>
        ) : (
          <>
            {FRASES.map((f, i) => <p key={f} className={`frase ${fase === i ? "visivel" : ""}`} aria-hidden={montado && fase !== i}>{f}</p>)}
            <img className={`abertura-logo ${fase === 3 ? "visivel" : ""}`} src={logo} alt="LS Brew" width="766" height="236" aria-hidden={montado && fase !== 3} />
          </>
        )}
        <h1 className="sr">LS Brew · café especial da Serra de Baturité em Fortaleza</h1>
      </div>
    </ScrollSequence>
  );
}
