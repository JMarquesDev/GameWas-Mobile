import { useEffect, useState } from 'react';
import { usePreferences } from '../game/preferences';
import './field-finale.css';

// Texto provisório; substituir pela narração final aprovada pela equipe.
const narration = [
  'Por um instante, Oliver deixa de procurar respostas. Diante dele, o campo se abre em silêncio.',
  'Nem todas as lembranças voltaram. Algumas chegam como imagens. Outras, apenas como uma sensação familiar.',
  'Ele se lembra da voz do pai. Das perguntas que fazia. Das coisas que ainda não sabia dizer.',
  'Algumas coisas a gente esquece. Outras permanecem com a gente.',
];
const artwork = '/assets/backgrounds/cena-08-campo-final-v3.png';

export function FieldFinale({ paused, onPause, onFinish }: { paused: boolean; onPause: () => void; onFinish: () => void }) {
  const { reducedMotion, volume: savedVolume, muted } = usePreferences();
  const volume = muted ? 0 : savedVolume;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [line, setLine] = useState(-1);
  const [silent, setSilent] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const complete = line >= narration.length;

  useEffect(() => {
    if (!loaded || paused || complete) return;
    if (line < 0) {
      const timer = window.setTimeout(() => setLine(0), reducedMotion ? 500 : 4500);
      return () => window.clearTimeout(timer);
    }
    let disposed = false;
    let finishing = false;
    let nextTimer: number | undefined;
    const next = () => {
      if (disposed || finishing) return;
      finishing = true;
      nextTimer = window.setTimeout(() => { if (!disposed) setLine(value => value + 1); }, 1500);
    };
    const canSpeak = 'speechSynthesis' in window && volume > 0;
    // Legendas continuam mesmo quando a voz não está disponível no dispositivo.
    let fallback = window.setTimeout(next, canSpeak ? 20000 : 8000);
    if (canSpeak) {
      const speech = new SpeechSynthesisUtterance(narration[line]);
      speech.lang = 'pt-BR'; speech.rate = .88; speech.volume = volume;
      const voices = window.speechSynthesis.getVoices();
      speech.voice = voices.find(voice => voice.lang === 'pt-BR') ?? voices.find(voice => voice.lang.startsWith('pt')) ?? null;
      speech.onend = () => { window.clearTimeout(fallback); next(); };
      speech.onerror = () => {
        if (disposed) return;
        setSilent(true); window.clearTimeout(fallback); fallback = window.setTimeout(next, 8000);
      };
      window.speechSynthesis.speak(speech);
    }
    return () => {
      disposed = true; window.clearTimeout(fallback); window.clearTimeout(nextTimer);
      if (canSpeak) window.speechSynthesis.cancel();
    };
  }, [loaded, paused, line, complete, reducedMotion, volume]);

  return <section className={`field-finale ${loaded ? 'field-ready' : ''}`} style={{ animationPlayState: paused ? 'paused' : 'running' }} aria-label="Campo — cena final narrada">
    <img className="field-art" src={artwork} alt="Oliver parado de costas entre a grama, contemplando o campo ao pôr do sol." onLoad={() => setLoaded(true)} onError={() => setFailed(true)}/>
    {!loaded && <p className="field-loading" role="status">{failed ? 'Não foi possível carregar o campo. Recarregue a página para tentar novamente.' : 'Preparando a última lembrança…'}</p>}
    <button className="field-pause secondary" onClick={onPause}>Pausa <kbd>Esc</kbd></button>
    {loaded && line >= 0 && !complete && <div className="field-caption" key={line}><p aria-live="polite">{narration[line]}</p>{silent && <small>Narração disponível em legendas neste dispositivo.</small>}</div>}
    {complete && !videoEnded && <video className="field-final-video" autoPlay muted playsInline src="/assets/video/was-campo-final.mp4" onEnded={() => setVideoEnded(true)} onError={() => setVideoEnded(true)} aria-label="Oliver contempla o campo ao pôr do sol"/>}
    {complete && videoEnded && <div className="field-complete"><button className="secondary" onClick={onFinish}>Concluir história</button></div>}
  </section>;
}
