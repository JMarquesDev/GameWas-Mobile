import { describe, expect, it } from 'vitest';
import { freshSession, parseSession } from './session';
describe('continuidade da exploração', () => {
  it('recupera dados corrompidos sem quebrar o jogo', () => {
    expect(parseSession('{')).toEqual(freshSession());
    expect(parseSession('{"version":99}')).toEqual(freshSession());
  });
  it('restaura posições válidas e rejeita paredes, móveis e cenários desconhecidos', () => {
    const session = parseSession(JSON.stringify({ version: 1, scene: 'cenario-02', savedAt: 123,
      positions: { infancia: { x: 170, y: 490 }, 'cenario-02': { x: 478, y: 400 }, 'cenario-03': { x: -200, y: 0 }, missing: { x: 2, y: 3 } }, memoryWatched: true }));
    expect(session.scene).toBe('cenario-02');
    expect(session.positions.infancia).toEqual({ x: 170, y: 490 });
    expect(session.positions['cenario-02']).toEqual({ x: 478, y: 400 });
    expect(session.positions['cenario-03']).toBeUndefined();
    expect(session.positions.missing).toBeUndefined();
    expect(session.memoryWatched).toBe(true);
  });
});
