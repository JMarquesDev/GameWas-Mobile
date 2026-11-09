import { childhoodObjects, phaseObjectives, type ObjectId } from '@was/game-content';
export type Progress = { version: 2; clues: ObjectId[]; memoryRecovered: boolean; unlockedPhase: number; phaseClues: Record<string, string[]>; choices: Record<string, string> };
export const initialProgress = (): Progress => ({ version: 2, clues: [], memoryRecovered: false, unlockedPhase: 0, phaseClues: {}, choices: {} });
export function collectClue(state: Progress, id: ObjectId): Progress {
  return state.clues.includes(id) ? state : { ...state, clues: [...state.clues, id] };
}
export function collectPhaseClue(state: Progress, scene: string, id: string): Progress {
  const objective = phaseObjectives.find(item => item.scene === scene);
  if (!objective?.clues.some(clue => clue.id === id)) return state;
  const found = state.phaseClues[scene] ?? [];
  if (found.includes(id)) return state;
  return { ...state, phaseClues: { ...state.phaseClues, [scene]: [...found, id] } };
}
export function canCompletePhase(state: Progress, scene: string): boolean {
  const objective = phaseObjectives.find(item => item.scene === scene);
  return !!objective && objective.clues.every(clue => (state.phaseClues[scene] ?? []).includes(clue.id));
}
export function canRecoverMemory(state: Progress): boolean {
  return childhoodObjects.every(object => state.clues.includes(object.id));
}
// Photograph identifies the person, dedication the bond, drawing the conversation.
export function canConnectMemory(state: Progress, evidence: readonly string[]): boolean {
  return canRecoverMemory(state) && evidence.length === 3 && evidence[0] === 'fotografia' && evidence[1] === 'relogio' && evidence[2] === 'desenho';
}
export function canExamine(id: ObjectId, frontVisibility: number): boolean {
  const object = childhoodObjects.find(item => item.id === id);
  return !!object && (object.side === 'back' ? frontVisibility < -0.55 : frontVisibility > 0.55);
}
export function canInteract(id: ObjectId, position: { x: number; y: number }): boolean {
  const object = childhoodObjects.find(item => item.id === id);
  return !!object && Math.hypot(position.x - object.approach.x, position.y - object.approach.y) < 105;
}
export function recoverMemory(state: Progress): Progress {
  return canRecoverMemory(state) ? { ...state, memoryRecovered: true } : state;
}
export function parseSave(raw: string | null): Progress {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object') return initialProgress();
    const data = value as Record<string, unknown>;
    if ((data.version !== 1 && data.version !== 2) || !Array.isArray(data.clues)) return initialProgress();
    const savedClues = data.clues;
    const clues = childhoodObjects.filter(object => savedClues.includes(object.id)).map(object => object.id);
    const phaseClues: Record<string, string[]> = {};
    if (data.phaseClues && typeof data.phaseClues === 'object') for (const objective of phaseObjectives) {
      const values = (data.phaseClues as Record<string, unknown>)[objective.scene];
      if (Array.isArray(values)) phaseClues[objective.scene] = objective.clues.filter(clue => values.includes(clue.id)).map(clue => clue.id);
    }
    const choices: Record<string, string> = {};
    if (data.choices && typeof data.choices === 'object') for (const [scene, choice] of Object.entries(data.choices as Record<string, unknown>)) if (typeof choice === 'string') choices[scene] = choice;
    const oldPhase = typeof data.unlockedPhase === 'number' ? Math.max(0, Math.floor(data.unlockedPhase)) : 0;
    const migratedPhase = data.version === 1 ? ([0, 1, 3, 3, 3, 4, 5, 6][Math.min(oldPhase, 7)] ?? 0) : oldPhase;
    const state: Progress = { version: 2, clues, memoryRecovered: false, unlockedPhase: Math.max(0, Math.min(6, migratedPhase)), phaseClues, choices };
    return { ...state, memoryRecovered: data.memoryRecovered === true && canRecoverMemory(state) };
  } catch { return initialProgress(); }
}
