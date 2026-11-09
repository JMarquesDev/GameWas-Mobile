import './storyboard.css';
import { useEffect, useState } from 'react';
import { flashbacks, type FlashbackKind } from '@was/game-content';
import { Modal } from './Modal';
import { gameAudio } from '../game/audio';

type Board = { file: string; columns: number; rows: number; frames: number[] };
const boards: Partial<Record<FlashbackKind, Board>> = {
  childhood: { file: '02-infancia', columns: 2, rows: 3, frames: [0, 1, 2, 5] },
  school: { file: '03-redacao', columns: 4, rows: 2, frames: [0, 2, 3, 7] },
  friend: { file: '04-michael', columns: 2, rows: 4, frames: [0, 2, 4, 7] },
  relationship: { file: '05-zoe', columns: 2, rows: 4, frames: [0, 2, 3, 6] },
  apartment: { file: '05-zoe', columns: 2, rows: 4, frames: [7, 2, 4, 7] },
  father: { file: '06-santiago', columns: 3, rows: 4, frames: [2, 4, 7, 9] },
  hospital: { file: '07-hospital', columns: 3, rows: 3, frames: [0, 1, 2, 8] },
};

function Panel({ board, frame }: { board: Board; frame: number }) {
  const width = board.file === '06-santiago' ? 1536 : 1672;
  const height = board.file === '06-santiago' ? 1024 : 941;
  const w = width / board.columns;
  const h = height / board.rows;
  const x = (frame % board.columns) * w;
  const y = Math.floor(frame / board.columns) * h;
  return <svg aria-hidden="true" width="100%" height="100%" viewBox={[x+12,y+12,w-24,h-24].join(' ')} preserveAspectRatio="xMidYMid slice">
    <image href={`/assets/storyboards/${board.file}.png`} width={width} height={height}/>
  </svg>;
}
export function FlashbackSequence({ kind, open, onFinish, branch }: { kind: FlashbackKind; open: boolean; onFinish: () => void; branch?: string }) {
  const [step, setStep] = useState(0);
  const base = flashbacks[kind];
  const response = kind === 'school'
    ? branch === 'quero-ser-medico' ? 'Quero ser médico como você.' : 'Eu ainda não sei.'
    : kind === 'friend'
      ? branch === 'ignorar' ? 'Oliver muda de assunto e tenta seguir estudando.' : 'Oliver diz que está tudo bem, embora não consiga lembrar.'
      : kind === 'relationship'
        ? branch === 'open' ? 'Dessa vez, ele escolheu dividir o que estava sentindo.' : 'Ele ainda não conseguiu falar, mas decidiu que tentaria de novo.'
        : undefined;
  const steps = response ? [...base.slice(0, 2), { kind: 'dialogue' as const, speaker: 'Oliver', text: response }, ...base.slice(3)] : base;
  useEffect(() => { if (open) { setStep(0); gameAudio.cue('memory'); } }, [open, kind]);
  const board = boards[kind];
  const current = steps[step];
  const finished = step >= steps.length;
  return <Modal open={open} title="Flashback" onClose={onFinish} className={`comic-sequence flashback-${current?.kind ?? 'end'}`}>
    {board && <div className="memory-strip" aria-label="Quadros da lembrança">
      {board.frames.slice(0, step + 1).slice(-3).map((frame, i, visible) =>
        <div key={`${step}-${i}`} className={i === visible.length - 1 ? 'current-frame' : 'past-frame'}>
          <Panel board={board} frame={frame}/>
        </div>)}
    </div>}    <div className="memory-scene-content">
      <p className="eyebrow">{finished ? 'MEMÓRIA PROCESSADA' : current.kind === 'vhs' ? 'SINAL VHS · 1987' : 'ARQUIVO DE MEMÓRIA'}</p>
      <div className="memory-line" key={`${kind}-${step}`} aria-live="polite">
        {current?.speaker && <p className="memory-speaker">{current.speaker}</p>}
        <p className="memory-words">{finished ? 'Algumas coisas a gente esquece. Outras esperam ser encontradas.' : current.text}</p>
      </div>
      <div className="memory-progress" aria-label={`${Math.min(step + 1, steps.length)} de ${steps.length} cenas`}>{steps.map((_, i) => <i key={i} className={i <= step ? 'seen' : ''}/>)}</div>
      <div className="actions"><button onClick={() => finished ? onFinish() : setStep(value => value + 1)}>{finished ? 'Continuar' : 'Próximo quadro'}</button></div>
      <small>Avance no seu ritmo. Esc pula a lembrança.</small>
    </div>
  </Modal>;
}


