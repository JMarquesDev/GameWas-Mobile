import { create } from 'zustand';
type Preferences = { speed: number; reducedMotion: boolean; largeText: boolean; volume: number; muted: boolean; musicVolume: number; showHints: boolean; quality: 'low' | 'high' };
const defaults: Preferences = { speed: 180, reducedMotion: false, largeText: false, volume: 0.35, muted: false, musicVolume: 0.7, showHints: true, quality: 'high' };
function load(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem('was:preferences:v1') ?? 'null');
    if (!value || typeof value !== 'object') return defaults;
    return { speed: [140, 180, 230].includes(value.speed) ? value.speed : defaults.speed,
      reducedMotion: value.reducedMotion === true, largeText: value.largeText === true,
      volume: typeof value.volume === 'number' && Number.isFinite(value.volume) ? Math.max(0, Math.min(1, value.volume)) : defaults.volume,
      muted: value.muted === true, musicVolume: typeof value.musicVolume === 'number' && Number.isFinite(value.musicVolume) ? Math.max(0, Math.min(1, value.musicVolume)) : 0.7,
      showHints: value.showHints !== false, quality: value.quality === 'low' ? 'low' : 'high' };
  } catch { return defaults; }
}
export const usePreferences = create<Preferences & { update: (value: Partial<Preferences>) => void }>((set) => ({
  ...load(),
  update: value => set(state => {
    const next = { speed: state.speed, reducedMotion: state.reducedMotion, largeText: state.largeText, volume: state.volume, muted: state.muted, musicVolume: state.musicVolume, showHints: state.showHints, quality: state.quality, ...value };
    try { localStorage.setItem('was:preferences:v1', JSON.stringify(next)); } catch { /* Preferências continuam ativas nesta sessão. */ }
    return next;
  }),
}));
