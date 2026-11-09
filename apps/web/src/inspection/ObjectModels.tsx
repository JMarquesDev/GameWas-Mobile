import { useEffect, useMemo } from 'react';
import { CanvasTexture, Shape, ShapeGeometry, SRGBColorSpace, TextureLoader } from 'three';
import { useLoader } from '@react-three/fiber';
import type { ObjectId } from '@was/game-content';

function drawTexture(kind: string, illustration?: HTMLImageElement): CanvasTexture {
  const canvas = document.createElement('canvas'); canvas.width = kind.startsWith('brain') ? 768 : 1024; canvas.height = kind.startsWith('brain') ? 1280 : 1024;
  const c = canvas.getContext('2d')!;
  c.fillStyle = kind === 'clock' ? '#eee2c9' : kind === 'engraving' ? '#a69984' : '#e8ddc5';
  c.fillRect(0, 0, 1024, 1024); c.strokeStyle = '#40392e'; c.fillStyle = '#40392e';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  if (kind === 'clock') {
    c.fillStyle = '#f1e9d8'; c.fillRect(0, 0, 1024, 1024);
    c.strokeStyle = '#9b8060'; c.lineWidth = 7; c.beginPath(); c.arc(512, 512, 456, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#725b43';
    for (let n = 0; n < 60; n++) { const a = n * Math.PI / 30; const major = n % 5 === 0; c.lineWidth = major ? 7 : 3; c.beginPath(); c.moveTo(512 + Math.sin(a) * 430, 512 - Math.cos(a) * 430); c.lineTo(512 + Math.sin(a) * (major ? 403 : 416), 512 - Math.cos(a) * (major ? 403 : 416)); c.stroke(); }
    c.fillStyle = '#49392d'; c.font = 'bold 66px Georgia';
    for (let n = 1; n <= 12; n++) { if (n === 6) continue; const a = n * Math.PI / 6; c.fillText(String(n), 512 + Math.sin(a) * 354, 512 - Math.cos(a) * 354); }
    c.font = '24px Georgia'; c.fillText('WAS', 512, 335); c.font = '19px Georgia'; c.fillText('MEMÓRIAS', 512, 370);
    c.strokeStyle = '#a58b6b'; c.lineWidth = 4; c.beginPath(); c.arc(512, 730, 95, 0, Math.PI * 2); c.stroke();
    for (let n = 0; n < 12; n++) { const a = n * Math.PI / 6; c.beginPath(); c.moveTo(512 + Math.sin(a)*80,730-Math.cos(a)*80); c.lineTo(512+Math.sin(a)*70,730-Math.cos(a)*70); c.stroke(); }
    c.strokeStyle = '#343f47'; c.lineCap = 'round'; c.lineWidth = 10; c.beginPath(); c.moveTo(512,730); c.lineTo(512,675); c.stroke();
    c.lineWidth = 25; c.beginPath(); c.moveTo(512, 512); c.lineTo(365, 425); c.stroke(); c.lineWidth = 17; c.beginPath(); c.moveTo(512, 512); c.lineTo(648, 235); c.stroke();
    c.fillStyle = '#bd9a67'; c.beginPath(); c.arc(512, 512, 17, 0, Math.PI * 2); c.fill();
  } else if (kind === 'engraving') {
    c.fillStyle = '#b5a188'; c.fillRect(0, 0, 1024, 1024);
    c.strokeStyle = '#806c55'; c.lineWidth = 5; c.beginPath(); c.arc(512, 512, 426, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.arc(512, 512, 395, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#514439'; c.font = 'italic 72px Georgia'; ['Para Oliver', '18 anos', 'Te amo,', 'meu filho.'].forEach((line, i) => c.fillText(line, 512, 310 + i * 135));
  } else if (kind === 'photo-back') {
    c.font = 'italic 85px Georgia'; c.fillText('Ele ficaria feliz.', 512, 500);
    c.font = '38px Georgia'; c.fillText('Uma lembrança guardada.', 512, 650);
  } else if (kind === 'brain') {
    c.fillStyle = '#f0e9d9'; c.fillRect(0, 0, canvas.width, canvas.height);
    // Fine paper grain, kept subtle so the pencil drawing remains clear.
    for (let i = 0; i < 1900; i++) { const x = (i * 197 + 31) % canvas.width, y = (i * 431 + 97) % canvas.height; c.fillStyle = i % 3 ? '#8377620a' : '#ffffff35'; c.fillRect(x, y, i % 5 === 0 ? 2 : 1, 1); }
    // Load the finished pencil illustration before composing the paper texture.
    if (illustration) {
      const drawingWidth = 690;
      const drawingHeight = drawingWidth * illustration.height / illustration.width;
      c.drawImage(illustration, 39, 240, drawingWidth, drawingHeight);
    }
    c.fillStyle = '#514638'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'italic 49px Georgia'; c.fillText('Algumas coisas', 384, 930); c.fillText('a gente esquece.', 384, 1000);
    c.strokeStyle = '#75675666'; c.lineWidth = 2; c.beginPath(); c.moveTo(190, 1045); c.lineTo(578, 1045); c.stroke();
  } else if (kind === 'brain-back') {
    c.fillStyle = '#f0e9d9'; c.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 1400; i++) { const x = (i * 197 + 31) % canvas.width, y = (i * 431 + 97) % canvas.height; c.fillStyle = i % 3 ? '#8377620a' : '#ffffff35'; c.fillRect(x, y, 1, 1); }
    c.strokeStyle = '#8a7b6655'; c.lineWidth = 2; c.strokeRect(55, 55, 658, 1170);
    c.fillStyle = '#6d5e4b'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'italic 44px Georgia';
    ['Para o Oliver,', 'quando quiser lembrar:', '', 'o que a gente esquece', 'também fez parte', 'da gente.'].forEach((line, i) => c.fillText(line, 384, 400 + i * 76));
    c.font = 'italic 40px Georgia'; c.fillText('— pai', 550, 930);
  }
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}
function Surface({ kind, back = false, width = 1.6, height = 1.8, z = 0.04, round = false, illustration }: { illustration?: HTMLImageElement; kind: string; back?: boolean; width?: number; height?: number; z?: number; round?: boolean }) {
  const texture = useMemo(() => drawTexture(kind, illustration), [kind, illustration]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh castShadow receiveShadow position={[0, 0, back ? -z : z]} rotation={[0, back ? Math.PI : 0, 0]}>
    {round ? <circleGeometry args={[width / 2, 64]}/> : <planeGeometry args={[width, height]}/>}
    {kind.startsWith('brain') ? <meshBasicMaterial map={texture} toneMapped={false}/> : <meshStandardMaterial map={texture} roughness={0.92}/>}
  </mesh>;
}
export function ObjectModel({ id }: { id: ObjectId }) {
  if (id === 'relogio') return <Watch/>;
  if (id === 'desenho') return <BrainPage/>;
  return <Polaroid/>;
}

function Polaroid() {
  const source = useLoader(TextureLoader, '/assets/inspection/oliver-pai-polaroid-v1.png');
  const width = 1.95, height = 2.0, thickness = .024;
  const { shape, face, front, back } = useMemo(() => {
    const shape = new Shape(), r = .035, x = width / 2, y = height / 2;
    shape.moveTo(-x + r, -y); shape.lineTo(x - r, -y);
    shape.quadraticCurveTo(x, -y, x, -y + r); shape.lineTo(x, y - r);
    shape.quadraticCurveTo(x, y, x - r, y); shape.lineTo(-x + r, y);
    shape.quadraticCurveTo(-x, y, -x, y - r); shape.lineTo(-x, -y + r);
    shape.quadraticCurveTo(-x, -y, -x + r, -y);
    const face = new ShapeGeometry(shape, 12);
    const positions = face.attributes.position, uv = face.attributes.uv;
    for (let i = 0; i < positions.count; i++) uv.setXY(i, positions.getX(i) / width + .5, positions.getY(i) / height + .5);
    // Map only the paper area of the source; its black presentation background is excluded.
    const canvas = document.createElement('canvas'); canvas.width = 1068; canvas.height = 1095;
    canvas.getContext('2d')!.drawImage(source.image, 125, 40, 1068, 1095, 0, 0, 1068, 1095);
    const front = new CanvasTexture(canvas); front.colorSpace = SRGBColorSpace; front.anisotropy = 4;
    const back = drawTexture('photo-back');
    return { shape, face, front, back };
  }, [source]);
  useEffect(() => () => { face.dispose(); front.dispose(); back.dispose(); }, [face, front, back]);
  return <group>
    <mesh castShadow receiveShadow position={[0, 0, -thickness / 2]}>
      <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: true, bevelThickness: .003, bevelSize: .003, bevelSegments: 2, curveSegments: 12 }]}/>
      <meshStandardMaterial color="#cbb99b" roughness={.9}/>
    </mesh>
    <mesh geometry={face} position={[0, 0, thickness / 2 + .004]}>
      <meshStandardMaterial map={front} roughness={.72} metalness={0}/>
    </mesh>
    <mesh geometry={face} position={[0, 0, -thickness / 2 - .004]} rotation={[0, Math.PI, 0]}>
      <meshStandardMaterial map={back} roughness={.94}/>
    </mesh>
  </group>;
}

