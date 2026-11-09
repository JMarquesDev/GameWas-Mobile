import { expect, it } from 'vitest';
import { breathScale, facingForMovement } from './oliverMotion';
it('orienta pelas direções reais e mantém a última quando para', () => {
  expect(facingForMovement(0, -1, 'right')).toBe('back');
  expect(facingForMovement(0, 1, 'back')).toBe('front');
  expect(facingForMovement(-1, 0, 'front')).toBe('left');
  expect(facingForMovement(1, 0, 'left')).toBe('right');
  expect(facingForMovement(0, 0, 'back')).toBe('back');
});
it('respiração é periódica, sutil e respeita redução de movimento', () => {
  expect(breathScale(800, true).y).toBeCloseTo(1.007);
  expect(breathScale(4000, true)).toEqual(breathScale(800, true));
  expect(breathScale(800, false)).toEqual({ x: 1, y: 1 });
});

it('evita alternar a orientação com pequenas variações nas diagonais', () => {
  expect(facingForMovement(1, .95, 'right')).toBe('right');
  expect(facingForMovement(.95, 1, 'right')).toBe('right');
  expect(facingForMovement(.95, -1, 'back')).toBe('back');
  expect(facingForMovement(.2, -1, 'right')).toBe('back');
});
