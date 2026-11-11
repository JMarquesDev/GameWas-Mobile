import { lazy, Suspense, useState } from 'react';
import { phaseObjectives } from '@was/game-content';
import { useGameStore } from '../game/store';
import { gameAudio } from '../game/audio';
import { Modal } from '../pages/Modal';

const Viewer = lazy(() => import('./ObjectViewer'));
const work = phaseObjectives.find(phase => phase.scene === 'infancia-sala')!.clues.find(clue => clue.id === 'trabalho-infantil')!;

export function SchoolWorkDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [ready, setReady] = useState(false);
  const discovered = useGameStore(state => state.progress.phaseClues['infancia-sala']?.includes(work.id) ?? false);
  const collect = useGameStore(state => state.collectPhaseClue);
  return <Modal open={open} title="Trabalho guardado" onClose={onClose} className="inspection-dialog">
    <div className="inspection-heading"><div><p className="eyebrow">SALA DE AULA · INFÂNCIA</p><h2>{work.title}</h2></div><button className="secondary" onClick={onClose}>Fechar</button></div>
    <div className="inspection-layout"><section><Suspense fallback={<p>Preparando trabalho…</p>}><Viewer id="trabalho-infantil" onReady={setReady}/></Suspense></section>
      <aside className="inspection-notes"><p className="eyebrow">LEMBRANÇA ESCOLAR</p><h3>O que Oliver queria ser?</h3>
        <p>Gire o trabalho e leia a resposta escrita por Oliver quando era criança.</p>
        {discovered ? <section className="discovered-clue"><p>{work.text}</p><small>Pista registrada no diário.</small></section> : <button disabled={!ready} onClick={() => { collect('infancia-sala', work.id); gameAudio.cue('clue'); }}>Registrar lembrança</button>}
        <small>Esc ou ○ fecha a inspeção e devolve o movimento a Oliver.</small>
      </aside></div>
  </Modal>;
}
