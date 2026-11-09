import Phaser from 'phaser';
import { usePreferences } from '../preferences';
import { breathScale, facingForMovement, type Facing } from './oliverMotion';

// Casual idle and walking frames share the same source height.
const casualScale = 0.30;
const strideKey = 'oliver-casual-walk-original';
// Sheet frames are 1024px tall; the separate lateral idle image is 1774px tall.
// Keep their rendered heights equal so facing/walking cannot resize Oliver.
const medicalFrameScale = 0.30;
const medicalSideScale = 0.165;

function casualScene(scene: Phaser.Scene) { return !['cenario-07', 'cenario-08'].includes(String(scene.sys.settings.key)); }

export function preloadOliver(scene: Phaser.Scene) {
  const casual = casualScene(scene);
  if (casual && !scene.textures.exists(strideKey)) {
    scene.load.image(strideKey, '/assets/characters/oliver-casual-walk-v1.png');
  }
  const sideKey = casual ? 'oliver-casual' : 'oliver-ciano';
  const frontKey = casual ? 'oliver-casual-front' : 'oliver-front';
  const backKey = casual ? 'oliver-casual-back' : 'oliver-back';
  if (!scene.textures.exists(sideKey)) {
    // One source sheet drives both idle and walking to preserve the exact
    // face, hair, outfit and backpack across side-facing poses.
    scene.load.image(sideKey, casual ? '/assets/characters/oliver-casual-walk-v2.png' : '/assets/characters/oliver-ciano-walk-v1.png');
  }
  if (!scene.textures.exists(frontKey)) scene.load.image(frontKey, casual ? '/assets/characters/oliver-casual-front-v1.png' : '/assets/characters/oliver-front-v1.png');
  if (!scene.textures.exists(backKey)) scene.load.image(backKey, casual ? '/assets/characters/oliver-casual-back-v1.png' : '/assets/characters/oliver-back-v1.png');
  if (!casual && !scene.textures.exists('oliver-side-idle')) scene.load.image('oliver-side-idle', '/assets/characters/oliver-side-idle-v1.png');
}

export function createOliver(scene: Phaser.Scene) {
  const casual = casualScene(scene);
  const textureKey = casual ? 'oliver-casual' : 'oliver-ciano';
  const frontKey = casual ? 'oliver-casual-front' : 'oliver-front';
  const backKey = casual ? 'oliver-casual-back' : 'oliver-back';
  const texture = scene.textures.get(textureKey);
  // Recortes da folha original; trim alinha o corpo sem modificar a arte.
  const frames = casual
    ? [{ x: 0, width: 450, offset: 92 }, { x: 475, width: 495, offset: 72 }, { x: 985, width: 551, offset: 103 }]
    : [{ x: 0, width: 450, offset: 115 }, { x: 450, width: 495, offset: 50 }, { x: 945, width: 591, offset: 105 }];
  frames.forEach((frame, index) => {
    if (!texture.has(String(index))) {
      texture.add(String(index), 0, frame.x, 0, frame.width, 1024)
        ?.setTrim(720, 1024, frame.offset, 0, frame.width, 1024);
    }
  });
  if (casual) {
    const stride = scene.textures.get(strideKey);
    // Align the crown of the head to the standing frame,
    //     including when mirrored.
    for (const [i, x, width, offset] of [[0, 0, 460, 92], [1, 470, 466, 42], [2, 938, 598, 50]]) {
      if (!stride.has(String(i))) stride.add(String(i), 0, x, 0, width, 1024)?.setTrim(720, 1024, offset, 0, width, 1024);
    }
  }
  const sideWalkKey = `${textureKey}-walk`;
  if (!casual && !scene.anims.exists(sideWalkKey)) {
    scene.anims.create({ key: sideWalkKey, frames: ['0', '1', '0', '2'].map(frame => ({ key: textureKey, frame })), frameRate: 7, repeat: -1 });
  }
  // Align the head in each original pose to x=360, regardless of foot placement.
  // The casual front/back sheets are centered poses. Crop each pose and
  // offset the content to the same body center used by the side profile.
  const frontOffsets = casual ? [57, 103, 146] : [55, 105, 155];
  const backOffsets = casual ? [68, 106, 143] : [67, 106, 145];
  for (const [key, offsets] of [[frontKey, frontOffsets], [backKey, backOffsets]] as const) {
    const sheet = scene.textures.get(key);
    offsets.forEach((offset, index) => {
      if (!sheet.has(String(index))) sheet.add(String(index), 0, index * 512, 0, 512, 1024)?.setTrim(720, 1024, offset, 0, 512, 1024);
    });
    if (!scene.anims.exists(`${key}-walk`)) {
      scene.anims.create({ key: `${key}-walk`, frames: ['1', '0', '2', '0'].map(frame => ({ key, frame })), frameRate: 7, repeat: -1 });
    }
  }
  const shadow = scene.add.ellipse(0, -3, 65, 12, 0x241b16, 0.24);
  const sprite = scene.add.sprite(0, 0, casual ? textureKey : 'oliver-side-idle', casual ? '0' : undefined).setOrigin(0.5, casual ? 0.955 : 0.975).setScale(casual ? casualScale : medicalSideScale);
  const container = scene.add.container(170, 490, [shadow, sprite]);
  container.setData('sprite', sprite);
  container.setData('outfit', casual ? 'casual' : 'medical');
  container.setData('facing', 'right');
  container.setData('breathTime', 0);
  container.setData('gaitDistance', 0);
  return container;
}

