import { useEffect, useState } from 'react';
import { childhoodObjects, type ObjectId } from '@was/game-content';
import { canConnectMemory, canRecoverMemory } from '@was/game-core';
import { useGameStore } from '../game/store';
import { Modal } from './Modal';
export function MemoryJournal({ open, onClose, onMemory, onPuzzle }: { open: boolean; onClose: () => void; onMemory: () => void; onPuzzle: () => void }) {
  const progress = useGameStore(state => state.progress);
  const [evidence, setEvidence] = useState<string[]>(['', '', '']);
  const [attempted, setAttempted] = useState(false);
  useEffect(() => { if (progress.clues.length === 0) { setEvidence(['', '', '']); setAttempted(false); } }, [progress.clues.length]);
  const questions = ['Quem aparece na lembrança?', 'Qual objeto revela o vínculo com essa pessoa?', 'Qual pista indica o assunto da conversa?'];
  function connect() {
    if (canConnectMemory(progress, evidence)) { useGameStore.getState().recover(); onMemory(); }
    else setAttempted(true);
  }
  return <Modal open={open} title="Diário de memórias" onClose={onClose} className="journal-dialog">
    <div className="inspection-heading"><div><p className="eyebrow">OLIVER · INFÂNCIA</p><h2>Diário de memórias</h2></div><button className="secondary" onClick={onClose}>Fechar</button></div>
    <p className="journal-question">O que liga estes objetos à lembrança do meu pai?</p>
    <p className="note">{progress.clues.length} de 3 pistas descobertas · {progress.memoryRecovered ? 'Conexão reconstruída' : 'Procure relações, não apenas objetos.'}</p>
    <div className="journal-evidence">{childhoodObjects.map(object => <article className={`journal-entry ${progress.clues.includes(object.id) ? 'found' : ''}`} key={object.id}><span className="evidence-number">0{childhoodObjects.indexOf(object) + 1}</span><h3>{progress.clues.includes(object.id) ? object.clue : 'Fragmento ausente'}</h3><p>{progress.clues.includes(object.id) ? object.text : 'Explore o quarto e examine os detalhes dos objetos.'}</p>{progress.clues.includes(object.id) && <button className="text-button" onClick={() => { onClose(); useGameStore.getState().inspect(object.id as ObjectId); }}>Reexaminar objeto</button>}</article>)}</div>
    {progress.memoryRecovered ? <section className="memory-connection"><p className="clue-ready">Uma conversa com meu pai sobre lembrar e esquecer.</p><button onClick={onMemory}>{progress.choices['puzzle:infancia:desenho'] === 'solved' ? 'Rever lembrança' : 'Resolver o desenho para continuar'}</button>{progress.choices['puzzle:infancia:desenho'] === 'solved' && <button className="secondary" onClick={onPuzzle}>Rever puzzle do desenho</button>}</section> : canRecoverMemory(progress) ? <section className="memory-connection">
      <h3>Reconstruir a lembrança</h3><p>Relacione cada pergunta com a pista que a responde. Você pode reler e tentar novamente, sem perder progresso.</p>
      {questions.map((question, index) => <label className="connection-field" key={question}>{question}<select value={evidence[index]} onChange={event => { setEvidence(value => value.map((item, i) => i === index ? event.target.value : item)); setAttempted(false); }}><option value="">Escolher uma pista…</option>{childhoodObjects.map(object => <option key={object.id} value={object.id}>{object.clue}</option>)}</select></label>)}
      {attempted && <p role="status">Ainda falta uma conexão. A fotografia mostra quem estava presente; a dedicatória revela o vínculo; o desenho registra o assunto.</p>}
      <button disabled={evidence.some(value => !value)} onClick={connect}>Conectar pistas e recordar</button>
    </section> : <p className="note">As conexões estarão disponíveis quando os três detalhes forem registrados.</p>}
  </Modal>;
}
