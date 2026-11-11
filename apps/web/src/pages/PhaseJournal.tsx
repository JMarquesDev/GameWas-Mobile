import { phaseObjectives } from '@was/game-content';
import { useGameStore } from '../game/store';
import { Modal } from './Modal';

export function PhaseJournal({ scene, open, onClose }: { scene: string; open: boolean; onClose: () => void }) {
  const progress = useGameStore(state => state.progress);
  const objective = phaseObjectives.find(item => item.scene === scene);
  if (!objective) return null;
  const found = progress.phaseClues[scene] ?? [];
  return <Modal open={open} title="Diário de memórias" onClose={onClose} className="journal-dialog">
    <div className="inspection-heading"><div><p className="eyebrow">OLIVER · FRAGMENTOS</p><h2>{objective.title}</h2></div><button className="secondary" onClick={onClose}>Fechar</button></div>
    <p className="journal-question">{objective.thought}</p><p className="note">{found.length} de {objective.clues.length} fragmentos descobertos.</p>
    <div className="journal-evidence">{objective.clues.map((clue, index) => <article className={`journal-entry ${found.includes(clue.id) ? 'found' : ''}`} key={clue.id}><span className="evidence-number">0{index + 1}</span><h3>{found.includes(clue.id) ? clue.title : 'Fragmento ausente'}</h3><p>{found.includes(clue.id) ? clue.text : 'Explore o ambiente e investigue este detalhe.'}</p></article>)}</div>
  </Modal>;
}
