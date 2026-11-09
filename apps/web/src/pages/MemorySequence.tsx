import { useEffect, useState } from 'react';
import { openingMemory } from '@was/game-content';
import { Modal } from './Modal';
import { gameAudio } from '../game/audio';

export function MemorySequence({ open, onFinish, onClose }: { open: boolean; onFinish: () => void; onClose: () => void }) {
  const [line, setLine] = useState(0);
  useEffect(() => { if (open) { setLine(0); gameAudio.cue('memory'); } }, [open]);
  const entry = openingMemory[line];
  const finished = line === openingMemory.length;
  return <Modal open={open} title="Primeira memória" onClose={onClose} className="memory-sequence">
    <div className="memory-glow" aria-hidden="true"/>
    <div className="memory-scene-content">
      <p className="eyebrow">{finished ? 'MEMÓRIA 01 RECUPERADA' : 'UMA LEMBRANÇA DA INFÂNCIA'}</p>
      <div className="memory-line" key={line} aria-live="polite">
        <p className="memory-speaker">{finished ? 'Oliver' : entry[0]}</p>
        <p className="memory-words">{finished ? 'Algumas coisas a gente esquece.' : entry[1]}</p>
      </div>
      <div className="memory-progress" aria-label={`${Math.min(line + 1, openingMemory.length)} de ${openingMemory.length} falas`}>{openingMemory.map((_, i) => <i key={i} className={i <= line ? 'seen' : ''}/>)}</div>
      <div className="actions">{line > 0 && !finished && <button className="secondary" onClick={() => setLine(value => value - 1)}>Anterior</button>}
        <button onClick={() => finished ? onFinish() : setLine(value => value + 1)}>{finished ? 'Voltar à exploração' : 'Continuar'}</button>
      </div>
      <small>Leia no seu ritmo. Esc retorna à exploração; a lembrança fica disponível no diário.</small>
    </div>
  </Modal>;
}
