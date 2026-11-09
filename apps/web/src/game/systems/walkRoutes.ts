type Point = readonly [number, number];

// Faixa livre no piso em coordenadas do canvas 960×540.
// Os desvios passam pela frente das peças pintadas no fundo, sem pisar nelas.
const routes: Record<string, readonly Point[]> = {
  infancia: [[40, 490], [225, 490], [300, 530], [680, 530], [750, 500], [920, 500]],
  'cenario-02': [[40, 525], [920, 525]],
  'cenario-03': [[40, 510], [260, 510], [340, 530], [750, 530], [850, 510], [920, 510]],
  'cenario-04': [[40, 510], [170, 510], [230, 520], [340, 520], [410, 500], [920, 500]],
  'cenario-05': [[40, 510], [350, 510], [420, 530], [800, 530], [875, 510], [920, 510]],
  'cenario-06': [[40, 515], [280, 515], [350, 530], [820, 530], [920, 515]],
  'cenario-07': [[40, 525], [920, 525]],
  'cenario-08': [[40, 500], [920, 500]],
};

export function floorY(sceneKey: string, x: number): number {
  const route = routes[sceneKey] ?? routes.infancia;
  if (x <= route[0][0]) return route[0][1];
  for (let i = 1; i < route.length; i++) {
    const [rightX, rightY] = route[i];
    const [leftX, leftY] = route[i - 1];
    if (x <= rightX) return leftY + (rightY - leftY) * (x - leftX) / (rightX - leftX);
  }
  return route[route.length - 1][1];
}
