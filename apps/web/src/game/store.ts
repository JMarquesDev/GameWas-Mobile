import { create } from 'zustand';
import { collectClue, collectPhaseClue, initialProgress, parseSave, recoverMemory, type Progress } from '@was/game-core';
import type { ObjectId } from '@was/game-content';
import { freshSession, loadSession, parseSession, type Session } from './session';
import type { Point } from './systems/navigation';
export type SaveSlot = { id: number; occupied: boolean; progress: number; phase: number; savedAt: number };
const slotCount = 3;
const progressKey = (slot: number) => `was:slot:${slot}:progress:v1`;
const sessionKey = (slot: number) => `was:slot:${slot}:session:v1`;
function readSlot(slot: number) { try { return { progress: parseSave(localStorage.getItem(progressKey(slot))), session: parseSession(localStorage.getItem(sessionKey(slot))) }; } catch { return { progress: initialProgress(), session: freshSession() }; } }
function writeSlot(slot: number, progress: Progress, session: Session) { try { localStorage.setItem(progressKey(slot), JSON.stringify(progress)); localStorage.setItem(sessionKey(slot), JSON.stringify(session)); return true; } catch { return false; } }
function summaries(): SaveSlot[] { return Array.from({ length: slotCount }, (_, id) => { const { progress, session } = readSlot(id); const occupied = session.savedAt > 0 || progress.clues.length > 0 || progress.unlockedPhase > 0; return { id, occupied, progress: occupied ? Math.round(progress.unlockedPhase / 6 * 100) : 0, phase: progress.unlockedPhase, savedAt: session.savedAt }; }); }
function migrateLegacy() {
  try {
    if (Array.from({ length: slotCount }, (_, id) => localStorage.getItem(progressKey(id)) || localStorage.getItem(sessionKey(id))).some(Boolean)) return;
    const progress = parseSave(localStorage.getItem('was:progress:v1')); const session = loadSession();
    if (session.savedAt > 0 || progress.clues.length > 0 || progress.unlockedPhase > 0) writeSlot(0, progress, session);
  } catch { /* O jogo continua utilizável sem armazenamento. */ }
}
migrateLegacy();
function load(slot: number) { return readSlot(slot); }
function save(slot: number, progress: Progress, session: Session) { return writeSlot(slot, progress, session); }
export const useGameStore = create<{
  progress: Progress; inspecting: ObjectId | null;
  session: Session; activeSlot: number; slots: SaveSlot[]; paused: boolean; touch: Point; unread: number; notice: string; saveFailed: boolean;
  setPaused: (paused: boolean) => void; setTouch: (touch: Point) => void;
  notify: (notice: string) => void; readJournal: () => void; advancePhase: (index: number) => void;
  checkpoint: (scene: string, position?: Point) => void; finishMemory: () => void;
  inspect: (id: ObjectId | null) => void; collect: (id: ObjectId) => void;
  collectPhaseClue: (scene: string, id: string) => void; recordChoice: (scene: string, choice: string) => void; recover: () => void; reset: () => void;
  selectSlot: (slot: number) => void; startSlot: (slot: number) => void;
  deleteSlot: (slot: number) => boolean;
}>((set) => ({
  progress: load(0).progress, inspecting: null, session: load(0).session, activeSlot: 0, slots: summaries(), paused: false, touch: { x: 0, y: 0 }, unread: 0, notice: '', saveFailed: false,
  setPaused: paused => set({ paused, touch: { x: 0, y: 0 } }), setTouch: touch => set({ touch }),
  deleteSlot: slot => {
    if (!Number.isInteger(slot) || slot < 0 || slot >= slotCount) return false;
    // Empty records prevent legacy saves from being imported again after deletion.
    const progress = initialProgress();
    const session = freshSession();
    if (!writeSlot(slot, progress, session)) { set({ saveFailed: true }); return false; }
    set(state => ({ slots: summaries(), saveFailed: false,
      ...(state.activeSlot === slot ? { progress, session, inspecting: null, unread: 0, notice: '', touch: { x: 0, y: 0 } } : {}),
    }));
    return true;
  },
  notify: notice => set({ notice }), readJournal: () => set({ unread: 0 }),
  checkpoint: (scene, position) => set(state => {
    const session = { ...state.session, scene, savedAt: Date.now(), positions: position ? { ...state.session.positions, [scene]: { ...position } } : state.session.positions };
    const persisted = save(state.activeSlot, state.progress, session);
    return { session, saveFailed: !persisted, slots: summaries() };
  }),
  advancePhase: index => set(state => { const progress = { ...state.progress, unlockedPhase: Math.max(state.progress.unlockedPhase, Math.min(6, index)) }; const persisted = save(state.activeSlot, progress, state.session); return { progress, saveFailed: !persisted, slots: summaries() }; }),
  finishMemory: () => set(state => {
    const session = { ...state.session, memoryWatched: true, savedAt: Date.now() };
    const progress = state.progress;
    const persisted = save(state.activeSlot, progress, session);
    return { session, progress, saveFailed: !persisted, slots: summaries() };
  }),
  inspect: inspecting => set({ inspecting }),
  collect: id => set(state => { const progress = collectClue(state.progress, id); const persisted = save(state.activeSlot, progress, state.session); return { progress, saveFailed: !persisted, slots: summaries(), unread: state.unread + Number(progress !== state.progress), notice: progress !== state.progress ? 'Nova pista registrada no diário.' : state.notice }; }),
  collectPhaseClue: (scene, id) => set(state => { const progress = collectPhaseClue(state.progress, scene, id); const persisted = save(state.activeSlot, progress, state.session); const changed = progress !== state.progress; return { progress, saveFailed: !persisted, slots: summaries(), unread: state.unread + Number(changed), notice: changed ? 'Fragmento de memória registrado.' : state.notice }; }),
  recordChoice: (scene, choice) => set(state => { const progress = { ...state.progress, choices: { ...state.progress.choices, [scene]: choice } }; return { progress, saveFailed: !save(state.activeSlot, progress, state.session), slots: summaries() }; }),
  recover: () => set(state => { const progress = recoverMemory(state.progress); const persisted = save(state.activeSlot, progress, state.session); return { progress, saveFailed: !persisted, slots: summaries() }; }),
  reset: () => set(state => { const progress = initialProgress(); const session = freshSession(); const persisted = save(state.activeSlot, progress, session); return { progress, session, inspecting: null, paused: false, touch: { x: 0, y: 0 }, unread: 0, notice: '', saveFailed: !persisted, slots: summaries() }; }),
  selectSlot: slot => set(() => { const selected = Math.max(0, Math.min(slotCount - 1, slot)); const data = load(selected); return { progress: data.progress, session: data.session, activeSlot: selected, inspecting: null, paused: false, touch: { x: 0, y: 0 }, unread: 0, notice: '', saveFailed: false, slots: summaries() }; }),
  startSlot: slot => set(() => { const selected = Math.max(0, Math.min(slotCount - 1, slot)); const progress = initialProgress(); const session = freshSession(); const persisted = save(selected, progress, session); return { progress, session, activeSlot: selected, inspecting: null, paused: false, touch: { x: 0, y: 0 }, unread: 0, notice: '', saveFailed: !persisted, slots: summaries() }; }),
}));
