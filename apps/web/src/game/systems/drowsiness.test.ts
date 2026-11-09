import { expect, it } from 'vitest';
import { breathe, freshDrowsiness, tickDrowsiness } from './drowsiness';
it('starts after sixty seconds of exploration', () => { expect(tickDrowsiness(freshDrowsiness(), 60).phase).toBe('breathing'); });
it('ends the attempt after twelve seconds without recovery', () => { expect(tickDrowsiness(tickDrowsiness(freshDrowsiness(), 60), 12).phase).toBe('lost'); });
it('recovers through repeated separate presses', () => { let state = tickDrowsiness(freshDrowsiness(), 60); for(let i=0;i<8;i++) state=breathe(state); expect(state.phase).toBe('breathing'); state=breathe(state); expect(state).toEqual(freshDrowsiness()); });
it('cannot recover a finished attempt by pressing E', () => { const state = tickDrowsiness(tickDrowsiness(freshDrowsiness(),60),12); expect(breathe(state)).toEqual(state); });
