export type Drowsiness = { phase: 'calm' | 'breathing' | 'lost'; time: number; breath: number };
export const freshDrowsiness = (): Drowsiness => ({ phase: 'calm', time: 60, breath: .3 });
export function tickDrowsiness(state: Drowsiness, seconds: number): Drowsiness {
  if (state.phase === 'lost') return state;
  const time = Math.max(0, state.time - seconds);
  if (state.phase === 'calm') return time === 0 ? { phase: 'breathing', time: 12, breath: .3 } : { ...state, time };
  return { ...state, time, breath: Math.max(0, state.breath - seconds * .065), phase: time === 0 ? 'lost' : 'breathing' };
}
export function breathe(state: Drowsiness): Drowsiness {
  if (state.phase !== 'breathing') return state;
  const breath = Math.min(1, state.breath + .08);
  return breath >= 1 ? freshDrowsiness() : { ...state, breath };
}
