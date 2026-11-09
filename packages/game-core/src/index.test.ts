import { describe, expect, it } from 'vitest';
import { canExamine, canInteract, collectClue, initialProgress, parseSave, recoverMemory } from './index';
describe('progressão da primeira memória', () => {
  it('não conclui antes das três pistas e não duplica pistas', () => {
    const state = collectClue(initialProgress(), 'relogio');
    expect(collectClue(state, 'relogio').clues).toHaveLength(1);
    expect(recoverMemory(state).memoryRecovered).toBe(false);
    expect(recoverMemory(collectClue(collectClue(state, 'fotografia'), 'desenho')).memoryRecovered).toBe(true);
  });
  it('recupera saves inválidos e rejeita conclusão sem pistas', () => {
    expect(parseSave('{')).toEqual(initialProgress());
    expect(parseSave('{"version":1,"clues":["inexistente"],"memoryRecovered":true}')).toEqual(initialProgress());
  });
  it('exige o verso do relógio/foto e a frente do desenho', () => {
    expect(canExamine('relogio', 1)).toBe(false);
    expect(canExamine('fotografia', 0)).toBe(false);
    expect(canExamine('relogio', -1)).toBe(true);
    expect(canExamine('fotografia', -0.8)).toBe(true);
    expect(canExamine('desenho', 1)).toBe(true);
    expect(canExamine('desenho', -1)).toBe(false);
  });
  it('exige proximidade para investigar', () => {
    expect(canInteract('relogio', { x: 170, y: 490 })).toBe(false);
    expect(canInteract('relogio', { x: 400, y: 515 })).toBe(true);
    expect(canInteract('fotografia', { x: 635, y: 389 })).toBe(true);
  });
});
