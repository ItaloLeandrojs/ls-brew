import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tempoDoVideo, proximoTempo } from '../dominio/rolagem-video.js';

gsap.registerPlugin(ScrollTrigger);
// No celular, a barra de endereço some e volta ao rolar: isso não deve recalcular a cena no meio da rolagem.
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Vídeo controlado pela rolagem: a seção fica presa na tela e a rolagem diz em que segundo o vídeo está.
 * Um arquivo de vídeo (bem mais leve que 120 imagens e sem estourar a memória do celular).
 * O vídeo precisa ter quadro-chave a cada 4 a 8 quadros (ver README) para buscar rápido.
 *
 * Regras que evitam engasgo (skill ls-motion, rolagem.md):
 * - nunca muda currentTime enquanto o vídeo ainda está buscando: o alvo mais novo entra no quadro seguinte;
 * - o vídeo anda uma fração da distância até o alvo a cada quadro de tela (proximoTempo);
 * - o vídeo só aparece depois de pintar um quadro de verdade (no iPhone ele pode ficar em branco até lá);
 * - no primeiro toque, play/pause libera o vídeo no iPhone.
 */
export default function ScrollVideo({
  src,
  srcCelular,
  larguraCelular = 768,
  poster, // primeiro quadro, de fundo enquanto o vídeo não aparece
  posterCelular,
  posterReduz, // imagem do modo reduzir movimento
  posterReduzCelular,
  rolagem = 3, // quantas alturas de tela a cena dura
  alt = '',
  className = '',
  onProgresso, // recebe 0..1 a cada atualização da rolagem
  children,
}) {
  const secao = useRef(null);
  const video = useRef(null);
  const [reduz, setReduz] = useState(false);
  const [celular, setCelular] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setReduz(matchMedia('(prefers-reduced-motion: reduce)').matches);
    setCelular(window.innerWidth <= larguraCelular);
  }, [larguraCelular]);

  useEffect(() => {
    // Lê direto: no primeiro commit o estado `reduz` ainda é false e baixaria o vídeo à toa.
    if (reduz || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const v = video.current;
    const el = secao.current;
    if (!v || !el) return;
    const fonte = srcCelular && window.innerWidth <= larguraCelular ? srcCelular : src;
    if (v.getAttribute('src') !== fonte) { v.src = fonte; v.load(); }

    let alvo = 0;
    let atual = 0;
    let progresso = 0;
    let raf = 0;
    let vivo = true;

    const aoCarregar = () => { alvo = tempoDoVideo(progresso, v.duration); };
    const aoPintar = () => { if (v.readyState >= 2) setPronto(true); };
    const liberar = () => { const t = v.play(); if (t) t.then(() => v.pause()).catch(() => {}); };
    v.addEventListener('loadedmetadata', aoCarregar);
    v.addEventListener('loadeddata', aoPintar);
    v.addEventListener('seeked', aoPintar);
    window.addEventListener('touchstart', liberar, { once: true, passive: true });

    const passo = () => {
      if (!vivo) return;
      // Fila de busca: enquanto busca, não escreve; o alvo mais novo entra no próximo quadro.
      if (!v.seeking && v.readyState >= 1) {
        atual = proximoTempo(atual, alvo);
        if (Math.abs(v.currentTime - atual) > 1 / 120) v.currentTime = atual;
      }
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);

    const gatilho = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: `+=${rolagem * 100}%`,
      pin: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progresso = self.progress;
        alvo = tempoDoVideo(progresso, v.duration);
        onProgresso?.(progresso);
      },
    });

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      gatilho.kill();
      v.removeEventListener('loadedmetadata', aoCarregar);
      v.removeEventListener('loadeddata', aoPintar);
      v.removeEventListener('seeked', aoPintar);
      window.removeEventListener('touchstart', liberar);
    };
  }, [reduz, src, srcCelular, larguraCelular, rolagem, onProgresso]);

  const imgReduz = (celular ? posterReduzCelular : null) || posterReduz || poster;

  return (
    <section
      ref={secao}
      className={`seq video-rolagem ${className}`.trim()}
      style={{ position: 'relative', height: 'calc(100lvh + var(--folga-tela, 0px))', overflow: 'hidden', '--seq-poster': `url(${poster})`, '--seq-poster-celular': `url(${posterCelular || poster})` }}
    >
      <div className="video-rolagem-fundo" aria-hidden="true" />
      {reduz ? (
        <img src={imgReduz} alt={alt} className="video-rolagem-midia pronto" />
      ) : (
        <video ref={video} className={`video-rolagem-midia ${pronto ? 'pronto' : ''}`.trim()} muted playsInline preload="auto" aria-label={alt} role="img" />
      )}
      {children && <div className="seq-texto" style={{ position: 'relative', zIndex: 1, height: '100%' }}>{children}</div>}
    </section>
  );
}