export function animateOliver(oliver: Phaser.GameObjects.Container, dx: number, dy = 0, delta = 16, paused = false) {
  const sprite = oliver.getData('sprite') as Phaser.GameObjects.Sprite;
  const casual = oliver.getData('outfit') === 'casual';
  const sideKey = casual ? 'oliver-casual' : 'oliver-ciano';
  const frontKey = casual ? 'oliver-casual-front' : 'oliver-front';
  const backKey = casual ? 'oliver-casual-back' : 'oliver-back';
  const previous = oliver.getData('facing') as Facing;
  const facing = facingForMovement(dx, dy, previous);
  oliver.setData('facing', facing);
  const texture = facing === 'front' ? frontKey : facing === 'back' ? backKey : sideKey;
  const distance = Math.hypot(dx, dy);
  const moving = !paused && distance >= 0.025;
  sprite.setFlipX(facing === 'left');
  if (moving) {
    sprite.setOrigin(0.5, casual ? 0.955 : 0.975).setScale(casual ? casualScale : medicalFrameScale);
    // Keep the same stride phase through turns; advance only when actually moving.
    const strideLength = 190;
    const gait = ((oliver.getData('gaitDistance') as number) + distance) % strideLength;
    oliver.setData('gaitDistance', gait);
    const phase = gait / strideLength;
    const lateralStride = casual && texture === sideKey;
    const beat = Math.floor(phase * 8);
    const walkTexture = lateralStride && [1, 2, 5, 6].includes(beat) ? strideKey : texture;
    const frames = ['0','1','0','2'];
    // In depth, spend more of each step on the planted foot and briefly pass through neutral.
    const vertical = facing === 'front' || facing === 'back';
    const supportFrame = phase < .5 ? '1' : '2';
    const halfStep = (phase * 2) % 1;
    const frame = lateralStride ? ['2', '1', '0', '1', '2', '0', '1', '1'][beat] : vertical ? (halfStep < .62 ? supportFrame : '0')
      : frames[Math.floor(phase * frames.length)];
    sprite.stop();
    if (sprite.texture.key !== walkTexture || sprite.frame.name !== frame) sprite.setTexture(walkTexture, frame);
    if (walkTexture === strideKey) sprite.setOrigin(.5, .955 + (frame === '0' ? 1 : frame === '2' ? 5 : 0) / 1024);
    oliver.setData('breathTime', 0);
  } else {
    sprite.stop();
    const lateral = facing === 'left' || facing === 'right';
    const idleTexture = lateral ? (casual ? sideKey : 'oliver-side-idle') : texture;
    const idleFrame = lateral && !casual ? undefined : '0';
    if (sprite.texture.key !== idleTexture || (idleFrame !== undefined && sprite.frame.name !== idleFrame)) sprite.setTexture(idleTexture, idleFrame);
    // A pose lateral tem resolução maior; normaliza altura e apoio dos pés.
    const baseScale = casual ? casualScale : lateral ? medicalSideScale : medicalFrameScale;
    sprite.setOrigin(0.5, lateral && !casual ? 0.975 : 0.955);
    const elapsed = (oliver.getData('breathTime') as number) + Math.min(delta, 50);
    oliver.setData('breathTime', elapsed);
    const scale = breathScale(elapsed, !paused && !usePreferences.getState().reducedMotion);
    sprite.setScale(baseScale * scale.x, baseScale);
  }
}
