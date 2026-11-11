import { backgrounds } from './backgrounds';
import { isWalkable, type Point } from './systems/navigation';

export type Session = { version: 1; scene: string; positions: Record<string, Point>; savedAt: number; memoryWatched: boolean };
export const freshSession = (): Session => ({ version: 1, scene: 'infancia', positions: {}, savedAt: 0, memoryWatched: false });
export function parseSession(raw: string | null): Session {
  try {
    const data = JSON.parse(raw ?? 'null');
    if (!data || data.version !== 1) return freshSession();
    const scene = data.scene === 'faculdade-laboratorio' ? 'cenario-02' : backgrounds.some(item => item.key === data.scene) ? data.scene : 'infancia';
    const positions: Record<string, Point> = {};
    for (const item of backgrounds) {
      const point = data.positions?.[item.key];
      if (point && Number.isFinite(point.x) && Number.isFinite(point.y) && isWalkable(item.key, point)) positions[item.key] = { x: point.x, y: point.y };
    }
    return { version: 1, scene, positions, savedAt: Number.isFinite(data.savedAt) ? data.savedAt : 0, memoryWatched: data.memoryWatched === true };
  } catch { return freshSession(); }
}
export function loadSession(): Session { try { return parseSession(localStorage.getItem('was:session:v1')); } catch { return freshSession(); } }
export function saveSession(session: Session): boolean {
  try { localStorage.setItem('was:session:v1', JSON.stringify(session)); return true; } catch { return false; }
}
