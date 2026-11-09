import { expect, it } from 'vitest';
import { canConnectMemory, collectClue, initialProgress } from './index';
it('exige as pistas descobertas e suas relações para reconstruir a memória', () => {
  const evidence = ['fotografia', 'relogio', 'desenho'];
  expect(canConnectMemory(initialProgress(), evidence)).toBe(false);
  const complete = collectClue(collectClue(collectClue(initialProgress(), 'fotografia'), 'relogio'), 'desenho');
  expect(canConnectMemory(complete, evidence)).toBe(true);
  expect(canConnectMemory(complete, ['relogio', 'fotografia', 'desenho'])).toBe(false);
  expect(canConnectMemory(complete, ['fotografia', 'fotografia', 'desenho'])).toBe(false);
  expect(canConnectMemory(complete, [])).toBe(false);
});
