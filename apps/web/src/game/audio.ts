
class GameAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private ambience?: GainNode;
  private lastStep = 0;
  private volume = 0.35;
  unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(this.context.destination);
        const buffer = this.context.createBuffer(
          1,
          this.context.sampleRate * 4,
          this.context.sampleRate,
        );
        const samples = buffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++)
          samples[i] = Math.random() * 2 - 1;
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = this.context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 380;
        this.ambience = this.context.createGain();
        this.ambience.gain.value = 0;
        source.connect(filter).connect(this.ambience).connect(this.master);
        source.start();
      }
      void this.context.resume().catch(() => {});
    } catch {
      /* Silent play remains available. */
    }
  }
  setVolume(volume: number) {
    this.volume = volume;
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(volume, this.context.currentTime, 0.1);
  }
  setActive(active: boolean, scene: string) {
    if (this.context && this.ambience)
      this.ambience.gain.setTargetAtTime(
        active
          ? scene.includes("06") || scene.includes("07")
            ? 0.055
            : 0.025
          : 0,
        this.context.currentTime,
        0.3,
      );
  }
  private tone(
    frequency: number,
    delay: number,
    duration: number,
    volume: number,
  ) {
    const context = this.context;
    if (!context || !this.master || context.state !== "running") return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const time = context.currentTime + delay;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(time);
    oscillator.stop(time + duration);
  }
  cue(kind: "clue" | "memory" | "open") {
    if (kind === "memory")
      [220, 277.18, 329.63, 440].forEach((frequency, i) =>
        this.tone(frequency, i * 0.22, 1.4, 0.07),
      );
    else if (kind === "clue")
      [523.25, 659.25].forEach((frequency, i) =>
        this.tone(frequency, i * 0.13, 0.55, 0.055),
      );
    else this.tone(240, 0, 0.16, 0.025);
  }
  step(scene: string, speed: number) {
    const now = performance.now();
    if (now - this.lastStep < (420 * 180) / speed) return;
    this.lastStep = now;
    this.tone(scene === "cenario-08" ? 75 : 105, 0, 0.09, 0.07);
    this.tone(190, 0.015, 0.06, 0.018);
  }
}
export const gameAudio = new GameAudio();
