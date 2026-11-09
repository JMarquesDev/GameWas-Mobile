import { expect, it } from 'vitest';
import { floorY } from './walkRoutes';

it('contorna mesa baixa e mochila pela faixa livre à frente, nos dois sentidos', () => {
  // Limites inferiores aproximados das peças no fundo do quarto (canvas 960×540).
  const obstacles = [{ left: 300, right: 490, bottom: 490 }, { left: 520, right: 665, bottom: 515 }];
  for (const obstacle of obstacles) {
    for (let x = obstacle.left; x <= obstacle.right; x++) {
      expect(floorY('infancia', x)).toBeGreaterThan(obstacle.bottom + 10);
    }
  }
  for (let x = 40; x < 920; x++) {
    expect(Math.abs(floorY('infancia', x + 1) - floorY('infancia', x))).toBeLessThan(1);
    expect(floorY('infancia', x)).toBeLessThanOrEqual(530);
  }
});
