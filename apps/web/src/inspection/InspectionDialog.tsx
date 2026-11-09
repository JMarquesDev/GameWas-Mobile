import { lazy, Suspense, useState } from 'react';
import { childhoodObjects, type ObjectId } from '@was/game-content';
import { useGameStore } from '../game/store';
import { Modal } from '../pages/Modal';
import { gameAudio } from '../game/audio';
const Viewer = lazy(() => import('./ObjectViewer'));
function Inspection({ id }: { id: ObjectId }) {
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState(false);
  const state = useGameStore();
  const object = childhoodObjects.find(item => item.id === id)!;
  const discovered = state.progress.clues.includes(id);
  return <>
    <div className="inspection-heading"><div><p className="eyebrow">INVESTIGAÇÃO</p><h2>{object.name}</h2></div><button className="secondary" onClick={() => state.inspect(null)}>Fechar</button></div>
    <div className="inspection-layout"><section><Suspense fallback={<p>Preparando objeto…</p>}><Viewer id={id} onReady={setReady}/></Suspense></section>
    <aside className="inspection-notes"><p className="eyebrow">INVESTIGAÇÃO</p>
      {discovered ? <section className="discovered-clue" aria-live="polite"><h3>{object.clue}</h3><p>{object.text}</p><small>Pista registrada no diário.</small></section> : <><h3>Examine o objeto</h3><p>Gire e aproxime para encontrar um detalhe.</p><button disabled={!ready} onClick={() => { if (ready) { state.collect(id); gameAudio.cue('clue'); } }}>Examinar detalhe</button><p className="inspection-help" role="status">{ready ? 'Detalhe à vista. Examine para registrar.' : 'Gire para encontrar o detalhe.'}</p></>}
      <button className="text-button" aria-expanded={hint} onClick={() => setHint(value => !value)}>{hint ? 'Ocultar pista' : 'Preciso de uma pista'}</button>{hint && <p className="inspection-hint">{object.hint}</p>}
      <small>Esc fecha · progresso salvo.</small>
    </aside></div>
  </>;
}
export function InspectionDialog() {
  const id = useGameStore(state => state.inspecting);
  const close = useGameStore(state => state.inspect);
  return <Modal open={!!id} title="Investigar objeto" onClose={() => close(null)} className="inspection-dialog">{id && <Inspection key={id} id={id}/>}</Modal>;
}

