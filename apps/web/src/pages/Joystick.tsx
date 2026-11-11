import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useGameStore } from '../game/store';
import { usePreferences } from '../game/preferences';

export function Joystick({ disabled }: { disabled: boolean }) {
  const pointer = useRef<number | null>(null);
  const mode = usePreferences(state => state.joystickMode);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const touch = useGameStore(state => state.touch);
  function reset() {
    pointer.current = null;
    useGameStore.getState().setTouch({ x: 0, y: 0 });
  }
  useEffect(() => { if (disabled) reset(); return reset; }, [disabled]);
  useEffect(() => {
    if (mode !== 'dynamic' || disabled) { reset(); return; }
    let start: { x: number; y: number } | null = null;
    const down = (event: globalThis.PointerEvent) => {
      if (pointer.current !== null || event.button !== 0 || !(event.target instanceof Element) || !event.target.closest('.game-canvas canvas')) return;
      pointer.current = event.pointerId;
      start = { x: event.clientX, y: event.clientY };
      setOrigin(start);
    };
    const moveDynamic = (event: globalThis.PointerEvent) => {
      if (pointer.current !== event.pointerId || !start) return;
      const x = event.clientX - start.x, y = event.clientY - start.y;
      const distance = Math.hypot(x, y), scale = Math.max(38, distance);
      useGameStore.getState().setTouch(distance < 7 ? { x: 0, y: 0 } : { x: x / scale, y: y / scale });
    };
    const up = (event: globalThis.PointerEvent) => { if (pointer.current === event.pointerId) { start = null; reset(); } };
    window.addEventListener('pointerdown', down); window.addEventListener('pointermove', moveDynamic);
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', moveDynamic); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); reset(); };
  }, [mode, disabled]);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (disabled || pointer.current !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(x, y);
    const scale = Math.max(rect.width * .32, distance);
    useGameStore.getState().setTouch(distance < rect.width * .07 ? { x: 0, y: 0 } : { x: x / scale, y: y / scale });
  }
  if (mode === 'dynamic' && !origin) return null;
  return <div className="walk-stick" role="group" aria-label="Joystick de movimento" aria-disabled={disabled} style={mode === 'dynamic' && origin ? { position: 'fixed', left: origin.x, top: origin.y, transform: 'translate(-50%, -50%)', pointerEvents: 'none' } : undefined}
    onPointerDown={event => {
      if (disabled || pointer.current !== null) return;
      pointer.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      move(event);
    }} onPointerMove={move} onLostPointerCapture={event => { if (pointer.current === event.pointerId) reset(); }}
    onPointerCancel={event => { if (pointer.current === event.pointerId) reset(); }}
    onPointerUp={event => { if (pointer.current === event.pointerId) reset(); }}>
    <span style={{ left: (50 + touch.x * 32) + '%', top: (50 + touch.y * 32) + '%' }}/>
  </div>;
}
