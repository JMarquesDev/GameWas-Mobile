import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, CanvasTexture, SRGBColorSpace } from 'three';

type Prototype = 'door' | 'chair' | 'essay';
const choices: { id: Prototype; phase: string; title: string; note: string }[] = [
  { id: 'door', phase: 'CORREDOR DA ESCOLA', title: 'Porta da sala', note: 'Madeira sólida, sem vidro ou vista para o céu. A maçaneta e o batente dão escala para a passagem.' },
  { id: 'chair', phase: 'SALA DE AULA · INFÂNCIA', title: 'Cadeira rabiscada', note: 'Cadeira azul de estrutura tubular, com “O + Z” gravado no encosto como pista examinável.' },
  { id: 'essay', phase: 'SALA DE AULA · INFÂNCIA', title: 'Redação infantil', note: 'Folha antiga em papel creme, com pergunta escolar e escrita infantil sobre querer ser médico como o pai.' },
];

function DoodleTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
    const c = canvas.getContext('2d')!;
    c.fillStyle = '#31506a'; c.fillRect(0, 0, 512, 512);
    c.fillStyle = '#3d607b'; c.fillRect(24, 24, 464, 464);
    c.strokeStyle = '#18232a'; c.lineWidth = 12; c.strokeRect(18, 18, 476, 476);
    c.fillStyle = '#c7aa78'; c.font = 'italic 76px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('O + Z', 256, 265);
    c.strokeStyle = '#dbc69a'; c.lineWidth = 5; c.beginPath(); c.moveTo(143, 313); c.lineTo(362, 304); c.stroke();
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
  }, []);
}

function EssayTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024;
    const c = canvas.getContext('2d')!;
    c.fillStyle = '#e9ddc1'; c.fillRect(0, 0, 768, 1024);
    c.fillStyle = '#c6b99d'; c.fillRect(0, 0, 15, 1024);
    c.strokeStyle = '#c7b99d'; c.lineWidth = 2;
    for (let y = 205; y < 890; y += 58) { c.beginPath(); c.moveTo(78, y); c.lineTo(690, y); c.stroke(); }
    c.fillStyle = '#604c3b'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.font = 'bold 35px Georgia'; c.fillText('O QUE QUERO SER', 78, 112);
    c.font = 'italic 27px Georgia'; c.fillText('quando crescer?', 78, 157);
    c.save(); c.translate(0, 4); c.rotate(-.012); c.font = 'italic 37px Georgia';
    ['Eu quero ser médico', 'igual ao meu pai.', 'Ele cuida das pessoas', 'e sabe muitas coisas.'].forEach((line, i) => c.fillText(line, 78, 280 + i * 72)); c.restore();
    c.font = 'italic 24px Georgia'; c.fillStyle = '#78634c'; c.fillText('Oliver', 78, 936);
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
  }, []);
}

