import { useEffect, useRef, useState } from "react";
import { METODOS } from "../dados/preparo.js";
import { estadoCronometro, formatarTempo, totalSegundos } from "../dominio/cronometro.js";

const R = 54, C = 2 * Math.PI * R;

export default function Preparo() {
  const [mi, setMi] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [ms, setMs] = useState(0);
  const acumulado = useRef(0);   // ms já contados antes da última partida
  const partida = useRef(0);     // performance.now() da última partida
  const zerou = useRef(false);   // Zerar com o relógio andando: a limpeza do efeito não deve somar tempo
  const raf = useRef(0);
  const m = METODOS[mi];
  const st = estadoCronometro(m.etapas, ms);

  // Um único laço por vez: o efeito depende só de "rodando" e se limpa sozinho.
  useEffect(() => {
    if (!rodando) return;
    partida.current = performance.now();
    const passo = (agora) => {
      const t = acumulado.current + (agora - partida.current);
      setMs(t);
      if (estadoCronometro(m.etapas, t).fim) { setRodando(false); return; }
      raf.current = requestAnimationFrame(passo);
    };
    raf.current = requestAnimationFrame(passo);
    return () => {
      cancelAnimationFrame(raf.current);
      if (zerou.current) zerou.current = false;
      else acumulado.current += performance.now() - partida.current;
    };
  }, [rodando, m.etapas]);

  const zerar = () => { if (rodando) zerou.current = true; setRodando(false); acumulado.current = 0; setMs(0); };
  const trocar = (i) => { zerar(); setMi(i); };
  const restanteTotal = Math.max(0, Math.ceil(totalSegundos(m.etapas) - ms / 1000));

  return (
    <div className="preparo">
      <div className="abas" role="group" aria-label="Método de preparo">
        {METODOS.map((x, i) => (
          <button key={x.id} className="aba" aria-pressed={i === mi} onClick={() => trocar(i)}>{x.nome}</button>
        ))}
      </div>
      <div className="preparo-grade">
        <dl className="ficha">
          <dt>Proporção</dt><dd>{m.proporcao}</dd>
          <dt>Dose</dt><dd>{m.dose}</dd>
          <dt>Água</dt><dd>{m.agua}</dd>
          <dt>Moagem</dt><dd>{m.moagem}</dd>
          <dt>Temperatura</dt><dd>{m.temperatura}</dd>
        </dl>
        <div className="relogio">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r={R} fill="none" stroke="var(--bege)" strokeWidth="8" />
            <circle cx="60" cy="60" r={R} fill="none" stroke="var(--caramelo)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - st.progresso)} transform="rotate(-90 60 60)" />
          </svg>
          <p className="tempo preco" data-tempo aria-live="off">{formatarTempo(restanteTotal)}</p>
          <p className="etapa" data-etapa aria-live="polite">{st.fim ? "Pronto. Bom café!" : `${st.indice + 1}/${m.etapas.length} · ${st.nome}`}</p>
          <div className="controles">
            {rodando
              ? <button className="botao" onClick={() => setRodando(false)}>Pausar</button>
              : <button className="botao" onClick={() => { if (st.fim) zerar(); setRodando(true); }}>Iniciar</button>}
            <button className="botao contorno" onClick={zerar}>Zerar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
