import { useEffect, useRef, useState } from "react";
import { CARDAPIO } from "../dados/cardapio.js";
import { formatarPreco } from "../dominio/preco.js";

// Abas do cardápio: as setas ← → trocam de categoria, como num tablist de verdade.
export default function Cardapio() {
  const [ativa, setAtiva] = useState(0);
  const [montado, setMontado] = useState(false); // sem JS (e no HTML do servidor) todos os painéis ficam à vista
  const abas = useRef([]);
  useEffect(() => setMontado(true), []);
  const teclas = (e) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const n = (ativa + d + CARDAPIO.length) % CARDAPIO.length;
    setAtiva(n);
    abas.current[n]?.focus();
  };
  return (
    <div className="cardapio">
      <div role="tablist" aria-label="Categorias do cardápio" className="abas" onKeyDown={teclas}>
        {CARDAPIO.map((c, i) => (
          <button key={c.id} ref={(el) => (abas.current[i] = el)} role="tab" id={`aba-${c.id}`} aria-controls={`painel-${c.id}`}
            aria-selected={i === ativa} tabIndex={i === ativa ? 0 : -1} className="aba" onClick={() => setAtiva(i)}>
            {c.nome}
          </button>
        ))}
      </div>
      {CARDAPIO.map((cat, i) => (
        <div key={cat.id} role="tabpanel" id={`painel-${cat.id}`} aria-labelledby={`aba-${cat.id}`} className="painel" hidden={montado && i !== ativa}>
          {!montado && <p className="rotulo">{cat.nome}</p>}
          <ul className="itens">
            {cat.itens.map((it) => (
              <li key={it.nome} className="item">
                <div>
                  <h3>{it.nome}</h3>
                  <p className="desc">{it.descricao}</p>
                  {it.notas && <p className="notas">{it.notas.join(" · ")}</p>}
                </div>
                <span className="preco">{formatarPreco(it.preco)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
