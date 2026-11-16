import { useEffect, useRef, useState } from 'react';
import { usePreferences } from '../game/preferences';
import { Preferences } from './Preferences';
import { gameAudio } from '../game/audio';
import { useGameStore, type SaveSlot } from '../game/store';
import { backgrounds } from '../game/backgrounds';
import { NumericKeypad } from '../ui/NumericKeypad';
import { EndingSequence } from './EndingSequence';
let coverSeenThisPage = false;
type Props = { onStart: (slot: number) => void; onContinue: (slot: number) => void; onAdmin: (scene: string) => void; slots: SaveSlot[]; completed: boolean };
export function MainMenu({ onStart, onContinue, onAdmin, slots, completed }: Props) {
  const [panel, setPanel] = useState<'main' | 'preferences' | 'slots' | 'admin' | 'admin-scenes'>('main');
  const [previewCompleted, setPreviewCompleted] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const reducedMotion = usePreferences(state => state.reducedMotion);
  const [intro, setIntro] = useState(() => coverSeenThisPage ? 'done' : 'playing');
  const [leaving, setLeaving] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminClicks, setAdminClicks] = useState(0);
  const [adminEntryVisible, setAdminEntryVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  function finishIntro() {
    coverSeenThisPage = true;
    setIntro('fading');
  }
  useEffect(() => {
    if (intro !== 'fading') return;
    const timeout = window.setTimeout(() => setIntro('done'), reducedMotion ? 0 : 500);
    return () => window.clearTimeout(timeout);
  }, [intro, reducedMotion]);
  function enter(action: () => void) {
    if (leaving) return;
    gameAudio.unlock(); gameAudio.cue('open'); setLeaving(true);
    timer.current = window.setTimeout(action, reducedMotion ? 0 : 650);
  }
  if (intro !== 'done') return <section className={`cover-intro ${intro === 'fading' ? 'is-fading' : ''}`} aria-label="Abertura do WAS">
    <video autoPlay muted playsInline preload="auto" poster="/assets/video/was-cover-loop.jpg"
      onEnded={finishIntro} onError={finishIntro} onTimeUpdate={event => {
        if (event.currentTarget.currentTime >= 3 && intro === 'playing') finishIntro();
      }} src="/assets/video/was-cover-loop.mp4" />
    <button className="secondary cover-skip" onClick={finishIntro}>Pular abertura</button>
  </section>;
  const landscape = completed || previewCompleted ? 'campo-luz' : 'campo-chuva';
  return <section className={`main-menu ${completed || previewCompleted ? 'menu-completed' : 'menu-rainy'} ${leaving ? 'menu-leaving' : ''}`} aria-label="Menu inicial" aria-busy={leaving}>
    <div className="menu-landscape" aria-hidden="true">
      <img src={`/assets/menu/${landscape}-v1.png`} alt=""/>
    </div>
    <div className="menu-atmosphere" aria-hidden="true"/>
    <div className="menu-content" key={panel}>
      <p className="eyebrow">MEMÓRIAS DE OLIVER</p><h1>WAS</h1><span className="menu-platform">Mobile</span><span className="menu-rule" aria-hidden="true"/>
      {panel === 'main' ? <>
        <p className="menu-quote">Se você perdesse todas as suas memórias,<br/>ainda seria a mesma pessoa?</p>
        <nav className="menu-buttons" aria-label="Ações do menu">
          {slots.some(slot => slot.occupied) && <button disabled={leaving} onClick={() => setPanel('slots')}>Continuar</button>}
          <button disabled={leaving} className={slots.some(slot => slot.occupied) ? 'secondary' : ''} onClick={() => setPanel('slots')}>{slots.some(slot => slot.occupied) ? 'Novo jogo' : 'Iniciar'}</button>
          <button disabled={leaving} className="secondary" onClick={() => setPanel('preferences')}>Preferências</button>
        </nav>
        <p className="menu-caption">Uma história sobre o que permanece.</p>
      </> : panel === 'slots' ? <section className="preferences save-slots"><h2>Campanhas salvas</h2><p>Escolha um dos três slots. O progresso mostra a fase mais avançada já liberada.</p><div className="save-slot-grid">{slots.map(slot => <article className={`save-slot ${slot.occupied ? 'occupied' : ''}`} key={slot.id}><p className="eyebrow">SLOT {slot.id + 1}</p><h3>{slot.occupied ? `Progresso: ${slot.progress}%` : 'Vazio'}</h3><p>{slot.occupied ? `Fase ${slot.phase + 1} de 7` : 'Comece uma nova história neste espaço.'}</p><div className="actions">{slot.occupied && <button disabled={leaving} onClick={() => enter(() => onContinue(slot.id))}>Continuar</button>}<button disabled={leaving} className={slot.occupied ? 'secondary' : ''} onClick={() => { gameAudio.unlock(); onStart(slot.id); }}>{slot.occupied ? 'Recomeçar' : 'Novo jogo'}</button>{slot.occupied && <button disabled={leaving} className="secondary" onClick={() => { setDeleteTarget(slot.id); setSaveMessage(''); }}>Apagar</button>}</div>{deleteTarget === slot.id && <div role="group" aria-label={`Confirmar exclusão do slot ${slot.id + 1}`}><p>Apagar este save? Não será possível recuperar o progresso.</p><div className="actions"><button className="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</button><button onClick={() => { const ok = useGameStore.getState().deleteSlot(slot.id); setSaveMessage(ok ? `Slot ${slot.id + 1} apagado.` : 'Não foi possível apagar. Tente novamente.'); setDeleteTarget(null); }}>Confirmar exclusão</button></div></div>}</article>)}</div><p role="status">{saveMessage}</p><button className="secondary" onClick={() => { setDeleteTarget(null); setPanel('main'); }}>Voltar</button></section> : panel === 'admin-scenes' ? <section className="preferences admin-menu-scenes"><h2>Selecionar cenário</h2><p>Escolha onde explorar. A prévia do menu claro não altera os saves.</p><div className="admin-phase-grid">{backgrounds.map(scene => <button key={scene.key} className="secondary" disabled={leaving} onClick={() => enter(() => onAdmin(scene.key))}><span>{scene.title.slice(0, 2)}</span>{scene.title.replace(/^\d+ — /, '')}</button>)}<button type="button" className="secondary" onClick={() => setCreditsOpen(true)}><span>★</span>Créditos</button></div><div className="actions"><button type="button" className="secondary" onClick={() => setPreviewCompleted(value => !value)}>{previewCompleted ? 'Ver menu chuvoso' : 'Ver menu após o final'}</button><button type="button" className="secondary" onClick={() => setPanel('main')}>Voltar ao menu</button></div></section> : panel === 'admin' ? <section className="preferences"><h2>Acesso administrativo</h2><p>Digite a senha para abrir o painel de fases.</p><form onSubmit={event => { event.preventDefault(); if (adminPassword === '1807') { setAdminPassword(''); setPanel('admin-scenes'); } else { setAdminError('Senha incorreta. Tente novamente.'); setAdminPassword(''); } }}><label className="admin-password-field">Senha<input autoFocus type="password" inputMode="numeric" autoComplete="off" maxLength={4} value={adminPassword} onChange={event => { setAdminPassword(event.target.value.replace(/\D/g, '').slice(0, 4)); setAdminError(''); }} aria-describedby={adminError ? 'admin-password-error' : undefined}/></label><NumericKeypad label="senha administrativa" value={adminPassword} maxLength={4} onChange={value => { setAdminPassword(value); setAdminError(''); }}/>{adminError && <p id="admin-password-error" role="alert">{adminError}</p>}<div className="actions"><button type="button" className="secondary" onClick={() => setPanel('main')}>Voltar</button><button disabled={leaving || !adminPassword} type="submit">Entrar</button></div></form></section> : <section className="preferences"><h2>Preferências</h2><Preferences/><button className="secondary" onClick={() => setPanel('main')}>Voltar</button></section>}
    </div>
    {panel === 'main' ? <button disabled={leaving} className={`menu-edition ${adminEntryVisible ? 'menu-admin-revealed' : ''}`} onClick={() => {
      if (adminEntryVisible) {
        setAdminPassword(''); setAdminError(''); setPanel('admin');
      } else {
        setAdminClicks(clicks => {
          if (clicks < 2) return clicks + 1;
          setAdminEntryVisible(true);
          return 0;
        });
      }
    }}>{adminEntryVisible ? 'Admin · explorar cenários' : 'WAS · PROJETO INTEGRADOR · 2026'}</button> : <p className="menu-edition">WAS · PROJETO INTEGRADOR · 2026</p>}
    {creditsOpen && <EndingSequence choice="credits" onFinish={() => setCreditsOpen(false)}/>}
  </section>;
}