function DoorModel() {
  return <group>
    {/* Small wall cross-section establishes how the door sits in the corridor. */}
    <mesh position={[0, 0, -.17]} castShadow receiveShadow><boxGeometry args={[3.5, 4.8, .34]}/><meshStandardMaterial color="#b7a48a" roughness={.94}/></mesh>
    <mesh position={[0, -1.75, .02]}><boxGeometry args={[3.55, .18, .42]}/><meshStandardMaterial color="#766047" roughness={.82}/></mesh>
    <mesh position={[0, .02, .08]} castShadow receiveShadow><boxGeometry args={[1.72, 3.56, .18]}/><meshStandardMaterial color="#593b2a" roughness={.84}/></mesh>
    <mesh position={[0, .02, .185]} castShadow receiveShadow><boxGeometry args={[1.48, 3.28, .1]}/><meshStandardMaterial color="#805637" roughness={.84}/></mesh>
    {[[-.57, 0], [.57, 0]].map(([x, y]) => <mesh key={x} position={[x, y, .245]} castShadow><boxGeometry args={[.035, 3.23, .025]}/><meshStandardMaterial color="#b08455" roughness={.85}/></mesh>)}
    {[-1, 1].map(side => <group key={side} position={[side * .93, .02, .12]}>
      <mesh castShadow><boxGeometry args={[.2, 3.95, .35]}/><meshStandardMaterial color="#68482f" roughness={.8}/></mesh>
      <mesh position={[0, 0, .19]}><boxGeometry args={[.1, 3.8, .04]}/><meshStandardMaterial color="#ac8050" roughness={.8}/></mesh>
    </group>)}
    <mesh position={[0, 1.98, .12]} castShadow><boxGeometry args={[2.06, .2, .35]}/><meshStandardMaterial color="#68482f" roughness={.8}/></mesh>
    <mesh position={[.48, -.02, .27]} castShadow><cylinderGeometry args={[.11, .11, .12, 32]}/><meshStandardMaterial color="#c2a06c" metalness={.72} roughness={.3}/></mesh>
    <mesh position={[.57, -.02, .36]} castShadow><sphereGeometry args={[.09, 24, 16]}/><meshStandardMaterial color="#d0b47d" metalness={.68} roughness={.27}/></mesh>
    <mesh position={[-.76, -.95, .27]}><boxGeometry args={[.045, .32, .025]}/><meshStandardMaterial color="#bd9a6d" metalness={.55} roughness={.4}/></mesh>
  </group>;
}

function ChairModel() {
  const doodle = DoodleTexture();
  return <group>
    {/* child-sized tubular chair, front of the desk is kept open for access */}
    <mesh position={[0, .45, -.37]} castShadow receiveShadow><boxGeometry args={[1.18, .92, .13]}/><meshStandardMaterial color="#31506a" roughness={.66}/></mesh>
    <mesh position={[0, .45, -.298]}><planeGeometry args={[1.02, .76]}/><meshStandardMaterial map={doodle} roughness={.9}/></mesh>
    <mesh position={[0, -.24, 0]} castShadow receiveShadow><boxGeometry args={[1.06, .16, .96]}/><meshStandardMaterial color="#31506a" roughness={.65}/></mesh>
    {[-.42, .42].map(x => <group key={x}>
      <mesh position={[x, -.14, -.36]} castShadow><cylinderGeometry args={[.035, .035, 1.55, 12]}/><meshStandardMaterial color="#343b3d" metalness={.35} roughness={.56}/></mesh>
      <mesh position={[x, -.14, .36]} castShadow><cylinderGeometry args={[.035, .035, 1.55, 12]}/><meshStandardMaterial color="#343b3d" metalness={.35} roughness={.56}/></mesh>
      <mesh position={[x, -.86, 0]} castShadow><boxGeometry args={[.08, .06, .86]}/><meshStandardMaterial color="#252c2e" metalness={.32} roughness={.58}/></mesh>
    </group>)}
    {[-1, 1].map(side => <mesh key={side} position={[side * .43, -.05, -.35]} rotation={[.12, 0, side * -.12]} castShadow><cylinderGeometry args={[.025, .025, .8, 10]}/><meshStandardMaterial color="#343b3d" metalness={.35} roughness={.56}/></mesh>)}
    {/* desk surface and legs shown as scale/context reference */}
    <mesh position={[0, .24, .92]} castShadow receiveShadow><boxGeometry args={[2.2, .14, 1.08]}/><meshStandardMaterial color="#9a6d43" roughness={.78}/></mesh>
    {[-.92, .92].flatMap(x => [-.1, 1.92].map(z => <mesh key={`${x}-${z}`} position={[x, -.61, z]} castShadow><boxGeometry args={[.09, 1.48, .09]}/><meshStandardMaterial color="#51483d" metalness={.18} roughness={.66}/></mesh>))}
  </group>;
}

