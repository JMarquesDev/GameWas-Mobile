import { phaseObjectives } from '@was/game-content';
import { useGameStore } from '../game/store';
import { gameAudio } from '../game/audio';
import { Modal } from '../pages/Modal';

const clue = phaseObjectives.find(phase => phase.scene === 'infancia-sala')!.clues.find(item => item.id === 'nomes-armarios')!;

export function ClassroomCubbiesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const discovered = useGameStore(state => state.progress.phaseClues['infancia-sala']?.includes(clue.id) ?? false);
  const collect = useGameStore(state => state.collectPhaseClue);
  return <Modal open={open} title="Armários da turma" onClose={onClose} className="chair-memory-dialog">
    <div className="chair-memory-scene">
      <img src="/assets/inspection/armarios-turma-closeup-illustrated.png" alt="Ilustração próxima dos armários da turma com as etiquetas Oliver, Zoe e Michael"/>
      <button className="chair-memory-back secondary" onClick={onClose}>← Voltar à sala</button>
      <div className="chair-memory-caption"><p className="eyebrow">UMA LEMBRANÇA DA SALA DE AULA</p><p>Oliver, Zoe, Michael. Os nomes continuam onde estavam.</p>
        {discovered ? <small>Lembrança registrada no diário.</small> : <button onClick={() => { collect('infancia-sala', clue.id); gameAudio.cue('clue'); }}>Guardar lembrança</button>}
      </div>
    </div>
  </Modal>;
}
