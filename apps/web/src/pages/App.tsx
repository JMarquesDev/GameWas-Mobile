import { Joystick } from './Joystick';
import { IntroVideo } from './IntroVideo';
import { MusicPlayer } from './MusicPlayer';
import { PuzzleSequence, puzzlesComplete } from '../puzzles/PuzzleSequence';
import { FieldFinale } from './FieldFinale';
import { DrowsinessEvent } from './DrowsinessEvent';
import { lazy, Suspense, useEffect, useState } from 'react';
import { childhoodObjects, phaseObjectives, type FlashbackKind } from '@was/game-content';
import { canCompletePhase, canRecoverMemory } from '@was/game-core';
import { useGameStore } from '../game/store';
import { backgrounds } from '../game/backgrounds';
import { MainMenu } from './MainMenu';
import { usePreferences } from '../game/preferences';
import { InspectionDialog } from '../inspection/InspectionDialog';
import { MemoryJournal } from './MemoryJournal';
import { Preferences } from './Preferences';
import { Modal } from './Modal';
import { MemorySequence } from './MemorySequence';
import { FlashbackSequence } from './FlashbackSequence';
import { PhaseJournal } from './PhaseJournal';
import { gameAudio } from '../game/audio';
const tasks: Record<string, string> = {
  'infancia-sala': 'Descubra o que Oliver queria ser quando criança.',
  'cenario-02': 'Recupere as mensagens do celular e siga a indicação até o armário.',
  'faculdade-laboratorio': 'Reconstrua a sequência da semana em que Oliver passou mal.',
  'cenario-03': 'Reconheça vestígios da rotina de Oliver e Zoe na sala.',
  'cenario-04': 'Compare as fotografias e identifique onde foram tiradas.',
  'cenario-05': 'Relacione os bilhetes da cozinha às lembranças para ouvir a gravação.',
  'cenario-06': 'Reconstrua a pesquisa de Santiago para descobrir o que ele escondia.',
  'cenario-07': 'Organize o prontuário para entender o que aconteceu antes do despertar.',
};
const Game = lazy(() => import('../game/PhaserGame').then(module => ({ default: module.PhaserGame })));
export function App() {
  const [completed, setCompleted] = useState(() => { try { return localStorage.getItem('was:completed:v1') === 'true'; } catch { return false; } });
  function completeGame() { if (!admin) { setCompleted(true); try { localStorage.setItem('was:completed:v1', 'true'); } catch { /* Session remains usable. */ } } setEndingOpen(false); menu(); }
  const [puzzleScene, setPuzzleScene] = useState<string | null>(null);
  const [objectiveExpanded, setObjectiveExpanded] = useState(true);
  const [sleepActive, setSleepActive] = useState(false);
  const [run, setRun] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameIntro, setGameIntro] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [sceneKey, setSceneKey] = useState('infancia');
  const [journalOpen, setJournalOpen] = useState(false);
  const [endingOpen, setEndingOpen] = useState(false);
  const [endingChoice, setEndingChoice] = useState<'question' | 'remember' | 'release'>('question');
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [schoolPhoneOpen, setSchoolPhoneOpen] = useState(false);
  const [schoolPassword, setSchoolPassword] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  useEffect(() => { if (!schoolPhoneOpen) setPhoneError(false); }, [schoolPhoneOpen]);
  const [schoolChoiceOpen, setSchoolChoiceOpen] = useState(false);
  const [facultyChoiceOpen, setFacultyChoiceOpen] = useState(false);
  const [hospitalOrder, setHospitalOrder] = useState(['', '', '']);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [flashbackKind, setFlashbackKind] = useState<FlashbackKind | null>(null);
  const [flashbackTarget, setFlashbackTarget] = useState<string | null>(null);
  const [transition, setTransition] = useState<string | null>(null);
  const [tab, setTab] = useState<'main' | 'preferences' | 'controls' | 'admin'>('main');
  const state = useGameStore();
  const schoolPhoneUnlocked = state.progress.choices['school-phone'] === 'unlocked';
  const preferences = usePreferences();
  const isField = sceneKey === 'cenario-08';
  const sceneIndex = backgrounds.findIndex(background => background.key === sceneKey);
  const background = backgrounds[sceneIndex] ?? backgrounds[0];
  useEffect(() => { setObjectiveExpanded(true); }, [sceneKey]);
  const blocked = gameIntro || !!puzzleScene || pauseOpen || journalOpen || memoryOpen || endingOpen || challengeOpen || schoolPhoneOpen || schoolChoiceOpen || facultyChoiceOpen || !!flashbackKind || !!transition || !!state.inspecting;
  useEffect(() => { useGameStore.getState().setPaused(!started || blocked || sleepActive); }, [started, blocked, sleepActive]);
  useEffect(() => {
    const doorReached = () => {
      if (!useGameStore.getState().progress.memoryRecovered) return;
      useGameStore.getState().advancePhase(backgrounds[1].phase);
      setTransition(backgrounds[1].key);
    };
    window.addEventListener('was:door-flashback', doorReached);
    return () => window.removeEventListener('was:door-flashback', doorReached);
  }, []);
  useEffect(() => {
    const openPhone = () => { if (sceneKey === 'cenario-02') setSchoolPhoneOpen(true); };
    window.addEventListener('was:school-phone', openPhone);
    return () => window.removeEventListener('was:school-phone', openPhone);
  }, [sceneKey]);
  useEffect(() => { gameAudio.setVolume(preferences.muted ? 0 : preferences.volume); }, [preferences.volume, preferences.muted]);
  useEffect(() => { gameAudio.setActive(started && !blocked && !document.hidden, sceneKey); }, [started, blocked, sceneKey]);
  useEffect(() => {
    if (!state.notice) return;
    const timeout = window.setTimeout(() => useGameStore.getState().notify(''), Math.min(11000, Math.max(4200, state.notice.length * 55)));
    return () => window.clearTimeout(timeout);
  }, [state.notice]);
  useEffect(() => {
    const hide = () => { if (document.hidden && started) { setTab('main'); setPauseOpen(true); gameAudio.setActive(false, sceneKey); } };
    const blur = () => { useGameStore.getState().setTouch({ x: 0, y: 0 }); if (started) { setTab('main'); setPauseOpen(true); } };
    document.addEventListener('visibilitychange', hide); window.addEventListener('blur', blur);
    return () => { document.removeEventListener('visibilitychange', hide); window.removeEventListener('blur', blur); };
  }, [started, sceneKey]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (!started || event.repeat || event.defaultPrevented || document.querySelector('dialog[open]') || (event.target as HTMLElement)?.matches('input,select,textarea')) return;
      if (event.key === 'Escape') { event.preventDefault(); setTab('main'); setPauseOpen(true); }
      if (event.key.toLowerCase() === 'j' && !transition && !isField) { event.preventDefault(); useGameStore.getState().readJournal(); setJournalOpen(true); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [started, transition, isField]);
  useEffect(() => {
    if (!transition) return;
    const timeout = window.setTimeout(() => {
      if (!admin) useGameStore.getState().checkpoint(transition); setSceneKey(transition); setTransition(null);
    }, preferences.reducedMotion ? 0 : 650);
    return () => window.clearTimeout(timeout);
  }, [transition, preferences.reducedMotion, admin]);
  function enter(isAdmin: boolean, fresh = false, slot?: number, adminScene?: string) {
    setGameIntro(!isAdmin && fresh);
    if (typeof slot === 'number') useGameStore.getState().selectSlot(slot);
    if (fresh) { useGameStore.getState().startSlot(slot ?? useGameStore.getState().activeSlot); setRun(value => value + 1); }
    setSleepActive(false);
    const current = useGameStore.getState();
    const savedIndex = backgrounds.findIndex(item => item.key === current.session.scene);
    const saved = backgrounds[savedIndex];
    const lastUnlockedScene = [...backgrounds].reverse().find(item => item.phase <= current.progress.unlockedPhase) ?? backgrounds[0];
    const safeScene = isAdmin ? (backgrounds.some(item => item.key === adminScene) ? adminScene! : 'infancia') : saved && saved.phase <= current.progress.unlockedPhase ? saved.key : lastUnlockedScene.key;
    setAdmin(isAdmin); setSceneKey(safeScene);
    setPauseOpen(false); setJournalOpen(false); setMemoryOpen(false); setFlashbackKind(null); setFlashbackTarget(null); setStarted(true);
    if (!isAdmin) current.checkpoint(safeScene);
    if (!isAdmin && saved && saved.phase > current.progress.unlockedPhase) current.notify('Sua sessão foi retomada na última memória desbloqueada.');
    if (fresh) current.notify('Onde estou? Talvez os objetos deste quarto me ajudem a lembrar.');
  }
  function phaseFlashback(key: string): FlashbackKind | undefined {
    if (key === 'infancia-sala') return 'childhood';
    if (key === 'cenario-02') return 'school';
    if (key === 'faculdade-laboratorio') return 'friend';
    if (key === 'cenario-06') return 'father';
    if (key === 'cenario-07') return 'hospital';
    return undefined;
  }
  function visitScene(key: string) {
    const targetIndex = backgrounds.findIndex(item => item.key === key);
    const target = backgrounds[targetIndex];
    if (!target) return;
    if (admin) { state.inspect(null); setPauseOpen(false); setTransition(key); return; }
    if (targetIndex !== sceneIndex + 1 || target.phase > state.progress.unlockedPhase + 1) { state.notify('Continue pela próxima área da lembrança para avançar.'); return; }
    const objective = phaseObjectives.find(item => item.scene === sceneKey);
    if (objective && !canCompletePhase(state.progress, sceneKey)) { state.notify('Investigue os detalhes deste ambiente antes de avançar.'); return; }
    state.inspect(null); setPauseOpen(false);
    if (target.phase === backgrounds[sceneIndex].phase) { state.advancePhase(target.phase); setTransition(key); return; }
    if (!puzzlesComplete(sceneKey, useGameStore.getState().progress.choices)) { setPuzzleScene(sceneKey); return; }
    const memory = phaseFlashback(sceneKey);
    if (memory) { setFlashbackTarget(key); setFlashbackKind(memory); return; }
    state.advancePhase(target.phase); setTransition(key);
  }
  function finishFlashback() {
    const target = flashbackTarget; setFlashbackKind(null); setFlashbackTarget(null);
    const background = backgrounds.find(item => item.key === target);
    if (background) { state.advancePhase(background.phase); setTransition(background.key); }
  }
  function continueAfterPhase() {
    const next = backgrounds[sceneIndex + 1];
    if (!next) { setEndingChoice('question'); setEndingOpen(true); return; }
    visitScene(next.key);
  }
  function advanceCurrentPhase() {
    if (!admin && !puzzlesComplete(sceneKey, useGameStore.getState().progress.choices)) { setPuzzleScene(sceneKey); return; }
    if (sceneKey !== 'infancia' && !canCompletePhase(state.progress, sceneKey)) { state.notify('Investigue todos os detalhes deste ambiente antes de avançar.'); return; }
    if (sceneKey === 'cenario-02') {
      if (!schoolPhoneUnlocked) { setSchoolPhoneOpen(true); return; }
      setSchoolChoiceOpen(true); return;
    }
    if (sceneKey === 'faculdade-laboratorio') { setFacultyChoiceOpen(true); return; }
    if (sceneKey === 'cenario-05') { setChallengeOpen(true); return; }
    if (sceneKey === 'cenario-07') { continueAfterPhase(); return; }
    continueAfterPhase();
  }
  function resolveHospitalPuzzle() {
    if (hospitalOrder.join('|') !== 'exames|cirurgia|acordar') { state.notify('A sequência ainda não parece certa. Reveja os fragmentos do prontuário.'); return; }
    setChallengeOpen(false); state.notify('Sequência reconstruída: exames, cirurgia e despertar.'); continueAfterPhase();
  }
  function finishChoiceFlashback(kind: FlashbackKind, choice: string) {
    state.recordChoice(sceneKey, choice);
    const next = backgrounds[sceneIndex + 1];
    if (next) { setFlashbackTarget(next.key); setFlashbackKind(kind); }
  }
  function unlockSchoolPhone() {
    if (schoolPassword.replace(/\D/g, '') !== '17091990') { setPhoneError(true); return; }
    useGameStore.getState().recordChoice('school-phone', 'unlocked'); setSchoolPassword(''); state.notify('Celular desbloqueado. Procure na bancada da frente o envelope com a etiqueta do armário de Zoe.');
  }
  function finishApartmentRecording() {
    setChallengeOpen(false);
    const next = backgrounds[sceneIndex + 1];
    if (next) { setFlashbackTarget(next.key); setFlashbackKind('apartment'); }
  }
  function openJournal() { state.readJournal(); setJournalOpen(true); }
  function openFacultyPuzzle() { state.readJournal(); setPuzzleScene('faculdade-laboratorio'); }
  function memory() { setJournalOpen(false); if (!puzzlesComplete('infancia', useGameStore.getState().progress.choices)) { setPuzzleScene('infancia'); return; } setMemoryOpen(true); }
  function finishMemory() {
    const firstViewing = !state.session.memoryWatched;
    state.finishMemory(); setMemoryOpen(false);
    if (firstViewing && sceneKey === 'infancia') window.dispatchEvent(new Event('was:exit-door'));
  }
  function menu() { setGameIntro(false); state.setPaused(true); state.inspect(null); setPauseOpen(false); setJournalOpen(false); setMemoryOpen(false); setStarted(false); }
  function fullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen?.().catch(() => state.notify('Tela cheia indisponível neste navegador.'));
  }
  const ready = canRecoverMemory(state.progress) && !state.progress.memoryRecovered;
  const phaseObjective = phaseObjectives.find(item => item.scene === sceneKey);
  const phaseFound = phaseObjective ? state.progress.phaseClues[sceneKey]?.length ?? 0 : 0;
  const phaseReady = !!phaseObjective && canCompletePhase(state.progress, sceneKey);
  const nextScene = backgrounds[sceneIndex + 1];
  const nextName = nextScene?.title.replace(/^\d+ — /, '') ?? 'Campo';
  const hasPuzzle = !puzzlesComplete(sceneKey, state.progress.choices);
  const samePhase = nextScene?.phase === background.phase;
  const actionText = hasPuzzle ? 'Reconstruir as pistas' : samePhase ? 'Entrar em ' + nextName : 'Continuar a lembrança';
  const objectiveText = sceneKey === 'infancia'
    ? state.session.memoryWatched ? 'Vá até a porta do quarto para sair.' : ready || state.progress.memoryRecovered ? 'Abra o diário e reconstrua a lembrança.' : 'Investigue os objetos com E e reúna as três pistas no diário.'
    : phaseReady ? hasPuzzle ? sceneKey === 'faculdade-laboratorio' ? 'As pistas estão reunidas. Abra o Diário (J) e selecione “Reconstruir as pistas”. Ordene os acontecimentos da agenda e responda à questão sobre o hipocampo.' : sceneKey === 'cenario-03' ? 'Você reuniu as pistas da sala. Reconstrua no Diário a rotina de Oliver e Zoe. Depois, siga para a parede de quadros.' : 'As pistas estão reunidas. Abra o Diário (J) e selecione “Reconstruir as pistas” para resolver o puzzle.' : samePhase ? 'Área explorada. Siga para ' + nextName + '.' : 'Conclua a lembrança. Após o storyboard, você seguirá para ' + nextName + '.'
    : sceneKey === 'infancia-corredor' ? 'Caminhe da janela até a porta à direita, passando pelo mural. ' + phaseFound + '/3 lembranças.'
    : (tasks[sceneKey] ?? phaseObjective?.thought ?? '') + ' Investigue com E. ' + phaseFound + '/' + (phaseObjective?.clues.length ?? 0) + ' pistas.';
  return <main className={`was-app ${preferences.largeText ? 'large-text' : ''} ${preferences.reducedMotion ? 'reduced-motion' : ''}`}>
    <MusicPlayer scene={!started ? 'menu' : flashbackKind || memoryOpen || endingOpen ? 'flashbacks_final' : sceneKey} suspended={gameIntro} />
    {!started ? <MainMenu completed={completed} slots={state.slots} onStart={slot => enter(false, true, slot)} onContinue={slot => enter(false, false, slot)} onAdmin={scene => enter(true, false, undefined, scene)}/> :
      <section className="game-shell" aria-label="Exploração do WAS">
        {isField ? <FieldFinale paused={blocked} onPause={() => { setTab('main'); setPauseOpen(true); }} onFinish={() => { setEndingChoice('question'); setEndingOpen(true); }}/> : <><Suspense fallback={<div className="scene-loading" role="status">Preparando cenário…</div>}><Game key={run} sceneKey={sceneKey}/></Suspense>
        {!['infancia', 'cenario-05', 'cenario-06'].includes(sceneKey) && <div className="game-vignette" aria-hidden="true"/>}
        <header className="game-hud">
          <div className="hud-location"><span className="eyebrow">{admin ? 'ADMIN · EXPLORAÇÃO' : `FASE ${background.phase + 1} · ${phaseObjective?.title ?? 'LEMBRANÇA'}`}</span><h1>{background.title.replace(/^\d+ — /, '')}</h1></div>
          <nav aria-label="Ações durante o jogo"><button className="hud-button" onClick={openJournal}>Diário {state.unread > 0 && <b className="unread-count" aria-label={`${state.unread} pistas novas`}>{state.unread}</b>}<kbd>J</kbd></button><button className="hud-button" onClick={() => { setTab('main'); setPauseOpen(true); }}>Pausa <kbd>Esc</kbd></button></nav>
        </header>
        <div className="hud-bottom">
          <section className={`objective${objectiveExpanded ? ' objective-expanded' : ''}`} aria-label="Objetivo atual">
            <button className="objective-toggle" aria-label={objectiveExpanded ? 'Recolher objetivo' : 'Expandir objetivo'} aria-expanded={objectiveExpanded} onClick={() => setObjectiveExpanded(value => !value)}>
              {objectiveExpanded ? <><strong>Objetivo · {phaseObjective?.title ?? 'Recuperar a primeira lembrança'}</strong><span className="objective-chevron" aria-hidden="true">⌄</span></> : <span className="objective-compact-icon" aria-hidden="true"><svg viewBox="0 0 32 32" focusable="false"><path d="M15.8 6.3c-1.4-2.1-4.5-2.3-6-.3-2.7-.3-4.7 2-4.1 4.6-2.1 1.7-1.9 4.9.3 6.3-1 2.6.6 5.4 3.4 5.7.7 2.4 3.7 3.3 5.7 1.7l.7-.7V7.2l-.7-.9Zm.4 0c1.4-2.1 4.5-2.3 6-.3 2.7-.3 4.7 2 4.1 4.6 2.1 1.7 1.9 4.9-.3 6.3 1 2.6-.6 5.4-3.4 5.7-.7 2.4-3.7 3.3-5.7 1.7l-.7-.7V7.2l.7-.9Z"/><path d="M10 11.2c1.5.2 2.4 1.2 2.5 2.6m-3.4 4.4c1.8-.2 2.8-1.1 3.1-2.6m9.8-4.4c-1.5.2-2.4 1.2-2.5 2.6m3.4 4.4c-1.8-.2-2.8-1.1-3.1-2.6"/></svg></span>}
            </button>
            <div className="objective-details">
              <p>{objectiveText}</p>
              {!admin && phaseReady && (sceneKey === 'faculdade-laboratorio' || sceneKey === 'cenario-03') && hasPuzzle && <button className="objective-action" onClick={() => { state.readJournal(); setPuzzleScene(sceneKey); }}>Abrir puzzle no Diário</button>}
              {!admin && phaseReady && !(hasPuzzle && (sceneKey === 'faculdade-laboratorio' || sceneKey === 'cenario-03')) && <button className="objective-action" onClick={advanceCurrentPhase}>{actionText}</button>}
              {sceneKey === 'infancia' && state.session.memoryWatched && <button className="objective-action" onClick={() => window.dispatchEvent(new Event('was:exit-door'))}>Sair pela porta do quarto</button>}
              {sceneKey === 'infancia' && (ready || (state.progress.memoryRecovered && !state.session.memoryWatched)) && <button className="objective-action" onClick={openJournal}>Abrir diário</button>}
            </div>
          </section>
          {preferences.showHints && <div className="hud-status"><p><kbd>WASD</kbd> / setas · mover <span>·</span> <kbd>E</kbd> investigar</p></div>}
        </div>
        {state.notice && <p className="game-toast" role="status">{state.notice}</p>}
        <div className="touch-controls" aria-label="Controles de toque"><Joystick disabled={blocked || sleepActive}/></div>
        <DrowsinessEvent key={run} enabled={!blocked} onActive={setSleepActive} onRestart={() => { setEndingOpen(false); setChallengeOpen(false); setTransition(null); enter(false, true); }}/>
        </>}{transition && <div className="scene-transition" role="status"><span className="eyebrow">WAS</span><p>{backgrounds.find(item => item.key === transition)?.title}</p></div>}
      </section>}
    {started && gameIntro && <IntroVideo onFinish={() => setGameIntro(false)}/>}
    <Modal open={started && pauseOpen} title="Jogo pausado" onClose={() => setPauseOpen(false)} className="pause-dialog">
      <div className="inspection-heading"><div><p className="eyebrow">WAS</p><h2>{tab === 'preferences' ? 'Preferências' : tab === 'controls' ? 'Como explorar' : tab === 'admin' ? 'Explorar cenários' : 'Pausa'}</h2></div><button className="secondary" onClick={() => setPauseOpen(false)}>Retomar</button></div>
      {tab === 'main' ? <><p className="note">Seu progresso permanece salvo. Explore no seu ritmo.</p><nav className="pause-actions" aria-label="Opções de pausa"><button onClick={() => setPauseOpen(false)}>Continuar</button><button className="secondary" onClick={() => setTab('preferences')}>Preferências</button><button className="secondary" onClick={() => setTab('controls')}>Controles e ajuda</button>{document.fullscreenEnabled && <button className="secondary" onClick={fullscreen}>Alternar tela cheia</button>}{admin && <button className="secondary" onClick={() => setTab('admin')}>Escolher cenário</button>}<button className="secondary" onClick={menu}>Salvar e voltar ao menu</button></nav></> : tab === 'preferences' ? <Preferences/> : tab === 'controls' ? <div className="control-guide"><p><kbd>WASD</kbd> ou setas: caminhar. <kbd>E</kbd>: investigar o objeto próximo. <kbd>J</kbd>: diário. <kbd>Esc</kbd>: pausa ou fechar janela.</p><p>Aproxime-se de um objeto e clique nele ou pressione E. Na inspeção, arraste para girar e procure detalhes. Use “Preciso de uma pista” quando quiser ajuda.</p><p>Registre as três pistas e relacione-as no diário para reconstruir a lembrança. Durante a exploração, Oliver pode sentir sono. Quando a tela escurecer, pressione E repetidamente para recuperar o fôlego. Se adormecer, a tentativa termina e você pode reiniciar a história.</p></div> : <section className="admin-controls"><p className="note">Acesso administrativo · escolha qualquer fase para abrir diretamente.</p><div className="admin-phase-grid" aria-label="Navegar entre fases">{backgrounds.map((item, index) => <button key={item.key} aria-current={sceneKey === item.key ? 'page' : undefined} className={sceneKey === item.key ? 'admin-phase-current' : 'secondary'} onClick={() => visitScene(item.key)}><span>0{index + 1}</span>{item.title.replace(/^\d+ — /, '')}</button>)}</div>{sceneKey === 'infancia' && <div className="rotation-controls">{childhoodObjects.map(object => <button className="secondary" key={object.id} onClick={() => { setPauseOpen(false); state.inspect(object.id); }}>{object.name}</button>)}</div>}</section>}
      {tab !== 'main' && <button className="text-button" onClick={() => setTab('main')}>← Voltar à pausa</button>}
    </Modal>
    {puzzleScene && <PuzzleSequence scene={puzzleScene} onClose={() => setPuzzleScene(null)} onFinish={() => { const solvedScene = puzzleScene; setPuzzleScene(null); if (solvedScene === 'infancia') setMemoryOpen(true); else advanceCurrentPhase(); }}/>}
    <InspectionDialog/>
    {sceneKey === 'infancia' ? <MemoryJournal open={journalOpen} onClose={() => setJournalOpen(false)} onMemory={memory}/> : <PhaseJournal scene={sceneKey} open={journalOpen} onClose={() => setJournalOpen(false)} onReconstruct={() => { setJournalOpen(false); setPuzzleScene(sceneKey); }}/>}
    <Modal open={schoolPhoneOpen} title="Celular de Oliver" onClose={() => setSchoolPhoneOpen(false)} className="journal-dialog">
      <button type="button" className="secondary" style={{ float: 'right', padding: '0.4rem 0.8rem' }} aria-label="Fechar celular" onClick={() => setSchoolPhoneOpen(false)}>×</button>
      <p className="eyebrow">CELULAR ANTIGO · TELA TRINCADA</p><h2>{schoolPhoneUnlocked ? 'Mensagens' : 'Digite a senha'}</h2>
      {!schoolPhoneUnlocked ? <><p>O caderno dentro da bolsa guarda uma data no formato dia, mês e ano.</p><label className="connection-field">Senha do celular<input autoComplete="off" inputMode="numeric" maxLength={8} value={schoolPassword} onChange={event => { setPhoneError(false); setSchoolPassword(event.target.value.replace(/\D/g, '').slice(0, 8)); }} placeholder="DDMMAAAA"/></label>{phoneError && <p role="alert">Senha incorreta. Confira a data no caderno e tente novamente.</p>}<button onClick={unlockSchoolPhone}>Desbloquear</button></> : <><p role="status">Senha correta. Celular desbloqueado.</p><article className="journal-entry"><h3>Zoe</h3><p>“Você está melhor? Não esquece a marmita e o trabalho, tá?”</p></article><article className="journal-entry"><h3>Michael</h3><p>“Pega uma coisa no armário da Zoe antes de ir embora.”</p></article><div className="actions"><button onClick={() => setSchoolPhoneOpen(false)}>Fechar celular</button></div></>}
    </Modal>
    <Modal open={schoolChoiceOpen} title="A pergunta do pai" onClose={() => setSchoolChoiceOpen(false)} className="journal-dialog"><p className="eyebrow">FLASHBACK · REDAÇÃO ESCOLAR</p><h2>“Você quer mesmo ser médico como eu?”</h2><p>Escolha a resposta de Oliver. Ela muda apenas o tom desta lembrança.</p><div className="pause-actions"><button onClick={() => { setSchoolChoiceOpen(false); finishChoiceFlashback('school', 'quero-ser-medico'); }}>“Quero ser médico como você.”</button><button className="secondary" onClick={() => { setSchoolChoiceOpen(false); finishChoiceFlashback('school', 'nao-sei-ainda'); }}>“Eu ainda não sei.”</button></div></Modal>
    <Modal open={facultyChoiceOpen} title="Michael pergunta" onClose={() => setFacultyChoiceOpen(false)} className="journal-dialog"><p className="eyebrow">FLASHBACK · FACULDADE</p><h2>Michael pergunta se Oliver lembra de ter passado mal.</h2><div className="pause-actions"><button onClick={() => { setFacultyChoiceOpen(false); finishChoiceFlashback('friend', 'ignorar'); }}>Ignorar a pergunta</button><button className="secondary" onClick={() => { setFacultyChoiceOpen(false); finishChoiceFlashback('friend', 'fingir-bem'); }}>Fingir que está tudo bem</button></div></Modal>
    <Modal open={challengeOpen} title={sceneKey === 'cenario-05' ? 'Gravação no apartamento' : 'Reconstruir a sequência'} onClose={() => setChallengeOpen(false)} className="journal-dialog">
      {sceneKey === 'cenario-05' ? <>
        <p className="eyebrow">NOTEBOOK · GRAVAÇÃO DE CHAMADA</p><h2>Uma conversa com o pai</h2>
        <p>Os lembretes e a conversa com Zoe ajudam Oliver a reconhecer a ligação. Na gravação, só é possível ouvir o lado dele.</p>
        <button onClick={finishApartmentRecording}>Ouvir a gravação</button>
      </> : <>
        <p className="eyebrow">PUZZLE · PRONTUÁRIO</p><h2>O que aconteceu primeiro?</h2>
        <p>Ordene os três fragmentos para entender por que Oliver acordou no hospital.</p>
        {['Primeiro', 'Depois', 'Por fim'].map((label, index) => (
          <label className="connection-field" key={label}>
            {label}
            <select value={hospitalOrder[index]} onChange={event => setHospitalOrder(order => order.map((item, i) => i === index ? event.target.value : item))}>
              <option value="">Escolha um fragmento…</option><option value="exames">Os exames revelam a condição</option>
              <option value="cirurgia">A cirurgia acontece</option><option value="acordar">Oliver desperta no hospital</option>
            </select>
          </label>
        ))}
        <button disabled={hospitalOrder.some(item => !item) || new Set(hospitalOrder).size !== 3} onClick={resolveHospitalPuzzle}>Confirmar sequência</button>
      </>}
    </Modal>
    <Modal open={endingOpen} title={endingChoice === 'question' ? 'Você quer lembrar?' : 'Final'} onClose={() => setEndingOpen(false)} className={`journal-dialog ${endingChoice === 'release' ? 'ending-white' : ''}`}>
      {endingChoice === 'question' ? <><p className="eyebrow">ÚLTIMA ESCOLHA</p><h2>VOCÊ QUER LEMBRAR?</h2><div className="pause-actions"><button onClick={() => setEndingChoice('remember')}>Sim, quero lembrar</button><button className="secondary" onClick={() => setEndingChoice('release')}>Não quero lembrar</button></div></> : endingChoice === 'remember' ? <><p className="eyebrow">EPÍLOGO</p><h2>Algumas coisas a gente esquece. Outras permanecem com a gente.</h2><p>O vídeo final de Oliver ainda não está incluído nos arquivos do projeto. Quando for adicionado, esta escolha exibirá a sequência da infância até o campo.</p><div className="actions"><button onClick={completeGame}>Ir aos créditos</button><button className="secondary" onClick={() => setEndingOpen(false)}>Voltar ao campo</button></div></> : <div className="ending-white-content"><p>A lembrança se apaga.</p><button className="secondary" onClick={completeGame}>Fim · voltar ao menu</button></div>}
    </Modal>
    <MemorySequence open={memoryOpen} onFinish={finishMemory} onClose={() => setMemoryOpen(false)}/>
    {flashbackKind && <FlashbackSequence kind={flashbackKind} open={true} onFinish={finishFlashback} branch={state.progress.choices[sceneKey]}/>}
  </main>;
}




