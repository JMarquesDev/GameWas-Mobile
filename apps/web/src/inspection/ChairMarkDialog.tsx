import { phaseObjectives } from '@was/game-content';
import { useGameStore } from '../game/store';
import { gameAudio } from '../game/audio';
import { Modal } from '../pages/Modal';

const clue = phaseObjectives.find(phase => phase.scene === 'infancia-sala')!.clues.find(item => item.id === 'cadeira-oz')!;

export function ChairMarkDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const discovered = useGameStore(state => state.progress.phaseClues['infancia-sala']?.includes(clue.id) ?? false);
  const collect = useGameStore(state => state.collectPhaseClue);
  return <Modal open={open} title="Rabisco na cadeira" onClose={onClose} className="chair-memory-dialog">
    <div className="chair-memory-scene">
      <img src="/assets/inspection/cadeira-oz-closeup-illustrated-v2.png" alt="Desenho aproximado do verso da cadeira azul da sala de aula, com as iniciais O + Z riscadas no encosto; ao fundo, o armário alto e a mesa do lado direito"/>
      <button className="chair-memory-back secondary" onClick={onClose}>← Voltar à sala</button>
      <div className="chair-memory-caption"><p className="eyebrow">UMA LEMBRANÇA DA SALA DE AULA</p><p>O + Z. As letras ainda estão riscadas atrás do encosto.</p>
        {discovered ? <small>Lembrança registrada no diário.</small> : <button onClick={() => { collect('infancia-sala', clue.id); gameAudio.cue('clue'); }}>Guardar lembrança</button>}
      </div>
    </div>
  </Modal>;
}
