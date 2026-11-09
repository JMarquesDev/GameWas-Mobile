import Phaser from 'phaser';
import { backgrounds, sceneSize } from '../backgrounds';
import { preloadOliver } from '../entities/Oliver';
import { Exploration } from '../systems/Exploration';
import { usePreferences } from '../preferences';
import { addForeground } from '../systems/foreground';
import { phaseObjectives } from '@was/game-content';
import { useGameStore } from '../store';
import { gameAudio } from '../audio';
import type { Point } from '../systems/navigation';

class BackgroundScene extends Phaser.Scene {
  private exploration!: Exploration;
  private prompt!: Phaser.GameObjects.Text;
  private markers: Phaser.GameObjects.Arc[] = [];
  private shownContexts = new Set<string>();
  private interactKey!: Phaser.Input.Keyboard.Key;
  private objective: (typeof phaseObjectives)[number] | undefined;
  constructor(key: string, private file: string) { super(key); }
  preload() { this.load.image(this.sys.settings.key, `/assets/backgrounds/${this.file}`); preloadOliver(this); }
  create() {
    const key = this.sys.settings.key;
    this.cameras.main.setBackgroundColor('#101719');
    const height = sceneSize(key).height;
    if (key === 'infancia-corredor') {
      const texture = this.textures.get(key);
      const source = texture.getSourceImage();
      for (let i = 0; i < 3; i++) {
        const top = Math.round(source.height * i / 3);
        const bottom = Math.round(source.height * (i + 1) / 3);
        const frame = 'trecho-' + i;
        if (!texture.has(frame)) texture.add(frame, 0, 0, top, source.width, bottom - top);
        this.add.image(i * 960, 0, key, frame).setOrigin(0).setDisplaySize(960, height).setDepth(-1);
      }
    } else {
      this.add.image(480, height / 2, key).setDisplaySize(960, height).setDepth(-1);
    }
    addForeground(this, key, key);
    this.exploration = new Exploration(this, key);
    this.objective = phaseObjectives.find(item => item.scene === key);
    this.shownContexts.clear();
    this.markers = this.objective?.clues.filter(clue => clue.presentation !== 'context').map(clue => {
      const marker = this.add.circle(clue.x, clue.y * height / 540, 13, 0xcbb78d, .09).setStrokeStyle(1, 0xf5dfb6, .45).setDepth(1001).setInteractive({ useHandCursor: true });
      marker.on('pointerdown', () => this.interact(clue.id));
      return marker;
    }) ?? [];
    this.prompt = this.add.text(0, 0, '', { fontSize: '12px', color: '#fff4dd', backgroundColor: '#191c1be8', padding: { x: 9, y: 6 } }).setOrigin(.5, 1).setDepth(2000).setResolution(2);
    this.interactKey = this.input.keyboard!.addKey('E');
    if (!usePreferences.getState().reducedMotion) this.cameras.main.fadeIn(650, 16, 23, 25);
    this.game.events.emit('was:scene-ready');
  }
  update(_time: number, delta: number) {
    const paused = document.hidden || !!document.querySelector('dialog[open]') || useGameStore.getState().paused;
    this.exploration.update(delta, paused);
    if (!this.objective) return;
    const foot = this.exploration.position;
    const state = useGameStore.getState();
    if (!paused && !state.notice) {
      const context = this.objective.clues.filter(clue => clue.presentation === 'context' && !this.shownContexts.has(clue.id)).map(clue => {
        const point = clue.approach ?? clue;
        return { clue, distance: Math.hypot(point.x - foot.x, point.y - foot.y) };
      }).filter(item => item.distance < 92).sort((a, b) => a.distance - b.distance)[0]?.clue;
      if (context) {
        this.shownContexts.add(context.id);
        if (!state.progress.phaseClues[this.sys.settings.key]?.includes(context.id)) state.collectPhaseClue(this.sys.settings.key, context.id);
        state.notify(`${context.title}: ${context.text}`);
      }
    }
    const interactiveClues = this.objective.clues.filter(clue => clue.presentation !== 'context');
    const nearest = interactiveClues.map(clue => { const point = clue.approach ?? clue; return { clue, distance: Math.hypot(point.x - foot.x, point.y - foot.y) }; }).filter(item => item.distance < 92).sort((a, b) => a.distance - b.distance)[0]?.clue;
    this.prompt.setVisible(!paused && !!nearest);
    if (nearest) {
      const action = useGameStore.getState().progress.phaseClues[this.sys.settings.key]?.includes(nearest.id) ? 'Rever' : 'Investigar';
      const instruction = window.matchMedia('(pointer: coarse)').matches ? `Toque para ${action.toLowerCase()}` : `${action} · E`;
      this.prompt.setPosition(nearest.x, nearest.y * sceneSize(this.sys.settings.key).height / 540 - 22).setText(`${instruction}: ${nearest.title}`);
    }
    interactiveClues.forEach((clue, index) => {
      const found = useGameStore.getState().progress.phaseClues[this.sys.settings.key]?.includes(clue.id) ?? false;
      const active = nearest?.id === clue.id && !paused;
      this.markers[index]?.setFillStyle(found ? 0x98b5a3 : 0xcbb78d, active ? .3 : found ? .04 : .09).setStrokeStyle(active ? 2 : 1, found ? 0x98b5a3 : 0xf5dfb6, active ? .9 : found ? .25 : .45);
    });
    if (!paused && Phaser.Input.Keyboard.JustDown(this.interactKey)) this.interact();
  }
  private interact(id?: string) {
    const key = this.sys.settings.key;
    const objective = this.objective;
    if (!objective || useGameStore.getState().paused || document.querySelector('dialog[open]')) return;
    const clues = objective.clues.filter(clue => clue.presentation !== 'context');
    if (!clues.length) return;
    const position: Point = this.exploration.position;
    const target = id ? clues.find(clue => clue.id === id) : clues.map(clue => { const point = clue.approach ?? clue; return { clue, distance: Math.hypot(point.x - position.x, point.y - position.y) }; }).sort((a, b) => a.distance - b.distance)[0]?.clue;
    const approach = target?.approach ?? target;
    if (!target || !approach || Math.hypot(approach.x - position.x, approach.y - position.y) > 100) { useGameStore.getState().notify('Aproxime-se de um detalhe para investigar.'); return; }
    if (target.id === 'prova-anatomia' && useGameStore.getState().progress.choices['school-phone'] !== 'unlocked') { useGameStore.getState().notify('As mensagens do celular indicam o armário de Zoe.'); return; }
    if (target.id === 'celular-antigo') window.dispatchEvent(new Event('was:school-phone'));
    if (!useGameStore.getState().progress.phaseClues[key]?.includes(target.id)) { useGameStore.getState().collectPhaseClue(key, target.id); useGameStore.getState().notify(`${target.title}: ${target.text}`); gameAudio.cue('clue'); }
    else useGameStore.getState().notify(target.text);
  }
}
export class CorredorInfanciaScene extends BackgroundScene { constructor() { super('infancia-corredor', 'corredor-tres-trechos.png'); } }
export class SalaInfanciaScene extends BackgroundScene { constructor() { super('infancia-sala', 'infancia-sala-aula-v2.png'); } }
export class LaboratorioAulaScene extends BackgroundScene { constructor() { super('cenario-02', 'cena-02-laboratorio-aula-v2.png'); } }
export class LaboratorioFaculdadeScene extends BackgroundScene { constructor() { super('faculdade-laboratorio', 'cena-03-laboratorio-faculdade-v1.png'); } }
export class SalaEstarScene extends BackgroundScene { constructor() { super('cenario-03', 'cena-03-sala-estar-v2.png'); } }
export class ParedeQuadrosScene extends BackgroundScene { constructor() { super('cenario-04', 'cena-04-parede-quadros-v2.png'); } }
export class CozinhaScene extends BackgroundScene { constructor() { super('cenario-05', 'cena-05-cozinha-v3.jpg'); } }
export class LaboratorioPaiScene extends BackgroundScene { constructor() { super('cenario-06', 'cena-06-laboratorio-pai-v3.jpg'); } }
export class HospitalBackgroundScene extends BackgroundScene { constructor() { super('cenario-07', 'cena-07-hospital-v2.png'); } }
export class CampoBackgroundScene extends BackgroundScene { constructor() { super('cenario-08', 'cena-08-campo-v2.png'); } }
export const backgroundScenes = [CorredorInfanciaScene, SalaInfanciaScene, LaboratorioAulaScene, LaboratorioFaculdadeScene, SalaEstarScene, ParedeQuadrosScene, CozinhaScene, LaboratorioPaiScene, HospitalBackgroundScene, CampoBackgroundScene];
