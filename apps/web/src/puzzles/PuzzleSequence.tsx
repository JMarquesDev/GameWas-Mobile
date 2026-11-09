import { useState } from 'react';
import { Modal } from '../pages/Modal';
import { puzzles, type Puzzle } from './content';
import { useGameStore } from '../game/store';
function Challenge({ puzzle, onSolved }: { puzzle: Puzzle; onSolved: () => void }) {
 const [values,setValues]=useState<string[]>(puzzle.questions.map(()=>''));
 const [selected,setSelected]=useState<number|null>(null);
 const [focus,setFocus]=useState(0); const [error,setError]=useState(false);
 const drawing = puzzle.id === 'desenho';
 function fragment(index: number) {
   if (!drawing) return puzzle.options[index];
   const position = puzzle.answers.indexOf(index);
   return <span role="img" aria-label={`Peça do desenho: ${puzzle.options[index]}`} className={`drawing-piece piece-${position}`} style={{backgroundPosition: `center ${position * 50}%`}}/>;
 }
 function place(slot: number, piece: number) {
   setValues(old => old.map((value, index) => index === slot ? String(piece) : value === String(piece) ? '' : value));
   setSelected(null); setError(false);
 }
 const sharp=Math.abs(focus-62)<=5;
 return <section><h2>{puzzle.title}</h2><p>{puzzle.evidence}</p>
 {puzzle.focus && <><div aria-hidden="true" style={{padding:40,textAlign:'center',fontSize:36,filter:`blur(${Math.abs(focus-62)/7}px)`}}>B-17</div><label>Foco <input aria-label="Foco do microscópio" type="range" min="0" max="100" value={focus} onChange={e=>setFocus(Number(e.target.value))}/></label><p role="status">{sharp?'Imagem nítida: B-17.':'A identificação ainda está desfocada.'}</p></>}
 <p className="note">{drawing ? 'Toque numa faixa e depois no encaixe correspondente. Também pode arrastar as peças.' : 'Escolha uma pista e relacione-a com o espaço correspondente.'}</p>
 <div className={`evidence-bank${drawing ? ' jigsaw-bank' : ''}`} aria-label={drawing ? 'Peças do quebra-cabeça' : 'Fragmentos disponíveis'}>{puzzle.options.map((option,index)=><button key={option} draggable aria-pressed={selected===index} aria-label={`${option}${values.includes(String(index)) ? ', já posicionada' : ''}`} className={`${selected===index?'selected':''}${drawing && values.includes(String(index))?' placed':''}`} onDragStart={event=>event.dataTransfer.setData('text/plain',String(index))} onClick={()=>setSelected(index)}>{drawing ? <>{fragment(index)}<small>{option}</small></> : option}</button>)}</div>
 <div className={`evidence-board${drawing ? ' jigsaw-board' : ''}`} aria-label={drawing ? 'Área para montar o desenho' : 'Quadro de relações'}>{puzzle.questions.map((question,index)=><button key={question} className={`evidence-slot${drawing ? ` jigsaw-slot slot-${index}` : ''}`} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const raw=event.dataTransfer.getData('text/plain');const choice=Number(raw);if(raw!==''&&Number.isInteger(choice)&&choice>=0&&choice<puzzle.options.length)place(index,choice);}} onClick={()=>{if(selected!==null)place(index,selected);else if(values[index]!==''){setSelected(Number(values[index]));setValues(old=>old.map((value,i)=>i===index?'':value));}}}><small>{question}</small>{values[index]==='' ? <strong>{drawing ? 'Encaixe aqui' : 'Coloque uma pista'}</strong> : drawing ? fragment(Number(values[index])) : <strong>{puzzle.options[Number(values[index])]}</strong>}</button>)}</div>

 {error && <p role="alert">A ligação ainda não corresponde aos indícios. Releia o material e tente novamente.</p>}
 <button disabled={values.some(v=>v==='') || (puzzle.focus && !sharp)} onClick={()=>{if(values.every((v,i)=>Number(v)===puzzle.answers[i]))onSolved();else setError(true);}}>Confirmar</button></section>;
}
export function PuzzleSequence({scene,onClose,onFinish}:{scene:string;onClose:()=>void;onFinish:()=>void}) {
 const state=useGameStore(); const list=puzzles[scene]??[];
 const pending=list.find(p=>state.progress.choices[`puzzle:${scene}:${p.id}`]!=='solved');
 return <Modal open title="Reconstruir pistas" onClose={onClose} className="journal-dialog puzzle-dialog"><p className="eyebrow">INVESTIGAÇÃO · {list.filter(p=>state.progress.choices[`puzzle:${scene}:${p.id}`]==='solved').length}/{list.length}</p>{pending?<Challenge key={pending.id} puzzle={pending} onSolved={()=>state.recordChoice(`puzzle:${scene}:${pending.id}`,'solved')}/>:<><h2>Conexões reconstruídas</h2><button onClick={onFinish}>Continuar lembrança</button></>}<button className="text-button" onClick={onClose}>Voltar à exploração</button></Modal>;
}
export function puzzlesComplete(scene:string,choices:Record<string,string>){return (puzzles[scene]??[]).every(p=>choices[`puzzle:${scene}:${p.id}`]==='solved');}

