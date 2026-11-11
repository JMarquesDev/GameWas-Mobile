import { useGameStore } from '../game/store';
import { Modal } from '../pages/Modal';
import { NotebookPasswordClue } from '../puzzles/NotebookPasswordClue';

export function SchoolNotebookDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const savedClues = useGameStore(state => state.progress.phaseClues['cenario-02']);
  const clues = savedClues ?? [];
  return <Modal open={open} title="Caderno encontrado na bolsa" onClose={onClose} className="journal-dialog">
    <div className="inspection-heading"><div><p className="eyebrow">BOLSA · LABORATÓRIO</p><h2>Caderno de Oliver</h2></div><button className="secondary" onClick={onClose}>Fechar</button></div>
    <p>Uma página foi marcada com um coração. Entre as folhas, Oliver encontra um bilhete de Zoe rasgado na ponta.</p>
    <NotebookPasswordClue foundEssay={clues.includes('redacao-futuro')} foundClock={clues.includes('relogio-aula')}/>
    <button className="secondary" onClick={onClose}>Voltar à exploração</button>
  </Modal>;
}
