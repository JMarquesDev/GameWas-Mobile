export type Point = { x: number; y: number };
type Polygon = readonly (readonly [number, number])[];
type Obstacle = { polygon: Polygon; depth: number };
type Floor = { polygon: Polygon; obstacles: Obstacle[]; spawn: Point; farY: number };
const box = (left: number, top: number, right: number, bottom: number, depth = bottom): Obstacle => ({
  polygon: [[left, top], [right, top], [right, bottom], [left, bottom]], depth,
});

// Coordenadas de referência 960×540, independentes do formato do canvas.
export const floors: Record<string, Floor> = {
  infancia: {
    polygon: [[0,516],[213,348],[745,348],[960,530],[960,540],[0,540]],
    obstacles: [
      { polygon: [[126,435],[127,388],[209,348],[312,348],[312,372],[274,454],[126,454]], depth: 454 },
      box(320,348,380,367), box(462,348,702,366),
      { polygon: [[299,396],[333,381],[440,382],[482,401],[501,440],[484,477],[440,492],[342,490],[306,470]], depth: 492 },
      { polygon: [[610,350],[624,345],[651,345],[670,352],[678,367],[673,383],[658,391],[632,388],[617,377]], depth: 391 },
      box(721,350,776,382), box(696,359,726,396)],
    spawn: { x:170,y:490 }, farY:350,
  },
  'infancia-corredor': {
    polygon: [[0,440],[2880,440],[2880,536],[0,536]],
    obstacles: [],
    spawn: { x: 85, y: 455 }, farY: 383,
  },
  'infancia-sala': {
    polygon: [[0, 323], [210, 305], [960, 305], [960, 536], [0, 536]],
    obstacles: [box(90, 296, 275, 336), box(685, 296, 881, 336)],
    spawn: { x: 480, y: 490 }, farY: 305,
  },
  'cenario-02': {
    polygon: [[18, 365], [125, 332], [420, 318], [565, 318], [825, 350], [940, 390], [940, 540], [18, 540]],
    obstacles: [box(55, 345, 451, 515), box(505, 345, 905, 515), box(123, 290, 395, 347), box(600, 290, 823, 347)],
    spawn: { x: 478, y: 518 }, farY: 310,
  },
  'faculdade-laboratorio': {
    polygon: [[0, 470], [210, 400], [330, 400], [790, 400], [960, 470], [960, 532], [0, 532]],
    obstacles: [box(350, 365, 755, 460), box(115, 380, 250, 480)],
    spawn: { x: 300, y: 500 }, farY: 390,
  },
  'cenario-03': {
    polygon: [[55, 520], [348, 336], [640, 336], [760, 470], [923, 525], [923, 532], [55, 532]],
    obstacles: [box(155, 338, 448, 486), box(400, 392, 567, 490), box(570, 329, 722, 448), box(75, 380, 195, 521), box(485, 306, 635, 378)],
    spawn: { x: 730, y: 510 }, farY: 330,
  },
  'cenario-04': {
    polygon: [[20, 440], [70, 397], [895, 397], [940, 475], [940, 532], [20, 532]],
    obstacles: [box(190, 398, 285, 453), box(632, 398, 795, 442)],
    spawn: { x: 120, y: 490 }, farY: 397,
  },
  'cenario-05': {
    polygon: [[0, 501], [88, 448], [106, 460], [171, 460], [267, 393], [744, 393], [773, 408], [773, 340], [835, 340], [882, 370], [882, 405], [910, 405], [960, 455], [960, 540], [0, 540]],
    obstacles: [box(417, 323, 746, 497), box(474, 477, 556, 503), box(600, 477, 677, 503), box(742, 330, 774, 409), box(944, 442, 960, 500)],
    spawn: { x: 820, y: 475 }, farY: 340,
  },
  'cenario-06': {
    polygon: [[12, 500], [182, 376], [414, 376], [754, 350], [776, 350], [950, 449], [950, 534], [12, 534]],
    obstacles: [
      { polygon: [[178, 380], [244, 380], [262, 405], [250, 414], [180, 414], [172, 405]], depth: 414 },
      { polygon: [[395, 365], [707, 365], [743, 441], [364, 441]], depth: 441 },
      { polygon: [[757, 358], [806, 358], [804, 392], [763, 394]], depth: 394 },
      box(806, 379, 831, 398)],
    spawn: { x: 850, y: 500 }, farY: 350,
  },
  'cenario-07': {
    polygon: [[20, 480], [95, 378], [665, 375], [935, 493], [935, 532], [20, 532]],
    obstacles: [box(95, 342, 315, 446), box(340, 342, 577, 449), box(305, 300, 338, 472), box(577, 350, 615, 425), box(35, 490, 316, 540), box(675, 510, 960, 540)],
    spawn: { x: 640, y: 480 }, farY: 365,
  },
  'cenario-08': { polygon: [[20, 330], [940, 330], [940, 532], [20, 532]], obstacles: [], spawn: { x: 170, y: 490 }, farY: 330 },
};

