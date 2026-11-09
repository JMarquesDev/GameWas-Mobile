import { useEffect, useRef, useState } from 'react';
import { usePreferences } from '../game/preferences';

export function IntroVideo({ onFinish }: { onFinish: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const { volume, muted } = usePreferences();
  const [needsGesture, setNeedsGesture] = useState(false);
  const [failed, setFailed] = useState(false);
  const play = () => {
    const element = video.current;
    if (!element) return;
    element.volume = volume;
    element.muted = muted;
    void element.play().then(() => setNeedsGesture(false)).catch(() => setNeedsGesture(true));
  };
  useEffect(() => { play(); }, [volume, muted]);
  return <section className="game-intro" aria-label="Introdução da história">
    <video ref={video} playsInline controls={false} disablePictureInPicture disableRemotePlayback
      tabIndex={-1} preload="auto" src="/assets/video/was-introducao.mp4"
      onContextMenu={event => event.preventDefault()} onEnded={onFinish} onError={() => setFailed(true)} />
    {failed ? <p role="alert">Não foi possível reproduzir o vídeo. Você pode seguir para a história.</p>
      : needsGesture && <button className="intro-play" onClick={play}>Iniciar vídeo</button>}
    <button onClick={onFinish}>Pular vídeo</button>
  </section>;
}
