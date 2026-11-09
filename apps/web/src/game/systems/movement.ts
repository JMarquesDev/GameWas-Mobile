export function nextPosition(x: number, direction: number, delta: number, width: number, speed = 180) {
  return Math.max(40, Math.min(width - 40, x + direction * speed * Math.min(delta, 50) / 1000));
}
