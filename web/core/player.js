// Plays back a recorded list of steps. Knows nothing about arrays or rendering,
// so every topic can reuse it.
export class Player {
  #steps = [];
  #index = 0;
  #timer = null;
  #speed = 1;
  #onChange;

  constructor(onChange) {
    this.#onChange = onChange;
  }

  get steps() { return this.#steps; }
  get index() { return this.#index; }
  get current() { return this.#steps[this.#index]; }
  get playing() { return this.#timer !== null; }
  get atStart() { return this.#index === 0; }
  get atEnd() { return this.#index >= this.#steps.length - 1; }

  load(steps) {
    this.#stop();
    this.#steps = steps;
    this.#index = 0;
    this.#emit();
  }

  setSpeed(multiplier) {
    this.#speed = multiplier;
  }

  play() {
    if (this.playing || this.#steps.length === 0) return;
    if (this.atEnd) this.#index = 0;
    this.#schedule();
    this.#emit();
  }

  pause() {
    this.#stop();
    this.#emit();
  }

  toggle() {
    this.playing ? this.pause() : this.play();
  }

  next() {
    this.#stop();
    if (!this.atEnd) this.#index++;
    this.#emit();
  }

  prev() {
    this.#stop();
    if (!this.atStart) this.#index--;
    this.#emit();
  }

  reset() {
    this.#stop();
    this.#index = 0;
    this.#emit();
  }

  seek(i) {
    this.#stop();
    this.#index = Math.max(0, Math.min(i, this.#steps.length - 1));
    this.#emit();
  }

  // The current step stays on screen for one full interval before advancing.
  #schedule() {
    this.#timer = setTimeout(() => this.#tick(), 1000 / this.#speed);
  }

  #tick() {
    this.#timer = null;
    this.#index++;
    if (!this.atEnd) this.#schedule();
    this.#emit();
  }

  #stop() {
    clearTimeout(this.#timer);
    this.#timer = null;
  }

  #emit() {
    this.#onChange(this);
  }
}
