import { useEffect, useRef } from 'react';
import { usePreferences } from '../game/preferences';

const tracks: Record<string, string> = {
  menu: 'menu', infancia: 'infancia', 'infancia-corredor': 'infancia', 'infancia-sala': 'infancia',
  'cenario-02': 'faculdade',
  'cenario-03': 'apartamento', 'cenario-04': 'apartamento', 'cenario-05': 'apartamento',
  'cenario-06': 'laboratorio_pai', 'cenario-07': 'hospital', 'cenario-08': 'campo',
  flashbacks_final: 'flashbacks_final',
};

export function MusicPlayer({ scene, suspended }: { scene: string; suspended: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const { volume, musicVolume, muted } = usePreferences();
  const track = tracks[scene] ?? 'menu';
  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    audio.volume = volume * musicVolume;
    audio.muted = muted;
    const play = () => {
      if (suspended || document.hidden || muted || volume === 0 || musicVolume === 0) audio.pause();
      else void audio.play().catch(() => { /* Retry on the next user gesture. */ });
    };
    play();
    window.addEventListener('pointerdown', play);
    window.addEventListener('keydown', play);
    document.addEventListener('visibilitychange', play);
    return () => {
      audio.pause();
      window.removeEventListener('pointerdown', play);
      window.removeEventListener('keydown', play);
      document.removeEventListener('visibilitychange', play);
    };
  }, [track, volume, musicVolume, muted, suspended]);
  return <audio ref={ref} src={`/assets/audio/music/${track}.m4a`} loop preload="auto" />;
}
