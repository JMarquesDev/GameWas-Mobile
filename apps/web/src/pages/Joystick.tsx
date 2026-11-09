import { useEffect, useRef, type PointerEvent } from 'react';
import { useGameStore } from '../game/store';

export function Joystick({ disabled }: { disabled: boolean }) {
  const pointer = useRef<number | null>(null);
  const touch = useGameStore(state => state.touch);
  function reset() {
    pointer.current = null;
    useGameStore.getState().setTouch({ x: 0, y: 0 });
  }
  useEffect(() => { if (disabled) reset(); return reset; }, [disabled]);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (disabled || pointer.current !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(x, y);
    const scale = Math.max(rect.width * .32, distance);
    useGameStore.getState().setTouch(distance < rect.width * .07 ? { x: 0, y: 0 } : { x: x / scale, y: y / scale });
  }
  return <div className="walk-stick" role="group" aria-label="Joystick de movimento" aria-disabled={disabled}
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
