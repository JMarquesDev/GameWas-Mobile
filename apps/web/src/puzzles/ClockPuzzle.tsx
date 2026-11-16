import { useState } from 'react';
import { Modal } from '../pages/Modal';
import { useGameStore } from '../game/store';
import { gameAudio } from '../game/audio';
import './clock-puzzle.css';

type Props = { mode: 'diary' | 'clock'; onClose: () => void };

export function ClockPuzzle({ mode, onClose }: Props) {
  const clues = useGameStore(state => state.progress.phaseClues['cenario-02'] ?? []);
  const solved = useGameStore(state => state.progress.choices['puzzle:cenario-02:relogio'] === 'solved');
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [error, setError] = useState(false);
  const hasDiary = clues.includes('diario-experimento');
  const rememberedReturn = clues.includes('bolsa-caderno') && clues.includes('redacao-futuro');
  const rememberedInterval = clues.includes('prova-anatomia');
  const ready = hasDiary && rememberedReturn && rememberedInterval;
  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  function adjust(part: 'hour' | 'minute', amount: number) {
    if (part === 'hour') setHour(value => (value + amount + 24) % 24);
    else setMinute(value => (value + amount + 60) % 60);
    setError(false);
    gameAudio.cue('open');
  }
  function confirm() {
    if (hour === 14 && minute === 44) {
      useGameStore.getState().recordChoice('puzzle:cenario-02:relogio', 'solved');
      gameAudio.cue('memory');
    } else {
      setError(true);
      gameAudio.cue('error');
    }
  }
  return <Modal open title={mode === 'diary' ? 'Diário do experimento' : 'Relógio do laboratório'} onClose={onClose} className="journal-dialog clock-puzzle">
    {mode === 'diary' ? <>
      <p className="eyebrow">ANOTAÇÕES DE OLIVER · DIA DO EXPERIMENTO</p>
      <p className="note">Algumas linhas estão desfocadas. Investigue os objetos da sala e volte ao diário para recuperar o que falta.</p>
      <div className="clock-diary">
        <article><strong>07h00</strong><p>Separei os instrumentos e deixei tudo pronto sobre a bancada.</p></article>
        <article><strong>07h45–09h20</strong><p>Saí para resolver uma pendência em casa. O experimento ficou parado.</p></article>
        <article className={!rememberedReturn ? 'clock-blurred' : ''}><strong>{rememberedReturn ? '09h20–14h37' : '09h20–??h??'}</strong><p>{rememberedReturn ? 'Voltei, retomei o relatório e fui à biblioteca pesquisar o procedimento. Regressei à bancada às 14h37.' : 'A lembrança deste trecho ainda está desfocada. Procure a redação e o caderno.'}</p></article>
        <article className={!rememberedInterval ? 'clock-blurred' : ''}><strong>{rememberedInterval ? 'Depois da biblioteca' : '14h??'}</strong><p>{rememberedInterval ? 'A anotação no verso da prova indica quanto tempo levou até ligar o aparelho. Foi nesse momento que o experimento começou.' : 'A última linha se perdeu. Examine o verso da prova na bancada de Zoe.'}</p></article>
      </div>
      <button onClick={onClose}>Voltar à sala</button>
    </> : <>
      <p className="eyebrow">AJUSTE OS PONTEIROS</p>
      <p>Em que horário Oliver iniciou o experimento? Consulte o diário e as pistas reunidas na sala.</p>
      {!hasDiary && <p className="note">O diário no canto da sala pode ajudar a identificar o horário.</p>}
      <div className="clock-face" aria-label={`Relógio ajustado para ${time}`}><span className="clock-hand hour" style={{ rotate: `${hour * 30 + minute / 2}deg` }}/><span className="clock-hand minute" style={{ rotate: `${minute * 6}deg` }}/><span className="clock-center"/></div>
      <div className="clock-controls"><div><span>Horas</span><button aria-label="Voltar uma hora" onClick={() => adjust('hour', -1)}>←</button><strong>{String(hour).padStart(2, '0')}</strong><button aria-label="Avançar uma hora" onClick={() => adjust('hour', 1)}>→</button></div><div><span>Minutos</span><button aria-label="Voltar cinco minutos" onClick={() => adjust('minute', -5)}>−5</button><button aria-label="Voltar um minuto" onClick={() => adjust('minute', -1)}>←</button><strong>{String(minute).padStart(2, '0')}</strong><button aria-label="Avançar um minuto" onClick={() => adjust('minute', 1)}>→</button><button aria-label="Avançar cinco minutos" onClick={() => adjust('minute', 5)}>+5</button></div></div>
      {error && <p role="alert">O horário não corresponde ao diário. Releia as anotações e tente de novo.</p>}
      {solved ? <p role="status">14h44. O horário do experimento voltou à memória.</p> : <button disabled={!ready} onClick={confirm}>Confirmar horário</button>}
      {!ready && <p className="note">Reúna o diário, a redação, o caderno e a prova para confirmar.</p>}
      <button className="text-button" onClick={onClose}>Voltar à exploração</button>
    </>}
  </Modal>;
}
