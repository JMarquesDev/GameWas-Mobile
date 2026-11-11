import { describe, expect, it } from 'vitest';
import { findWalkPath, floors, isWalkable, moveOnFloor, perspective } from './navigation';
import { sceneSize } from '../backgrounds';
import { childhoodObjects } from '@was/game-content';

describe('exploraÃ§Ã£o do piso', () => {
  it('permite investigar os trÃªs objetos a partir de posiÃ§Ãµes livres no chÃ£o', () => {
    for (const object of childhoodObjects) expect(isWalkable('infancia', object.approach), object.id).toBe(true);
  });
  it('inicia em chÃ£o livre em todos os ambientes', () => {
    for (const [key, floor] of Object.entries(floors)) expect(isWalkable(key, floor.spawn), key).toBe(true);
  });
  it('permite chegar ao fundo pelo corredor central do laboratÃ³rio', () => {
    const end = moveOnFloor('cenario-02', { x: 478, y: 518 }, 0, -185);
    expect(end.y).toBeLessThan(340);
    expect(isWalkable('cenario-02', end)).toBe(true);
  });
  it('permite andar pelo corredor até a frente do quadro', () => {
    expect(isWalkable('cenario-02', { x: 925, y: 440 })).toBe(true);
    expect(isWalkable('cenario-02', { x: 800, y: 440 })).toBe(false);
    const alongBottom = moveOnFloor('cenario-02', { x: 842, y: 523 }, 83, 0);
    const towardBoard = moveOnFloor('cenario-02', alongBottom, 0, -83);
    expect(towardBoard.x).toBeGreaterThan(910);
    expect(towardBoard.y).toBeLessThan(450);
  });
  it('mantém Oliver fora dos tampos e da mochila do laboratório', () => {
    for (const point of [{ x: 570, y: 330 }, { x: 580, y: 355 }, { x: 350, y: 340 }]) {
      expect(isWalkable('cenario-02', point), JSON.stringify(point)).toBe(false);
    }
    for (const point of [{ x: 478, y: 340 }, { x: 570, y: 522 }, { x: 842, y: 523 }]) {
      expect(isWalkable('cenario-02', point), JSON.stringify(point)).toBe(true);
    }
    const end = moveOnFloor('cenario-02', { x: 478, y: 518 }, 130, -195);
    expect(isWalkable('cenario-02', end)).toBe(true);
    expect(end.x).toBeLessThan(505);
  });
  it('bloqueia livros, mochila e paredes sem atravessar em passos longos', () => {
    expect(isWalkable('infancia', { x: 400, y: 440 })).toBe(false);
    expect(isWalkable('infancia', { x: 400, y: 440 })).toBe(false);
    const end = moveOnFloor('infancia', { x: 400, y: 523 }, 0, -180);
    expect(end.y).toBeGreaterThanOrEqual(469);
    expect(end.y).toBeGreaterThanOrEqual(490);
    expect(end.y).toBeLessThan(510);
    expect(isWalkable('infancia', end)).toBe(true);
    expect(moveOnFloor('cenario-08', { x: 100, y: 400 }, -500, -500).x).toBeGreaterThan(20);
  });
  it('desliza pela borda dos obstÃ¡culos e reduz a escala ao fundo', () => {
    const end = moveOnFloor('infancia', { x: 400, y: 523 }, 40, -80);
    expect(end.x).toBeGreaterThan(425);
    expect(isWalkable('infancia', end)).toBe(true);
    expect(perspective('infancia', 360)).toBeLessThan(perspective('infancia', 520));
    expect(perspective('infancia', 350) / perspective('infancia', 530)).toBeGreaterThanOrEqual(0.94);
  });
  it('usa a proporÃ§Ã£o original de cada cenÃ¡rio no canvas', () => {
    const size = sceneSize('cenario-04');
    expect(size.width / size.height).toBeCloseTo(1939 / 811);
    expect(sceneSize('infancia').width / sceneSize('infancia').height).toBeCloseTo(1600 / 728);
  });
  it('bloqueia a parede lateral da porta e mantÃ©m os sapatos no piso', () => {
    expect(isWalkable('infancia', { x: 910, y: 485 })).toBe(false);
    expect(isWalkable('infancia', { x: 900, y: 490 })).toBe(false);
    expect(isWalkable('infancia', { x: 875, y: 515 })).toBe(true);
    const start = { x: 855, y: 515 };
    expect(isWalkable('infancia', start)).toBe(true);
    const end = moveOnFloor('infancia', start, 300, -150);
    expect(isWalkable('infancia', end)).toBe(true);
    expect(end.x).toBeLessThan(915);
  });
});

