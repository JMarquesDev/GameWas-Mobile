import Phaser from 'phaser';
import { createOliver, animateOliver } from '../entities/Oliver';
import { usePreferences } from '../preferences';
import { findWalkPath, floors, isWalkable, moveOnFloor, perspective, type Point } from './navigation';
import { sceneSize } from '../backgrounds';
import { useGameStore } from '../store';
import { gameAudio } from '../audio';

export class Exploration {
  readonly oliver: Phaser.GameObjects.Container;
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private foot: Point;
  private velocity = { x: 0, y: 0 };
  private checkpointTime = 0;
  private travelled = 0;
  private path: Point[] = [];
  private arrival?: () => void;
  walkTo(destination: Point, arrival?: () => void) {
    this.path = findWalkPath(this.key, this.foot, destination);
    this.arrival = this.path.length ? arrival : undefined;
    return this.path.length > 0;
  }
  get destination() { return this.path.at(-1); }
  constructor(private scene: Phaser.Scene, private key: string) {
    const saved = useGameStore.getState().session.positions[key];
    this.foot = { ...(saved && isWalkable(key, saved) ? saved : (floors[key] ?? floors.infancia).spawn) };
    this.oliver = createOliver(scene);
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT') as typeof this.keys;
    this.render();
    const camera = scene.cameras.main;
    const ratio = sceneSize(key).height / 540;
    const frame = () => {
      const size = sceneSize(key);
      camera.setBounds(0, 0, key === 'infancia-corredor' ? size.width * 3 : size.width, size.height);
      const touch = window.matchMedia('(pointer: coarse)').matches;
      const width = scene.scale.width;
      const height = scene.scale.height;
      // Fill landscape and desktop viewports so scenes do not shrink into a band
      // or leave black borders. Portrait touch keeps the complete room visible.
      const zoom = touch && height > width
        ? Math.min(width / size.width, height / size.height)
        : Math.max(width / size.width, height / size.height) * 1.01;
      const worldWidth = key === 'infancia-corredor' ? size.width * 3 : size.width;
      const viewWidth = Math.min(width, Math.round(worldWidth * zoom));
      const viewHeight = Math.min(height, Math.round(size.height * zoom));
      camera.setViewport(Math.round((width - viewWidth) / 2), Math.round((height - viewHeight) / 2), viewWidth, viewHeight);
      camera.setZoom(zoom);
      camera.setDeadzone(viewWidth / zoom * .09, viewHeight / zoom * .04);
    };
    frame();
    // O foco fica entre cabeça e pés; a margem reduz ajustes a cada passo.
    // Mantém um pouco mais do cenário acima, sem empurrar os pés para a borda inferior.
    camera.startFollow(this.oliver, false, usePreferences.getState().reducedMotion ? 1 : 0.075, usePreferences.getState().reducedMotion ? 1 : 0.075, 0, 62 * ratio);
    scene.scale.on('resize', frame);
    const flush = () => useGameStore.getState().checkpoint(this.key, this.foot);
    const unsubscribe = useGameStore.subscribe((state, previous) => { if (state.paused && !previous.paused) flush(); });
    window.addEventListener('pagehide', flush);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { scene.scale.off('resize', frame); window.removeEventListener('pagehide', flush); unsubscribe(); });
  }
  get position() { return this.foot; }
  update(delta: number, paused: boolean) {
    const editing = document.activeElement?.matches('input, select, textarea');
    const keyboard = this.scene.input.keyboard;
    const enabled = !paused && !useGameStore.getState().paused && !editing;
    if (keyboard && keyboard.enabled !== enabled) { keyboard.resetKeys(); keyboard.enabled = enabled; }
    if (paused || useGameStore.getState().paused || editing) { this.velocity = { x: 0, y: 0 }; animateOliver(this.oliver, 0, 0, delta, true); return; }
    let dx = Number(this.keys.D.isDown || this.keys.RIGHT.isDown) - Number(this.keys.A.isDown || this.keys.LEFT.isDown);
    let dy = Number(this.keys.S.isDown || this.keys.DOWN.isDown) - Number(this.keys.W.isDown || this.keys.UP.isDown);
    const touch = useGameStore.getState().touch;
    if (touch.x || touch.y) { dx = touch.x; dy = touch.y; }
    if (dx || dy) { this.path = []; this.arrival = undefined; }
    const waypoint = this.path[0];
    if (waypoint) {
      const remaining = Math.hypot(waypoint.x - this.foot.x, waypoint.y - this.foot.y);
      const budget = usePreferences.getState().speed * Math.min(delta, 50) / 1000 * .65;
      if (remaining <= Math.max(1, budget)) {
        const before = this.foot;
        this.foot = moveOnFloor(this.key, this.foot, waypoint.x-this.foot.x, waypoint.y-this.foot.y);
        animateOliver(this.oliver, this.foot.x-before.x, (this.foot.y-before.y)/.65, delta);
        this.path.shift(); this.render();
        if (!this.path.length) { const arrived = this.arrival; this.arrival = undefined; arrived?.(); }
        return;
      }
      dx = waypoint.x-this.foot.x; dy = (waypoint.y-this.foot.y)/.65;
    }
    const length = Math.hypot(dx, dy);
    if (length) { dx /= length; dy /= length; }
    const response = waypoint ? 1 : 1 - Math.exp(-Math.min(delta, 50) / (length ? 85 : 55));
    this.velocity.x += (dx - this.velocity.x) * response;
    this.velocity.y += (dy - this.velocity.y) * response;
    if (!length && Math.hypot(this.velocity.x, this.velocity.y) < .04) this.velocity = { x: 0, y: 0 };
    const distance = usePreferences.getState().speed * Math.min(delta, 50) / 1000 * perspective(this.key, this.foot.y);
    const next = moveOnFloor(this.key, this.foot, this.velocity.x * distance, this.velocity.y * distance * 0.65);
    const movedX = next.x - this.foot.x;
    const movedY = (next.y - this.foot.y) / 0.65;
    this.foot = next;
    const travelled = Math.hypot(movedX, movedY);
    this.travelled += travelled;
    if (travelled > .1) gameAudio.step(this.key, usePreferences.getState().speed);
    this.checkpointTime += delta;
    if (this.travelled > 1 && this.checkpointTime > 1200) { useGameStore.getState().checkpoint(this.key, this.foot); this.checkpointTime = 0; this.travelled = 0; }
    animateOliver(this.oliver, movedX, movedY, delta);
    this.render();
  }
  private render() {
    const ratio = sceneSize(this.key).height / 540;
    this.oliver.setPosition(this.foot.x, this.foot.y * ratio);
    // The corridor artwork uses the classroom doorway as its height reference.
    const architecturalScale = this.key === 'infancia-corredor' ? 1.10 : this.key === 'cenario-04' ? 1.18 : 1;
    this.oliver.setScale(perspective(this.key, this.foot.y) * ratio * architecturalScale);
    this.oliver.setDepth(this.foot.y);
  }
}
