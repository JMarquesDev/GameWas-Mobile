import { EndingSequence } from './EndingSequence';
import { IntroVideo } from './IntroVideo';
import { MusicPlayer } from './MusicPlayer';
import { PuzzleSequence, puzzlesComplete } from '../puzzles/PuzzleSequence';
import { ClockPuzzle } from '../puzzles/ClockPuzzle';
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
import { SchoolWorkDialog } from '../inspection/SchoolWorkDialog';
import { SchoolNotebookDialog } from '../inspection/SchoolNotebookDialog';
import { NumericKeypad } from '../ui/NumericKeypad';
import { ChairMarkDialog } from '../inspection/ChairMarkDialog';
import { ClassroomCubbiesDialog } from '../inspection/ClassroomCubbiesDialog';
import { MemoryJournal } from './MemoryJournal';
import { Preferences } from './Preferences';
import { Modal } from './Modal';
import { MemorySequence } from './MemorySequence';
import { FlashbackSequence } from './FlashbackSequence';
import { PhaseJournal } from './PhaseJournal';
import { gameAudio } from '../game/audio';
import './diary-hint.css';
import { Joystick } from './Joystick';
const tasks: Record<string, string> = {
  'infancia-sala': 'Descubra o que Oliver queria ser quando criança.',
  'cenario-02': 'No laboratório da faculdade, leia o diário, recupere as mensagens e ajuste o relógio.',
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
  const [puzzleReplay, setPuzzleReplay] = useState(false);
  const [objectiveExpanded, setObjectiveExpanded] = useState(true);
  const [sleepActive, setSleepActive] = useState(false);
  const [run, setRun] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameIntro, setGameIntro] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [sceneKey, setSceneKey] = useState('infancia');
  const [journalOpen, setJournalOpen] = useState(false);
  const [endingOpen, setEndingOpen] = useState(false);
  const [endingChoice, setEndingChoice] = useState<'question' | 'remember' | 'release' | 'credits'>('question');
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [schoolPhoneOpen, setSchoolPhoneOpen] = useState(false);
  const [schoolNotebookOpen, setSchoolNotebookOpen] = useState(false);
  const [schoolWorkOpen, setSchoolWorkOpen] = useState(false);
  const [chairMarkOpen, setChairMarkOpen] = useState(false);
  const [classroomCubbiesOpen, setClassroomCubbiesOpen] = useState(false);
  const [schoolPassword, setSchoolPassword] = useState('');
  const [schoolPasswordError, setSchoolPasswordError] = useState('');
  const [schoolChoiceOpen, setSchoolChoiceOpen] = useState(false);
  const [clockMode, setClockMode] = useState<'diary' | 'clock' | null>(null);
  const [friendChoiceOpen, setFriendChoiceOpen] = useState(false);
  const [hospitalOrder, setHospitalOrder] = useState(['', '', '']);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [flashbackKind, setFlashbackKind] = useState<FlashbackKind | null>(null);
  const [flashbackTarget, setFlashbackTarget] = useState<string | null>(null);
  const [transition, setTransition] = useState<string | null>(null);
  const [tab, setTab] = useState<'main' | 'preferences' | 'controls' | 'admin'>('main');
  const state = useGameStore();
  const schoolPhoneUnlocked = state.progress.choices['school-phone'] === 'unlocked';
  const phoneClues = state.progress.phaseClues['cenario-02'] ?? [];
  const phoneCluesReady = ['bolsa-caderno', 'redacao-futuro', 'relogio-aula'].every(id => phoneClues.includes(id));
  const preferences = usePreferences();
  const isField = sceneKey === 'cenario-08';
  const sceneIndex = backgrounds.findIndex(background => background.key === sceneKey);
  const background = backgrounds[sceneIndex] ?? backgrounds[0];
  useEffect(() => { setObjectiveExpanded(true); }, [sceneKey]);
  useEffect(() => {
    if (sceneKey === 'cenario-02' && started && !admin && state.progress.choices['puzzle:cenario-02:relogio'] !== 'solved') {
      state.notify('Há um diário no canto do laboratório. Parte da escrita está desfocada; investigue outros objetos para recuperar as anotações.');
    }
  }, [sceneKey, started, admin]);
  const blocked = gameIntro || !!puzzleScene || pauseOpen || journalOpen || memoryOpen || endingOpen || challengeOpen || schoolPhoneOpen || schoolNotebookOpen || schoolWorkOpen || chairMarkOpen || classroomCubbiesOpen || schoolChoiceOpen || friendChoiceOpen || !!clockMode || !!flashbackKind || !!transition || !!state.inspecting;
  useEffect(() => { useGameStore.getState().setPaused(!started || blocked || sleepActive); }, [started, blocked, sleepActive]);
  useEffect(() => {
    const doorReached = () => {
      const progress = useGameStore.getState().progress;
      if (!progress.memoryRecovered || !puzzlesComplete('infancia', progress.choices)) return;
      useGameStore.getState().advancePhase(backgrounds[1].phase);
      setTransition(backgrounds[1].key);
    };
    window.addEventListener('was:door-flashback', doorReached);
    return () => window.removeEventListener('was:door-flashback', doorReached);
  }, []);
  useEffect(() => {
    const classroomDoorReached = () => {
      if (sceneKey !== 'infancia-corredor' || (!admin && !canCompletePhase(useGameStore.getState().progress, sceneKey))) return;
      if (!admin) useGameStore.getState().advancePhase(backgrounds[2].phase);
      setTransition(backgrounds[2].key);
    };
    window.addEventListener('was:classroom-door', classroomDoorReached);
    return () => window.removeEventListener('was:classroom-door', classroomDoorReached);
  }, [sceneKey, admin]);
  useEffect(() => {
    const openPhone = () => { if (sceneKey === 'cenario-02') setSchoolPhoneOpen(true); };
    window.addEventListener('was:school-phone', openPhone);
    return () => window.removeEventListener('was:school-phone', openPhone);
  }, [sceneKey]);
  useEffect(() => {
    const openDiary = () => {
      if (sceneKey !== 'cenario-02') return;
      const store = useGameStore.getState();
      if (!store.progress.phaseClues['cenario-02']?.includes('diario-experimento')) { store.collectPhaseClue('cenario-02', 'diario-experimento'); gameAudio.cue('clue'); }
      setClockMode('diary');
    };
    const openClock = () => { if (sceneKey === 'cenario-02') setClockMode('clock'); };
    window.addEventListener('was:clock-diary', openDiary);
    window.addEventListener('was:clock-puzzle', openClock);
    return () => { window.removeEventListener('was:clock-diary', openDiary); window.removeEventListener('was:clock-puzzle', openClock); };
  }, [sceneKey]);
  useEffect(() => {
    const openNotebook = () => {
      if (sceneKey !== 'cenario-02') return;
      const store = useGameStore.getState();
      if (!store.progress.phaseClues['cenario-02']?.includes('bolsa-caderno')) { store.collectPhaseClue('cenario-02', 'bolsa-caderno'); gameAudio.cue('clue'); }
      setSchoolNotebookOpen(true);
    };
    window.addEventListener('was:school-notebook', openNotebook);
    return () => window.removeEventListener('was:school-notebook', openNotebook);
  }, [sceneKey]);
  useEffect(() => {
    const openWork = () => { if (sceneKey === 'infancia-sala') setSchoolWorkOpen(true); };
    window.addEventListener('was:school-work', openWork);
    return () => window.removeEventListener('was:school-work', openWork);
  }, [sceneKey]);
  useEffect(() => {
    const openChair = () => { if (sceneKey === 'infancia-sala') setChairMarkOpen(true); };
    window.addEventListener('was:chair-mark', openChair);
    return () => window.removeEventListener('was:chair-mark', openChair);
  }, [sceneKey]);
  useEffect(() => {
    const openCubbies = () => { if (sceneKey === 'infancia-sala') setClassroomCubbiesOpen(true); };
    window.addEventListener('was:classroom-cubbies', openCubbies);
    return () => window.removeEventListener('was:classroom-cubbies', openCubbies);
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
    if (key === 'cenario-02') return 'friend';
    if (key === 'cenario-03') return 'relationship';
    if (key === 'cenario-04') return 'photos';
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
    if (!puzzlesComplete(sceneKey, useGameStore.getState().progress.choices)) { setPuzzleScene(sceneKey); return; }
    if (sceneKey === 'cenario-02') {
      if (!schoolPhoneUnlocked) { setSchoolPhoneOpen(true); return; }
      setFriendChoiceOpen(true); return;
    }
    const memory = phaseFlashback(sceneKey);
    if (memory) { setFlashbackTarget(key); setFlashbackKind(memory); return; }
    if (target.phase === backgrounds[sceneIndex].phase) { state.advancePhase(target.phase); setTransition(key); return; }
    state.advancePhase(target.phase); setTransition(key);
  }
  function finishFlashback() {
    if (flashbackKind === 'field') { setFlashbackKind(null); setEndingChoice('question'); setEndingOpen(true); return; }
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
      setFriendChoiceOpen(true); return;
    }
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
    if (!phoneCluesReady) { setSchoolPasswordError('Olhe o caderno na bolsa para reunir as pistas.'); return; }
    if (schoolPassword.replace(/\D/g, '') !== '17091990') { setSchoolPasswordError('A senha não funcionou. Releia o bilhete no caderno.'); return; }
    useGameStore.getState().recordChoice('school-phone', 'unlocked'); setSchoolPassword(''); setSchoolPasswordError(''); state.notify('Celular desbloqueado. Procure na bancada da frente o envelope com a etiqueta do armário de Zoe.');
  }
  function finishApartmentRecording() {
    setChallengeOpen(false);
    const next = backgrounds[sceneIndex + 1];
    if (next) { setFlashbackTarget(next.key); setFlashbackKind('apartment'); }
  }
  function openJournal() { state.readJournal(); setJournalOpen(true); }
  function memory() { setJournalOpen(false); if (!puzzlesComplete('infancia', useGameStore.getState().progress.choices)) { setPuzzleScene('infancia'); return; } setMemoryOpen(true); }
  function finishMemory() {
    state.finishMemory(); setMemoryOpen(false);
  }
  function menu() { setGameIntro(false); state.setPaused(true); state.inspect(null); setPauseOpen(false); setJournalOpen(false); setMemoryOpen(false); setStarted(false); }
  function fullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen?.().catch(() => state.notify('Tela cheia indisponível neste navegador.'));
  }
  const ready = canRecoverMemory(state.progress) && !state.progress.memoryRecovered;
  useEffect(() => {
    if (started && !admin && sceneKey === 'infancia' && ready && !state.session.memoryWatched) {
      state.notify('As pistas estão reunidas. Toque em Diário para reconstruir a lembrança.');
    }
  }, [started, admin, sceneKey, ready, state.session.memoryWatched]);
  const diaryHint = !admin && sceneKey === 'infancia' && ready && !state.session.memoryWatched;
  const phaseObjective = phaseObjectives.find(item => item.scene === sceneKey);
  const phaseFound = phaseObjective ? state.progress.phaseClues[sceneKey]?.length ?? 0 : 0;
  const phaseReady = !!phaseObjective && canCompletePhase(state.progress, sceneKey);
  const nextScene = backgrounds[sceneIndex + 1];
  const hasPuzzle = !puzzlesComplete(sceneKey, state.progress.choices);
  const samePhase = nextScene?.phase === background.phase;
  const actionText = hasPuzzle ? 'Reconstruir as pistas' : 'Continuar a lembrança';
  const objectiveText = sceneKey === 'infancia'
    ? state.session.memoryWatched && puzzlesComplete('infancia', state.progress.choices) ? 'Sair pela porta. Caminhe até ela e toque para continuar.' : ready || state.progress.memoryRecovered ? 'Abra o diário e reconstrua a lembrança.' : 'Investigue os objetos com E e reúna as três pistas no diário.'
    : sceneKey === 'infancia-corredor' ? phaseReady ? 'Entrar na sala de aula. Aproxime-se e toque na porta.' : 'Caminhe da janela até a porta à direita, passando pelo mural. ' + phaseFound + '/3 lembranças.'
    : phaseReady ? hasPuzzle ? 'As pistas estão reunidas. Resolva o puzzle para continuar.' : samePhase ? 'Área explorada. Continue quando estiver pronto.' : 'Conclua a lembrança para continuar.'
    : (tasks[sceneKey] ?? phaseObjective?.thought ?? '') + ' Investigue com toque. ' + phaseFound + '/' + (phaseObjective?.clues.length ?? 0) + ' pistas.' + (phaseObjective && phaseFound === phaseObjective.clues.length - 1 ? ' Falta uma pista; confira os fragmentos no diário.' : '');
  return <main className={`was-app ${preferences.largeText ? 'large-text' : ''} ${preferences.reducedMotion ? 'reduced-motion' : ''}`}>
    <MusicPlayer scene={!started ? 'menu' : flashbackKind || memoryOpen || endingOpen ? 'flashbacks_final' : sceneKey} suspended={gameIntro} />
    {!started ? <MainMenu completed={completed} slots={state.slots} onStart={slot => enter(false, true, slot)} onContinue={slot => enter(false, false, slot)} onAdmin={scene => enter(true, false, undefined, scene)}/> :
      <section className="game-shell" aria-label="Exploração do WAS">
        {isField ? <FieldFinale paused={blocked} onPause={() => { setTab('main'); setPauseOpen(true); }} onCredits={() => { setEndingChoice('credits'); setEndingOpen(true); }} onFinish={() => { if (puzzlesComplete('cenario-08', useGameStore.getState().progress.choices)) setFlashbackKind('field'); else setPuzzleScene('cenario-08'); }}/> : <><Suspense fallback={<div className="scene-loading" role="status">Preparando cenário…</div>}><Game key={run} sceneKey={sceneKey}/></Suspense>
        {!['infancia', 'cenario-05', 'cenario-06'].includes(sceneKey) && <div className="game-vignette" aria-hidden="true"/>}
        <header className="game-hud">
          <div className="hud-location"><span className="eyebrow">{admin ? 'ADMIN · EXPLORAÇÃO' : `FASE ${background.phase + 1} · ${phaseObjective?.title ?? 'LEMBRANÇA'}`}</span><h1>{background.title.replace(/^\d+ — /, '')}</h1></div>
          <nav aria-label="Ações durante o jogo"><button className={`hud-button ${diaryHint ? 'diary-ready' : ''}`} onClick={openJournal} aria-label={diaryHint ? 'Diário: pistas reunidas, toque para abrir' : 'Abrir diário'}>Diário {state.unread > 0 && <b className="unread-count" aria-label={`${state.unread} pistas novas`}>{state.unread}</b>}{diaryHint && !journalOpen && <span className="diary-ready-hint" aria-hidden="true">Toque para abrir</span>}</button><button className="hud-button" onClick={() => { setTab('main'); setPauseOpen(true); }}>Pausa</button></nav>
        </header>
        <div className="hud-bottom">
          <section className={`objective${objectiveExpanded ? ' objective-expanded' : ''}`} aria-label="Objetivo atual">
            <button className="objective-toggle" aria-label={objectiveExpanded ? 'Recolher objetivo' : 'Expandir objetivo'} aria-expanded={objectiveExpanded} onClick={() => setObjectiveExpanded(value => !value)}>
              {objectiveExpanded ? <><strong>Objetivo · {phaseObjective?.title ?? 'Recuperar a primeira lembrança'}</strong><span className="objective-chevron" aria-hidden="true">⌄</span></> : <span className="objective-compact-icon" aria-hidden="true"><svg viewBox="0 0 32 32" focusable="false"><path d="M15.8 6.3c-1.4-2.1-4.5-2.3-6-.3-2.7-.3-4.7 2-4.1 4.6-2.1 1.7-1.9 4.9.3 6.3-1 2.6.6 5.4 3.4 5.7.7 2.4 3.7 3.3 5.7 1.7l.7-.7V7.2l-.7-.9Zm.4 0c1.4-2.1 4.5-2.3 6-.3 2.7-.3 4.7 2 4.1 4.6 2.1 1.7 1.9 4.9-.3 6.3 1 2.6-.6 5.4-3.4 5.7-.7 2.4-3.7 3.3-5.7 1.7l-.7-.7V7.2l.7-.9Z"/><path d="M10 11.2c1.5.2 2.4 1.2 2.5 2.6m-3.4 4.4c1.8-.2 2.8-1.1 3.1-2.6m9.8-4.4c-1.5.2-2.4 1.2-2.5 2.6m3.4 4.4c-1.8-.2-2.8-1.1-3.1-2.6"/></svg></span>}
            </button>
            <div className="objective-details">
              <p>{objectiveText}</p>
              {!admin && phaseReady && sceneKey !== 'infancia-corredor' && <button className="objective-action" onClick={advanceCurrentPhase}>{actionText}</button>}
              {sceneKey === 'infancia' && (ready || (state.progress.memoryRecovered && (!state.session.memoryWatched || !puzzlesComplete('infancia', state.progress.choices)))) && <button className="objective-action" onClick={openJournal}>Abrir diário</button>}
            </div>
          </section>
        </div>
        {state.notice && <p className="game-toast" role="status">{state.notice}</p>}
        <div className="touch-controls" aria-label="Controles de toque"><Joystick disabled={blocked || sleepActive}/></div>
        <DrowsinessEvent key={run} enabled={!blocked} onActive={setSleepActive} onRestart={() => { setEndingOpen(false); setChallengeOpen(false); setTransition(null); enter(false, true); }}/>
        </>}{transition && <div className="scene-transition" role="status"><span className="eyebrow">WAS</span><p>{backgrounds.find(item => item.key === transition)?.title}</p></div>}
      </section>}
    {started && gameIntro && <IntroVideo onFinish={() => setGameIntro(false)}/>}
    <Modal open={started && pauseOpen} title="Jogo pausado" onClose={() => setPauseOpen(false)} className="pause-dialog">
      <div className="inspection-heading"><div><p className="eyebrow">WAS</p><h2>{tab === 'preferences' ? 'Preferências' : tab === 'controls' ? 'Como explorar' : tab === 'admin' ? 'Explorar cenários' : 'Pausa'}</h2></div><button className="secondary" onClick={() => setPauseOpen(false)}>Retomar</button></div>
      {tab === 'main' ? <><p className="note">Seu progresso permanece salvo. Explore no seu ritmo.</p><nav className="pause-actions" aria-label="Opções de pausa"><button onClick={() => setPauseOpen(false)}>Continuar</button><button className="secondary" onClick={() => setTab('preferences')}>Preferências</button><button className="secondary" onClick={() => setTab('controls')}>Controles e ajuda</button>{admin && <button className="secondary" onClick={() => setTab('admin')}>Escolher cenário</button>}<button className="secondary" onClick={menu}>Salvar e voltar ao menu</button></nav></> : tab === 'preferences' ? <Preferences/> : tab === 'controls' ? <div className="control-guide"><p>Use o joystick virtual para andar e toque nos objetos quando estiver próximo. Toque no Diário para rever pistas e na Pausa para salvar.</p><p>Na inspeção, arraste o dedo para girar o objeto e use os botões para aproximar ou afastar. Nos puzzles, escolha uma peça e toque no espaço correspondente.</p><p>Se Oliver sentir sono, toque repetidamente em Respirar para continuar.</p></div> : <section className="admin-controls"><p className="note">Acesso administrativo · escolha qualquer fase para abrir diretamente.</p><div className="admin-phase-grid" aria-label="Navegar entre fases">{backgrounds.map(item => <button key={item.key} aria-current={sceneKey === item.key ? 'page' : undefined} className={sceneKey === item.key ? 'admin-phase-current' : 'secondary'} onClick={() => visitScene(item.key)}><span>{item.title.slice(0, 2)}</span>{item.title.replace(/^\d+ — /, '')}</button>)}</div>{sceneKey === 'infancia' && <div className="rotation-controls">{childhoodObjects.map(object => <button className="secondary" key={object.id} onClick={() => { setPauseOpen(false); state.inspect(object.id); }}>{object.name}</button>)}</div>}</section>}
      
      {tab !== 'main' && <button className="text-button" onClick={() => setTab('main')}>← Voltar à pausa</button>}
    </Modal>
    {puzzleScene && <PuzzleSequence scene={puzzleScene} replay={puzzleReplay} onClose={() => { setPuzzleScene(null); setPuzzleReplay(false); }} onFinish={() => { const solvedScene = puzzleScene; setPuzzleScene(null); setPuzzleReplay(false); if (solvedScene === 'infancia') setMemoryOpen(true); else if (solvedScene === 'cenario-08') setFlashbackKind('field'); else advanceCurrentPhase(); }}/>}
    {clockMode && <ClockPuzzle mode={clockMode} onClose={() => setClockMode(null)}/>}
    <InspectionDialog/>
    <SchoolWorkDialog open={schoolWorkOpen} onClose={() => setSchoolWorkOpen(false)}/>
    <SchoolNotebookDialog open={schoolNotebookOpen} onClose={() => setSchoolNotebookOpen(false)}/>
    <ChairMarkDialog open={chairMarkOpen} onClose={() => setChairMarkOpen(false)}/>
    <ClassroomCubbiesDialog open={classroomCubbiesOpen} onClose={() => setClassroomCubbiesOpen(false)}/>
    {sceneKey === 'infancia' ? <MemoryJournal open={journalOpen} onClose={() => setJournalOpen(false)} onMemory={memory} onPuzzle={() => { setJournalOpen(false); setPuzzleReplay(true); setPuzzleScene('infancia'); }}/> : <PhaseJournal scene={sceneKey} open={journalOpen} onClose={() => setJournalOpen(false)}/>}
    <Modal open={schoolPhoneOpen} title="Celular de Oliver" onClose={() => setSchoolPhoneOpen(false)} className="journal-dialog">
      <p className="eyebrow">CELULAR ANTIGO · TELA TRINCADA</p><h2>{schoolPhoneUnlocked ? 'Mensagens' : 'Digite a senha'}</h2>
      {!schoolPhoneUnlocked ? <>
        <p className="note">Olhe o caderno na bolsa para descobrir a senha.</p>
        <label className="connection-field">Senha do celular<input autoComplete="off" inputMode="numeric" maxLength={8} value={schoolPassword} onChange={event => { setSchoolPassword(event.target.value.replace(/\D/g, '').slice(0, 8)); setSchoolPasswordError(''); }} placeholder="8 dígitos" aria-describedby={schoolPasswordError ? 'school-password-error' : undefined}/></label>
        <NumericKeypad label="senha do celular" value={schoolPassword} maxLength={8} onChange={value => { setSchoolPassword(value); setSchoolPasswordError(''); }}/>
        {schoolPasswordError && <p id="school-password-error" role="alert">{schoolPasswordError}</p>}
        <div className="actions"><button disabled={!phoneCluesReady || schoolPassword.length !== 8} onClick={unlockSchoolPhone}>Desbloquear</button><button className="secondary" onClick={() => setSchoolPhoneOpen(false)}>Voltar à exploração</button></div>
      </> : <><article className="journal-entry"><h3>Zoe</h3><p>“Você está melhor? Não esquece a marmita e o trabalho, tá?”</p></article><article className="journal-entry"><h3>Michael</h3><p>“Pega uma coisa no armário da Zoe antes de ir embora.”</p></article><div className="actions"><button onClick={() => setSchoolPhoneOpen(false)}>Fechar celular</button></div></>}
    </Modal>
    <Modal open={schoolChoiceOpen} title="A pergunta do pai" onClose={() => setSchoolChoiceOpen(false)} className="journal-dialog"><p className="eyebrow">FLASHBACK · REDAÇÃO ESCOLAR</p><h2>“Você quer mesmo ser médico como eu?”</h2><p>Escolha a resposta de Oliver. Ela muda apenas o tom desta lembrança.</p><div className="pause-actions"><button onClick={() => { setSchoolChoiceOpen(false); finishChoiceFlashback('school', 'quero-ser-medico'); }}>“Quero ser médico como você.”</button><button className="secondary" onClick={() => { setSchoolChoiceOpen(false); finishChoiceFlashback('school', 'nao-sei-ainda'); }}>“Eu ainda não sei.”</button></div></Modal>
    <Modal open={friendChoiceOpen} title="Uma conversa com Michael" onClose={() => setFriendChoiceOpen(false)} className="journal-dialog"><p className="eyebrow">FLASHBACK · LABORATÓRIO DA FACULDADE</p><h2>“Você passou mal na semana passada. O que aconteceu?”</h2><p>Oliver não consegue reconstruir aquele dia. Como responde ao amigo?</p><div className="pause-actions"><button onClick={() => { setFriendChoiceOpen(false); finishChoiceFlashback('friend', 'ignorar'); }}>Mudar de assunto</button><button className="secondary" onClick={() => { setFriendChoiceOpen(false); finishChoiceFlashback('friend', 'fingir-bem'); }}>“Estou bem, foi só cansaço.”</button></div></Modal>
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
    <Modal open={endingOpen && endingChoice === 'question'} title="Você quer lembrar?" onClose={() => setEndingOpen(false)} className="journal-dialog">
      <p className="eyebrow">ÚLTIMA ESCOLHA</p><h2>VOCÊ QUER LEMBRAR?</h2><div className="pause-actions"><button onClick={() => { state.recordChoice('ending', 'remember'); setEndingChoice('remember'); }}>Sim, quero lembrar</button><button className="secondary" onClick={() => { state.recordChoice('ending', 'release'); setEndingChoice('release'); }}>Não quero lembrar</button></div>
    </Modal>
    {endingOpen && endingChoice !== 'question' && <EndingSequence key={endingChoice} choice={endingChoice} onFinish={completeGame}/>}
    <MemorySequence open={memoryOpen} onFinish={finishMemory} onClose={() => setMemoryOpen(false)}/>
    {flashbackKind && <FlashbackSequence kind={flashbackKind} open={true} onFinish={finishFlashback} branch={state.progress.choices[sceneKey]}/>}
    
  </main>;
}