// Reachability checks use the same footprint and collision stepping as gameplay.
function canReach(key: string, destination: { x: number; y: number }) {
  const step = 4;
  const spawn = floors[key].spawn;
  const queue = [{ ...spawn }]; const seen = new Set([`${spawn.x},${spawn.y}`]);
  for (let head = 0; head < queue.length; head++) {
    const point = queue[head];
    if (Math.hypot(point.x - destination.x, point.y - destination.y) <= 7) return true;
    for (const [dx, dy] of [[step,0],[-step,0],[0,step],[0,-step]]) {
      const candidate = { x: point.x + dx, y: point.y + dy };
      const id = `${candidate.x},${candidate.y}`;
      if (seen.has(id)) continue;
      seen.add(id);
      if (!isWalkable(key, candidate)) continue;
      const moved = moveOnFloor(key, point, dx, dy);
      if (Math.hypot(moved.x - candidate.x, moved.y - candidate.y) < .01) queue.push(candidate);
    }
  }
  return false;
}

describe('novas ilustraÃ§Ãµes â€” chÃ£o e passagens', () => {
  it('preserva a proporÃ§Ã£o dos trÃªs arquivos enviados', () => {
    expect(sceneSize('infancia').width / sceneSize('infancia').height).toBeCloseTo(1600 / 728);
    expect(sceneSize('cenario-05').width / sceneSize('cenario-05').height).toBeCloseTo(1600 / 669);
    expect(sceneSize('cenario-06').width / sceneSize('cenario-06').height).toBeCloseTo(1600 / 827);
  });
  it('mantém o acesso ao desenho no piso e bloqueia a mesa e a mochila', () => {
    expect(isWalkable('infancia', { x: 280, y: 500 })).toBe(true);
    expect(isWalkable('infancia', { x: 420, y: 440 })).toBe(false);
    expect(isWalkable('infancia', { x: 440, y: 455 })).toBe(false);
  });
  it('permite os tapetes e o corredor da cozinha; bloqueia ilha e colunas', () => {
    for (const point of [{ x: 300, y: 450 }, { x: 810, y: 360 }, { x: 810, y: 425 }]) expect(isWalkable('cenario-05', point), JSON.stringify(point)).toBe(true);
    for (const point of [{ x: 600, y: 450 }, { x: 760, y: 398 }, { x: 900, y: 380 }, { x: 140, y: 400 }]) expect(isWalkable('cenario-05', point), JSON.stringify(point)).toBe(false);
  });
  it('libera o piso do laboratÃ³rio e bloqueia bancada, cadeira e lixeira', () => {
    for (const point of [{ x: 300, y: 430 }, { x: 850, y: 440 }, { x: 550, y: 470 }]) expect(isWalkable('cenario-06', point), JSON.stringify(point)).toBe(true);
    for (const point of [{ x: 550, y: 415 }, { x: 220, y: 400 }, { x: 780, y: 380 }, { x: 850, y: 340 }]) expect(isWalkable('cenario-06', point), JSON.stringify(point)).toBe(false);
  });
  it('mantÃ©m rotas contÃ­nuas atÃ© as trÃªs pistas e os dois lados da cozinha/laboratÃ³rio', () => {
    for (const object of childhoodObjects) expect(canReach('infancia', object.approach), object.id).toBe(true);
    expect(canReach('cenario-05', { x: 300, y: 450 }), 'tapete da cozinha').toBe(true);
    expect(canReach('cenario-05', { x: 810, y: 360 }), 'corredor da cozinha').toBe(true);
    expect(canReach('cenario-06', { x: 300, y: 430 }), 'cadeira do laboratÃ³rio').toBe(true);
    expect(canReach('cenario-06', { x: 850, y: 440 }), 'porta do laboratÃ³rio').toBe(true);
  }, 15000);
});


describe('caminhada por clique no quarto', () => {
  it('contorna os obstáculos até todas as pistas sem atravessar colisões', () => {
    for (const object of childhoodObjects) {
      const path = findWalkPath('infancia', floors.infancia.spawn, object.approach);
      expect(path.length, object.id).toBeGreaterThan(0);
      let previous = floors.infancia.spawn;
      for (const point of path) {
        expect(isWalkable('infancia', point)).toBe(true);
        const reached = moveOnFloor('infancia', previous, point.x-previous.x, point.y-previous.y);
        expect(reached.x).toBeCloseTo(point.x);
        expect(reached.y).toBeCloseTo(point.y);
        previous = point;
      }
      expect(previous).toEqual(object.approach);
    }
  });
  it('recusa destinos na parede e na mochila', () => {
    expect(findWalkPath('infancia', floors.infancia.spawn, { x: 400, y: 200 })).toEqual([]);
    expect(findWalkPath('infancia', floors.infancia.spawn, { x: 400, y: 440 })).toEqual([]);
  });
});