export function EssayModel() {
  const page = EssayTexture();
  return <group rotation={[-.42, 0, -.09]}>
    <mesh castShadow receiveShadow><boxGeometry args={[1.65, 2.2, .045]}/><meshStandardMaterial color="#b5a587" roughness={1}/></mesh>
    <mesh position={[0, 0, .027]}><planeGeometry args={[1.59, 2.14]}/><meshStandardMaterial map={page} roughness={.97}/></mesh>
    <mesh position={[0, .65, .053]} castShadow><boxGeometry args={[.22, .12, .025]}/><meshStandardMaterial color="#ad7853" metalness={.45} roughness={.5}/></mesh>
    <mesh position={[0, -1.08, .032]}><boxGeometry args={[1.58, .025, .04]}/><meshStandardMaterial color="#b9a984" roughness={1}/></mesh>
  </group>;
}

function PrototypeModel({ type }: { type: Prototype }) {
  if (type === 'door') return <DoorModel/>;
  if (type === 'chair') return <ChairModel/>;
  return <EssayModel/>;
}

export function ModelPrototypePreview() {
  const [selected, setSelected] = useState<Prototype>('door');
  const [rotation, setRotation] = useState({ x: -.08, y: -.24 });
  const active = choices.find(item => item.id === selected)!;
  return <main className="prototype-page">
    <header><p className="eyebrow">WAS · PRÉVIA DE MODELOS 3D</p><h1>Escola · objetos para validar</h1><p>Protótipos de volume e materiais. Arraste a cena para girar os objetos.</p></header>
    <nav className="prototype-choices" aria-label="Selecionar modelo">
      {choices.map(item => <button key={item.id} className={selected === item.id ? '' : 'secondary'} onClick={() => { setSelected(item.id); setRotation({ x: -.08, y: -.24 }); }}><small>{item.phase}</small>{item.title}</button>)}
    </nav>
    <section className="prototype-preview-grid">
      <div className="prototype-canvas" onPointerDown={event => { event.currentTarget.dataset.dragX = String(event.clientX); event.currentTarget.dataset.dragY = String(event.clientY); }} onPointerMove={event => {
        if (!(event.buttons & 1)) return;
        const el = event.currentTarget; const x = Number(el.dataset.dragX ?? event.clientX), y = Number(el.dataset.dragY ?? event.clientY);
        const dx = event.clientX - x, dy = event.clientY - y; el.dataset.dragX = String(event.clientX); el.dataset.dragY = String(event.clientY);
        if (dx || dy) setRotation(value => ({ x: Math.max(-.65, Math.min(.65, value.x + dy * .007)), y: value.y + dx * .009 }));
      }}>
        <Canvas shadows camera={{ position: [0, 0, 6.2], fov: 38 }} gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.08 }}>
          <color attach="background" args={['#202825']}/><fog attach="fog" args={['#202825', 8, 16]}/>
          <ambientLight intensity={1.05}/><hemisphereLight args={['#f0dfc3', '#26302d', 1.2]}/>
          <directionalLight position={[3, 6, 5]} intensity={2.25} castShadow shadow-mapSize={[1024, 1024]}/>
          <directionalLight position={[-4, 2, -3]} intensity={1.1} color="#b5c4bd"/>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow><planeGeometry args={[20, 20]}/><meshStandardMaterial color="#373932" roughness={.96}/></mesh>
          <gridHelper args={[12, 24, '#66624e', '#454940']} position={[0, -1.24, 0]}/>
          <group rotation={[rotation.x, rotation.y, 0]} position={[0, -.05, 0]}><PrototypeModel type={selected}/></group>
        </Canvas>
        <span>ARRASTE PARA GIRAR</span>
      </div>
      <aside className="prototype-notes"><p className="eyebrow">{active.phase}</p><h2>{active.title}</h2><p>{active.note}</p><dl><dt>Uso previsto</dt><dd>{selected === 'door' ? 'Peça ambiental e referência de escala para a saída do corredor.' : 'Inspeção 3D explorável; a inclusão na fase fica para depois da sua aprovação.'}</dd><dt>Estado</dt><dd>Modelo base provisório para validar forma, cor e leitura visual.</dd></dl></aside>
    </section>
    <footer><span>Prévia isolada; não altera o fluxo normal do jogo.</span><button className="secondary" onClick={() => { setRotation({ x: -.08, y: -.24 }); }}>Restaurar ângulo</button></footer>
  </main>;
}
