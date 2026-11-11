import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { scenes } from './config';
import { backgroundScenes } from './scenes/BackgroundScenes';
import { sceneSize } from './backgrounds';
export function PhaserGame({ sceneKey = 'infancia' }: { sceneKey?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const registered = [...scenes, ...backgroundScenes];
    const ordered = [...registered.filter(Scene => new Scene().sys.settings.key === sceneKey), ...registered.filter(Scene => new Scene().sys.settings.key !== sceneKey)];
    const size = sceneSize(sceneKey);
    const game = new Phaser.Game({ type: Phaser.AUTO, parent: host.current!, width: size.width, height: size.height,
      backgroundColor: '#101719', scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: ordered, audio: { noAudio: true } });
    game.events.once('was:scene-ready', () => setReady(true));
    return () => game.destroy(true);
  }, [sceneKey]);
  return <div className="game-canvas" ref={host} aria-label="Cenário explorável. Use WASD ou as quatro setas para andar em profundidade. E para investigar.">{!ready && <div className="scene-loading" role="status">Preparando cenário…</div>}</div>;
}