function Watch() {
  // A shaped leather strap, with a tapered tip and genuine openings for the buckle.
  const strap = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-.29, .58); shape.lineTo(.29, .58); shape.lineTo(.265, 1.32);
    shape.quadraticCurveTo(.26, 1.45, .13, 1.48); shape.quadraticCurveTo(0, 1.52, -.13, 1.48);
    shape.quadraticCurveTo(-.26, 1.45, -.265, 1.32); shape.lineTo(-.29, .58);
    return shape;
  }, []);
  const metal = '#aa8c64';
  return <group>
    {[-1, 1].map(side => <group key={side} rotation={[0, 0, side === -1 ? Math.PI : 0]}>
      <mesh castShadow receiveShadow position={[0, 0, -.065]}><extrudeGeometry args={[strap, { depth: .13, bevelEnabled: true, bevelThickness: .022, bevelSize: .022, bevelSegments: 3, curveSegments: 16 }]}/><meshStandardMaterial color="#583728" roughness={.82}/></mesh>
      {/* Individual stitches follow both edges on the front and reverse. */}
      {[-1, 1].flatMap(face => [-1, 1].flatMap(edge => Array.from({ length: 15 }, (_, i) => <mesh key={`${face}-${edge}-${i}`} position={[edge * (.255 - i * .0015), .68 + i * .047, face * .09]} rotation={[0, 0, edge * .18]}><capsuleGeometry args={[.006, .019, 3, 5]}/><meshStandardMaterial color="#d1ae83" roughness={1}/></mesh>)))}
      {[-1, 1].map(x => <group key={x} position={[x * .33, .55, 0]} rotation={[0, 0, x * -.22]}><mesh castShadow><capsuleGeometry args={[.065, .28, 5, 12]}/><meshStandardMaterial color={metal} metalness={.8} roughness={.3}/></mesh></group>)}
      {side === -1 && [1.01, 1.13, 1.25, 1.37].map(y => <mesh key={y} position={[0, y, .091]}><circleGeometry args={[.029, 20]}/><meshStandardMaterial color="#241711" roughness={1}/></mesh>)}
      {side === 1 && <group position={[0, 1.33, .04]}>
        <mesh position={[0, .08, 0]}><boxGeometry args={[.59, .065, .095]}/><meshStandardMaterial color={metal} metalness={.8} roughness={.3}/></mesh>
        {[-1, 1].map(x => <mesh key={x} position={[x * .275, 0, 0]}><boxGeometry args={[.055, .22, .095]}/><meshStandardMaterial color={metal} metalness={.8} roughness={.3}/></mesh>)}
        <mesh position={[0, -.08, .04]}><boxGeometry args={[.035, .19, .035]}/><meshStandardMaterial color={metal} metalness={.8} roughness={.3}/></mesh>
      </group>}
    </group>)}
    <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.71, .70, .23, 96, 1]}/><meshStandardMaterial color={metal} metalness={.8} roughness={.32}/></mesh>
    {/* Raised polished bezel and a second rim on the case back add depth from every angle. */}
    {[.135, -.127].map(z => <mesh key={z} position={[0, 0, z]}><torusGeometry args={[.665, .037, 12, 96]}/><meshStandardMaterial color="#d3b78a" metalness={.83} roughness={.23}/></mesh>)}
    <mesh position={[0, 0, .14]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.651, .651, .018, 96]}/><meshStandardMaterial color="#d9caaa" metalness={.3} roughness={.4}/></mesh>
    <Surface kind="clock" width={1.285} round z={.151}/>
    <Surface kind="engraving" width={1.285} back round z={.131}/>
    {/* Thin transparent crystal gives the face a restrained reflection. */}
    <mesh position={[0, 0, .164]}><circleGeometry args={[.641, 96]}/><meshPhysicalMaterial color="#eee9dd" transparent opacity={.08} roughness={.12} metalness={.05} depthWrite={false}/></mesh>
    <mesh castShadow position={[.755, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.105, .105, .16, 32]}/><meshStandardMaterial color={metal} metalness={.82} roughness={.27}/></mesh>
    {Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return <mesh key={i} position={[.842, Math.cos(a) * .094, Math.sin(a) * .094]}><sphereGeometry args={[.008, 5, 5]}/><meshStandardMaterial color="#e2c79a" metalness={.8} roughness={.3}/></mesh>; })}
  </group>;
}

function BrainPage() {
  const illustration = useLoader(TextureLoader, '/assets/inspection/brain-pencil-v1.png');
  const width = 1.5, height = 2.5, depth = .065, radius = .045;
  const shape = useMemo(() => {
    const s = new Shape(); s.moveTo(-width / 2 + radius, -height / 2); s.lineTo(width / 2 - radius, -height / 2); s.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius); s.lineTo(width / 2, height / 2 - radius); s.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2); s.lineTo(-width / 2 + radius, height / 2); s.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius); s.lineTo(-width / 2, -height / 2 + radius); s.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2); return s;
  }, []);
  return <group position={[0, 0, -depth / 2]}>
    <mesh castShadow receiveShadow><extrudeGeometry args={[shape, { depth, bevelEnabled: true, bevelThickness: .008, bevelSize: .008, bevelSegments: 2, curveSegments: 8 }]}/><meshStandardMaterial color="#e8dfce" roughness={.94}/></mesh>
    <Surface kind="brain" illustration={illustration.image} width={width - .055} height={height - .055} z={depth + .012}/>
    <Surface kind="brain-back" width={width - .055} height={height - .055} back z={.012}/>
  </group>;
}

