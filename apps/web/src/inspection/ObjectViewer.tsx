import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { ObjectId } from '@was/game-content';
import { canExamine } from '@was/game-core';
import { ObjectModel } from './ObjectModels';
import { ACESFilmicToneMapping, PCFSoftShadowMap } from 'three';
import { usePreferences } from '../game/preferences';
const closestZoom = 1.9;
const farthestZoom = 6;
const clampZoom = (value: number) => Math.max(closestZoom, Math.min(farthestZoom, value));

function CameraDistance({ zoom }: { zoom: number }) {
  const { camera, invalidate } = useThree();
  useEffect(() => { camera.position.set(0, 0, zoom); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); invalidate(); }, [camera, invalidate, zoom]);
  return null;
}
class ViewerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p>O modo 3D não está disponível neste aparelho. Use os botões de orientação para examinar.</p> : this.props.children; }
}
export default function ObjectViewer({ id, onReady }: { id: ObjectId | 'trabalho-infantil'; onReady: (ready: boolean) => void }) {
  const quality = usePreferences(state => state.quality);
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState(3.65);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const surface = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = surface.current;
    const wheel = (event: WheelEvent) => { event.preventDefault(); setZoom(value => clampZoom(value + event.deltaY * .003)); };
    element?.addEventListener('wheel', wheel, { passive: false });
    return () => element?.removeEventListener('wheel', wheel);
  }, []);
  const ready = id === 'trabalho-infantil' ? Math.cos(rotation[0]) * Math.cos(rotation[1]) > .45 : canExamine(id, Math.cos(rotation[0]) * Math.cos(rotation[1]));
  useEffect(() => onReady(ready), [ready, onReady]);
  return <>
    <div ref={surface} className="inspection-viewer" tabIndex={0} role="group" aria-label="Objeto 3D: arraste para girar" onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      if (event.key === '+' || event.key === '-') setZoom(value => clampZoom(value + (event.key === '+' ? -.2 : .2)));
      else setRotation(([x, y]) => [x + (event.key === 'ArrowUp' ? -.2 : event.key === 'ArrowDown' ? .2 : 0), y + (event.key === 'ArrowLeft' ? -.2 : event.key === 'ArrowRight' ? .2 : 0)]);
    }} onPointerDown={event => { event.currentTarget.focus(); drag.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={event => { if (!drag.current) return; const dx = event.clientX - drag.current.x; const dy = event.clientY - drag.current.y; drag.current = { x: event.clientX, y: event.clientY }; setRotation(([x, y]) => [x + dy * 0.012, y + dx * 0.012]); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
      <ViewerBoundary><Canvas frameloop="demand" dpr={quality === 'high' ? [1, 2] : [1, 1]} shadows={quality === 'high' ? { type: PCFSoftShadowMap } : false} camera={{ position: [0, 0, 3.65], fov: 46 }} gl={{ antialias: quality === 'high', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.12 }}>
        <color attach="background" args={['#252d2a']} />
        <ambientLight intensity={1.15}/><hemisphereLight args={['#e4d8bd', '#17211f', 1.25]}/><directionalLight castShadow={quality === 'high'} position={[3, 4, 5]} intensity={2.8} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0002}/><directionalLight position={[-4, 2, -4]} intensity={1.6} color="#b9c9c2"/><pointLight position={[0, -1, 2]} intensity={.45} color="#d5b67a"/>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.28, 0]} receiveShadow><planeGeometry args={[8, 8]}/><shadowMaterial opacity={.28}/></mesh>
        <group rotation={[rotation[0], rotation[1], 0]}><ObjectModel id={id}/></group><CameraDistance zoom={zoom}/>
      </Canvas></ViewerBoundary>
    </div>
    <p className="inspection-help">Arraste o dedo para girar. Use os botões de zoom para aproximar ou afastar.</p>
    <details className="viewer-assistance"><summary>Controles</summary><div className="rotation-controls" aria-label="Orientação do objeto">
      <button className="secondary" aria-label="Girar para esquerda" onClick={() => setRotation(([x, y]) => [x, y - Math.PI / 4])}>↶</button>
      <button className="secondary" aria-label="Girar para direita" onClick={() => setRotation(([x, y]) => [x, y + Math.PI / 4])}>↷</button>
      <button className="secondary" aria-label="Inclinar objeto" onClick={() => setRotation(([x, y]) => [x + Math.PI / 4, y])}>Inclinar</button>
      <button className="secondary" onClick={() => setRotation([0, Math.PI])}>Ver verso</button>
      <button className="secondary" onClick={() => { setRotation([0, 0]); setZoom(3.65); }}>Restaurar</button>
    </div><p className="inspection-help">Setas giram; + e − aproximam.</p></details>
    <label>Zoom <input type="range" min={closestZoom} max={farthestZoom} step="0.05" value={closestZoom + farthestZoom - zoom} onChange={event => setZoom(clampZoom(closestZoom + farthestZoom - Number(event.target.value)))}/></label>
    <p className={ready ? 'clue-ready' : 'inspection-help'} role="status">{ready ? 'Detalhe à vista.' : 'Gire para encontrar o detalhe.'}</p>
  </>;
}

