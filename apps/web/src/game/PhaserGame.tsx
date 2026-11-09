import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { scenes } from './config';
import { backgroundScenes } from './scenes/BackgroundScenes';
import { usePreferences } from './preferences';
export function PhaserGame({ sceneKey = 'infancia' }: { sceneKey?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const registered = [...scenes, ...backgroundScenes];
    const ordered = [...registered.filter(Scene => new Scene().sys.settings.key === sceneKey), ...registered.filter(Scene => new Scene().sys.settings.key !== sceneKey)];
    const container = host.current!;
    const dimensions = () => {
      const density = usePreferences.getState().quality === 'high' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      return { width: Math.max(1, Math.round(container.clientWidth * density)), height: Math.max(1, Math.round(container.clientHeight * density)) };
    };
    const size = dimensions();
    const game = new Phaser.Game({ type: Phaser.AUTO, parent: host.current!, width: size.width, height: size.height,
      backgroundColor: '#101719', scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: ordered, audio: { noAudio: true } });
    game.events.once('was:scene-ready', () => setReady(true));
    const resize = () => {
      const next = dimensions();
      if (game.scale.width !== next.width || game.scale.height !== next.height) game.scale.setGameSize(next.width, next.height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const unsubscribe = usePreferences.subscribe((current, previous) => {
      if (current.quality !== previous.quality) resize();
    });
    return () => { observer.disconnect(); unsubscribe(); game.destroy(true); };
  }, [sceneKey]);
  return <div className="game-canvas" ref={host} aria-label="Cenário explorável. Use WASD ou as quatro setas para andar em profundidade. E para investigar.">{!ready && <div className="scene-loading" role="status">Preparando cenário…</div>}</div>;
}