export function inPolygon(point: Point, polygon: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]; const [xj, yj] = polygon[j];
    if ((yi > point.y) !== (yj > point.y) && point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function isWalkable(key: string, point: Point): boolean {
  const floor = floors[key] ?? floors.infancia;
  // Inclui largura dos sapatos e quinas, não apenas o ponto central do corpo.
  return [[0, 0], [-22, 0], [22, 0], [0, -6], [0, 6], [-16, -5], [16, -5], [-16, 5], [16, 5]].every(([dx, dy]) => {
    const sample = { x: point.x + dx, y: point.y + dy };
    return inPolygon(sample, floor.polygon) && !floor.obstacles.some(obstacle => inPolygon(sample, obstacle.polygon));
  });
}
export function moveOnFloor(key: string, position: Point, dx: number, dy: number): Point {
  let next = { ...position };
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 3));
  for (let i = 0; i < steps; i++) {
    const full = { x: next.x + dx / steps, y: next.y + dy / steps };
    if (isWalkable(key, full)) next = full;
    else {
      const horizontal = { x: next.x + dx / steps, y: next.y };
      if (isWalkable(key, horizontal)) next = horizontal;
      const vertical = { x: next.x, y: next.y + dy / steps };
      if (isWalkable(key, vertical)) next = vertical;
    }
  }
  return next;
}
export function perspective(key: string, y: number): number {
  const far = (floors[key] ?? floors.infancia).farY;
  if (key === 'infancia-sala') return 0.90 + 0.10 * Math.max(0, Math.min(1, (y - 300) / 230));
  return 0.94 + 0.06 * Math.max(0, Math.min(1, (y - far) / (530 - far)));
}

// Search only valid foot positions; every edge uses the same collision sweep as movement.
export function findWalkPath(key: string, start: Point, destination: Point): Point[] {
  if (!isWalkable(key, destination)) return [];
  const step = 8;
  const nodes = [{ point: start, parent: -1 }];
  const seen = new Set(['0,0']);
  for (let head = 0; head < nodes.length && head < 12000; head++) {
    const point = nodes[head].point;
    if (Math.hypot(point.x - destination.x, point.y - destination.y) <= step * 1.5) {
      const end = moveOnFloor(key, point, destination.x - point.x, destination.y - point.y);
      if (Math.hypot(end.x - destination.x, end.y - destination.y) < .1) {
        const path: Point[] = [destination];
        for (let i = head; i > 0; i = nodes[i].parent) path.unshift(nodes[i].point);
        return path;
      }
    }
    for (const [dx, dy] of [[step,0],[-step,0],[0,step],[0,-step],[step,step],[-step,step],[step,-step],[-step,-step]]) {
      const next = { x: point.x + dx, y: point.y + dy };
      const id = `${Math.round((next.x-start.x)/step)},${Math.round((next.y-start.y)/step)}`;
      if (seen.has(id)) continue;
      const end = moveOnFloor(key, point, dx, dy);
      if (Math.hypot(end.x-next.x, end.y-next.y) > .1) continue;
      seen.add(id); nodes.push({ point: next, parent: head });
    }
  }
  return [];
}
