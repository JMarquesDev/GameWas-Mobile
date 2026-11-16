import { useRef, useState, type DragEvent } from 'react';
import { Modal } from '../pages/Modal';
import { puzzles, type Puzzle } from './content';
import { useGameStore } from '../game/store';
function Challenge({ puzzle, onSolved }: { puzzle: Puzzle; onSolved: () => void }) {
 const [values,setValues]=useState<string[]>(puzzle.questions.map(()=>''));
 const [selected,setSelected]=useState<number|null>(null);
 const [dragging,setDragging]=useState<number|null>(null);
 const dragFrame=useRef<number|undefined>(undefined);
 const [focus,setFocus]=useState(0); const [error,setError]=useState(false);
 const drawing = puzzle.id === 'desenho';
 function fragment(index: number) {
   if (!drawing) return puzzle.options[index];
   const position = puzzle.answers.indexOf(index);
   return <span role="img" aria-label={`Trecho do desenho: ${puzzle.options[index]}`} className="drawing-piece" style={{backgroundPosition: `${position * 50}% center`}}/>;
 }
 const sharp=Math.abs(focus-62)<=5;
 function place(choice: number, slot: number) {
   setValues(old=>old.map((value,index)=>index===slot?String(choice):value===String(choice)?'':value));
   setSelected(null); setDragging(null); setError(false);
 }
 function startDrag(event: DragEvent<HTMLButtonElement>, choice: number) {
   event.dataTransfer.effectAllowed='move';
   event.dataTransfer.setData('text/plain',String(choice));
   window.cancelAnimationFrame(dragFrame.current ?? 0);
   dragFrame.current=window.requestAnimationFrame(()=>setDragging(choice));
 }
 function endDrag() { window.cancelAnimationFrame(dragFrame.current ?? 0); setDragging(null); }
 return <section><h2>{puzzle.title}</h2><p>{puzzle.evidence}</p>
 {puzzle.focus && <><div aria-hidden="true" style={{padding:40,textAlign:'center',fontSize:36,filter:`blur(${Math.abs(focus-62)/7}px)`}}>B-17</div><label>Foco <input aria-label="Foco do microscópio" type="range" min="0" max="100" value={focus} onChange={e=>setFocus(Number(e.target.value))}/></label><p role="status">{sharp?'Imagem nítida: B-17.':'A identificação ainda está desfocada.'}</p></>}
 <p className="note">Escolha um fragmento e toque no espaço onde ele deve ficar. Também pode arrastá-lo.</p>
 <div className="evidence-bank" aria-label="Fragmentos disponíveis">{puzzle.options.map((option,index)=>values.includes(String(index))?null:<button key={option} draggable aria-pressed={selected===index} className={`${selected===index?'selected ':''}${dragging===index?'piece-dragging':''}`} onDragStart={event=>startDrag(event,index)} onDragEnd={endDrag} onClick={()=>setSelected(index)}>{fragment(index)}</button>)}</div>
 <div className="evidence-board">{puzzle.questions.map((question,index)=><button key={question} draggable={values[index]!==''} className={`evidence-slot ${dragging!==null&&values[index]===String(dragging)?'piece-dragging':''}`} onDragStart={event=>{if(values[index]!=='')startDrag(event,Number(values[index]));}} onDragEnd={endDrag} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const raw=event.dataTransfer.getData('text/plain');const choice=Number(raw);if(raw!==''&&Number.isInteger(choice)&&choice>=0&&choice<puzzle.options.length)place(choice,index);}} onClick={()=>{if(selected!==null)place(selected,index);else if(values[index]!=='')setSelected(Number(values[index]));}}><small>{drawing ? ['Esquerda','Centro','Direita'][index] : question}</small><strong>{values[index]===''?'Coloque um fragmento':fragment(Number(values[index]))}</strong></button>)}</div>

 {error && <p role="alert">A ligação ainda não corresponde aos indícios. Releia o material e tente novamente.</p>}
 <button disabled={values.some(v=>v==='') || (puzzle.focus && !sharp)} onClick={()=>{if(values.every((v,i)=>Number(v)===puzzle.answers[i]))onSolved();else setError(true);}}>Confirmar</button></section>;
}
export function PuzzleSequence({scene,onClose,onFinish,replay=false}:{scene:string;onClose:()=>void;onFinish:()=>void;replay?:boolean}) {
 const state=useGameStore(); const list=puzzles[scene]??[];
 const [replaySolved,setReplaySolved]=useState(false);
 const pending=replay && !replaySolved ? list[0] : list.find(p=>state.progress.choices[`puzzle:${scene}:${p.id}`]!=='solved');
 const clockPending = scene === 'cenario-02' && state.progress.choices['puzzle:cenario-02:relogio'] !== 'solved';
 return <Modal open title="Reconstruir pistas" onClose={onClose} className="journal-dialog"><p className="eyebrow">INVESTIGAÇÃO · {list.filter(p=>state.progress.choices[`puzzle:${scene}:${p.id}`]==='solved').length + (scene === 'cenario-02' && !clockPending ? 1 : 0)}/{list.length + (scene === 'cenario-02' ? 1 : 0)}</p>{pending?<Challenge key={pending.id} puzzle={pending} onSolved={()=>replay ? setReplaySolved(true) : state.recordChoice(`puzzle:${scene}:${pending.id}`,'solved')}/>:clockPending?<><h2>Falta acertar o relógio</h2><p>Releia o diário no canto da sala, reúna as pistas e ajuste os ponteiros do relógio.</p><button onClick={onClose}>Voltar ao laboratório</button></>:<><h2>Conexões reconstruídas</h2><button onClick={onFinish}>Continuar lembrança</button></>}<button className="text-button" onClick={onClose}>Voltar à exploração</button></Modal>;
}
export function puzzlesComplete(scene:string,choices:Record<string,string>){return (puzzles[scene]??[]).every(p=>choices[`puzzle:${scene}:${p.id}`]==='solved') && (scene !== 'cenario-02' || choices['puzzle:cenario-02:relogio']==='solved');}

