import Phaser from 'phaser';
import { childhoodObjects, type ObjectId } from '@was/game-content';
import { canInteract } from '@was/game-core';
import { useGameStore } from '../store';
import { preloadOliver } from '../entities/Oliver';
import { Exploration } from '../systems/Exploration';
import { usePreferences } from '../preferences';
import { backgrounds, sceneSize } from '../backgrounds';
import { gameAudio } from '../audio';
import { addForeground } from '../systems/foreground';
export class InfanciaScene extends Phaser.Scene {
  private exploration!: Exploration;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private prompt!: Phaser.GameObjects.Text;
  private destinationMarker!: Phaser.GameObjects.Arc;
  private doorHint!: Phaser.GameObjects.Text;
  private leavingRoom = false;
  private exitDoor?: () => void;
  private markers = new Map<ObjectId, Phaser.GameObjects.Arc>();
  constructor() { super('infancia'); }
  preload() { preloadOliver(this); this.load.image('infancia-quarto', `/assets/backgrounds/${backgrounds[0].file}`); }
  private interact(id?: ObjectId) {
    const state = useGameStore.getState();
    if (state.paused || state.inspecting || document.querySelector('dialog[open]')) return;
    const nearest = this.nearest();
    const target = id ?? nearest?.id;
    if (!target) return;
    if (!canInteract(target, this.exploration.position)) {
      const object = childhoodObjects.find(item => item.id === target)!;
      if (!this.exploration.walkTo(object.approach, () => this.interact(target))) state.notify('Esse caminho está bloqueado. Tente se aproximar pelo piso livre.');
      return;
    }
    gameAudio.cue('open'); state.inspect(target);
  }
  private nearest() {
    const foot = this.exploration.position;
    return childhoodObjects.filter(object => canInteract(object.id, foot)).sort((a, b) => Math.hypot(a.approach.x - foot.x, a.approach.y - foot.y) - Math.hypot(b.approach.x - foot.x, b.approach.y - foot.y))[0];
  }
  create() {
    const height = sceneSize('infancia').height;
    this.add.image(480, height / 2, 'infancia-quarto').setDisplaySize(960, height).setDepth(-1);
    this.markers.clear();
    childhoodObjects.forEach(object => {
      const item = this.add.circle(object.x, object.y * height / 540, 14, 0xcbb78d, .08).setStrokeStyle(1, 0xf5dfb6, .4).setDepth(1001).setInteractive({ useHandCursor: true });
      this.markers.set(object.id, item); item.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => { event.stopPropagation(); this.interact(object.id); });
      item.on('pointerover', () => item.setScale(1.15));
      item.on('pointerout', () => item.setScale(1));
    });
    // Optional environmental details stay separate from the three required clues.
    [
      { x: 125, y: 200, approach: { x: 170, y: 490 }, text: 'A luz da janela atravessa o quarto. Por um instante, tudo parece familiar.' },
      { x: 350, y: 260, approach: { x: 340, y: 385 }, text: 'Um abajur antigo ao lado da cama. O quarto parece ter esperado por alguém.' },
    ].forEach(detail => {
      const spot = this.add.circle(detail.x, detail.y * height / 540, 18, 0xffe8b3, 0).setDepth(1000).setInteractive({ useHandCursor: true });
      spot.on('pointerover', () => spot.setStrokeStyle(1, 0xffe8b3, .55));
      spot.on('pointerout', () => spot.setStrokeStyle(0));
      spot.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        if (useGameStore.getState().paused || document.querySelector('dialog[open]')) return;
        this.exploration.walkTo(detail.approach, () => useGameStore.getState().notify(detail.text));
      });
    });
    addForeground(this, 'infancia', 'infancia-quarto');
    this.prompt = this.add.text(0, 0, '', { fontSize: '12px', align: 'center', color: '#fff4dd', backgroundColor: '#191c1be8', padding: { x: 9, y: 6 } }).setOrigin(.5, 1).setDepth(2000).setResolution(2);
    this.exploration = new Exploration(this, 'infancia');
    const doorApproach = { x: 875, y: 515 };
    this.doorHint = this.add.text(905, 440 * height / 540, 'Sair pela porta', { fontSize: '13px', color: '#fff4dd', backgroundColor: '#191c1be8', padding: { x: 9, y: 6 } }).setOrigin(.5, 1).setDepth(2000).setResolution(2).setVisible(false);
    this.exitDoor = () => {
      const state = useGameStore.getState();
      if (!state.session.memoryWatched || !state.progress.memoryRecovered || state.progress.choices['puzzle:infancia:desenho'] !== 'solved' || state.paused || this.leavingRoom) {
        if (state.session.memoryWatched && state.progress.memoryRecovered && state.progress.choices['puzzle:infancia:desenho'] !== 'solved') state.notify('Abra o diário e resolva o desenho antes de sair.');
        return;
      }
      const position = this.exploration.position;
      if (Math.hypot(position.x - doorApproach.x, position.y - doorApproach.y) > 80) {
        state.notify('Aproxime-se da porta para sair.');
        return;
      }
      this.leavingRoom = true;
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => window.dispatchEvent(new Event('was:door-flashback')));
      this.cameras.main.fadeOut(usePreferences.getState().reducedMotion ? 0 : 900, 0, 0, 0);
    };
    this.add.zone(915, 285 * height / 540, 90, 330 * height / 540).setDepth(1500).setInteractive({ useHandCursor: true }).on('pointerdown', this.exitDoor);
    this.destinationMarker = this.add.circle(0, 0, 8, 0xf5dfb6, .1).setStrokeStyle(1, 0xf5dfb6, .65).setDepth(0).setVisible(false);
    this.interactKey = this.input.keyboard!.addKey('E');
    const touchInteract = () => {
      const position = this.exploration.position;
      if (useGameStore.getState().session.memoryWatched && Math.hypot(position.x - doorApproach.x, position.y - doorApproach.y) <= 80) this.exitDoor?.();
      else this.interact();
    }; window.addEventListener('was:interact', touchInteract);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { window.removeEventListener('was:interact', touchInteract); });
    if (!usePreferences.getState().reducedMotion) this.cameras.main.fadeIn(650, 8, 12, 13);
    this.game.events.emit('was:scene-ready');
  }
  update(_time: number, delta: number) {
    const state = useGameStore.getState();
    const paused = state.paused || !!state.inspecting || document.hidden || !!document.querySelector('dialog[open]');
    this.exploration.update(delta, paused);
    this.doorHint.setVisible(!paused && state.session.memoryWatched && state.progress.memoryRecovered && state.progress.choices['puzzle:infancia:desenho'] === 'solved' && !this.leavingRoom);
    this.doorHint.setText('Sair pela porta · toque');
    const destination = this.exploration.destination;
    this.destinationMarker.setVisible(!paused && !!destination);
    if (destination) this.destinationMarker.setPosition(destination.x, destination.y * sceneSize('infancia').height / 540);
    const nearest = this.nearest();
    this.prompt.setVisible(!paused && !!nearest);
    if (nearest) {
      this.prompt.setPosition(nearest.x, nearest.y * sceneSize('infancia').height / 540 - 20);
      this.prompt.setText(`${state.progress.clues.includes(nearest.id) ? 'Reexaminar' : 'Investigar'} · toque`);
    }
    this.markers.forEach((marker, id) => {
      const active = nearest?.id === id && !paused;
      const discovered = state.progress.clues.includes(id);
      marker.setFillStyle(discovered ? 0x98b5a3 : 0xcbb78d, active ? .26 : discovered ? .025 : .07);
      marker.setStrokeStyle(active ? 2 : 1, discovered ? 0x98b5a3 : 0xf5dfb6, active ? .9 : discovered ? .12 : .3);
    });
    if (!paused && Phaser.Input.Keyboard.JustDown(this.interactKey)) this.interact();
  }
}

