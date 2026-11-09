export type Facing = 'front' | 'back' | 'left' | 'right';
export function facingForMovement(x: number, y: number, previous: Facing): Facing {
  if (Math.hypot(x, y) < 0.01) return previous;
  const horizontal = Math.abs(x); const vertical = Math.abs(y);
  if (horizontal > 0 && vertical > 0 && Math.abs(horizontal - vertical) < Math.max(horizontal, vertical) * .2) {
    if (previous === 'left' || previous === 'right') return x < 0 ? 'left' : 'right';
    return y < 0 ? 'back' : 'front';
  }
  if (Math.abs(y) > Math.abs(x)) return y < 0 ? 'back' : 'front';
  return x < 0 ? 'left' : 'right';
}
export function breathScale(elapsed: number, enabled: boolean) {
  const wave = enabled ? Math.sin(elapsed * Math.PI * 2 / 3200) : 0;
  return { x: 1 + wave * 0.003, y: 1 + wave * 0.007 };
}
