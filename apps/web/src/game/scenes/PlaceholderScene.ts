import Phaser from 'phaser';
export class PlaceholderScene extends Phaser.Scene {
  constructor(key: string, private title: string) { super(key); }
  create() {
    this.cameras.main.setBackgroundColor('#101719');
    this.add.text(480, 240, this.title + '\nCena reservada — conteúdo em produção', { fontSize: '24px', color: '#eee9df', align: 'center' }).setOrigin(0.5);
  }
}
