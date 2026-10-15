import { useCallback, useEffect, useRef, useState } from "react";
import ScrollVideo from "./ScrollVideo.jsx";
import { faseDaAbertura, saidaDaAbertura, FRASES } from "../dominio/abertura.js";

export default function AberturaCena({ base, logo }) {
  const [fase, setFase] = useState(0);
  const [reduz, setReduz] = useState(false);
  const [montado, setMontado] = useState(false); // antes de montar (HTML do servidor, sem JS) nada fica escondido do leitor de tela
  const saida = useRef(null);
  useEffect(() => { setReduz(matchMedia("(prefers-reduced-motion: reduce)").matches); setMontado(true); }, []);
  // Função estável: ScrollVideo a tem nas dependências e não pode recriar a rolagem a cada fase.
  // A saída (esmaecer para o creme) muda a cada quadro no fim: vai direto no estilo, sem re-renderizar.
  const aoProgredir = useCallback((p) => {
    setFase(faseDaAbertura(p));
    if (saida.current) saida.current.style.opacity = String(saidaDaAbertura(p));
  }, []);
  const v = `${base}video/`;
  return (
    <ScrollVideo src={`${v}abertura.mp4`} srcCelular={`${v}abertura-celular.mp4`}
      poster={`${v}abertura-inicio.webp`} posterCelular={`${v}abertura-celular-inicio.webp`}
      posterReduz={`${v}abertura-fim.webp`} posterReduzCelular={`${v}abertura-celular-fim.webp`} rolagem={3}
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
      {!reduz && <div ref={saida} className="abertura-saida" aria-hidden="true" />}
    </ScrollVideo>
  );
}
