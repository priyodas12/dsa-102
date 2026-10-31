// Generic page for one topic: controls, animated stage, caption, transport, code and lesson text.
// A topic only supplies a config:
//   defaultState()            fresh starting state
//   idle(state)               { rows, size } shown before anything runs
//   idleCaption               text shown while idle
//   meta(step)                extra text for the status line (optional)
//   fields                    [{ name, type: 'number'|'text', value }]
//   ops                       { key: { label, fields: [names], run(state, args) -> { steps, final }, program, info } }
//   initialOp, programs, lesson
// Returns a dispose function that stops any running animation.
import { Player } from './player.js';
import { el, renderRows, renderCode } from './dom.js';

export function mountTopic(root, cfg) {
  let state = cfg.defaultState();
  let op = cfg.initialOp;

  root.replaceChildren();
  const controls = el('form', 'controls');
  const stage = el('div', 'stage');
  const meta = el('div', 'meta');
  const caption = el('p', 'caption');
  caption.setAttribute('role', 'status');
  const transport = el('div', 'transport');
  const code = el('div', 'code');
  const complexity = el('div', 'complexity');
  const notes = el('div', 'notes');
  const error = el('p', 'error');

  // --- controls -----------------------------------------------------------
  const opSelect = el('select');
  for (const [key, def] of Object.entries(cfg.ops)) {
    const o = el('option', '', def.label);
    o.value = key;
    if (key === op) o.selected = true;
    opSelect.append(o);
  }
  const opLabel = el('label', 'field');
  opLabel.append(el('span', '', 'operation'), opSelect);

  const fields = {};
  for (const def of cfg.fields) {
    const wrap = el('label', 'field');
    const input = el('input');
    input.type = def.type;
    input.name = def.name;
    input.value = def.value;
    if (def.type === 'text') input.classList.add(def.narrow ? 'narrow' : 'wide');
    wrap.append(el('span', '', def.name), input);
    fields[def.name] = { def, wrap, input };
  }
  const run = el('button', 'primary', 'Run');
  run.type = 'submit';
  const restore = el('button', '', 'Reset');
  restore.type = 'button';
  controls.append(opLabel, ...Object.values(fields).map((f) => f.wrap), run, restore);

  const syncInputs = () => {
    for (const [name, f] of Object.entries(fields)) f.wrap.hidden = !cfg.ops[op].fields.includes(name);
  };

  // --- player -------------------------------------------------------------
  const button = (text, label, onClick) => {
    const b = el('button', '', text);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.addEventListener('click', onClick);
    return b;
  };
  const range = (label, min, max, step, value) => {
    const input = el('input');
    input.type = 'range';
    Object.assign(input, { min, max, step, value });
    input.setAttribute('aria-label', label);
    return input;
  };
  const progress = range('Step', 0, 0, 1, 0);
  progress.addEventListener('input', () => player.seek(Number(progress.value)));
  const speed = range('Speed', 0.25, 4, 0.25, 1);
  speed.addEventListener('input', () => player.setSpeed(Number(speed.value)));
  const speedLabel = el('label', 'speed');
  speedLabel.append(el('span', '', 'speed'), speed);

  const playBtn = button('▶ Play', 'Play or pause', () => player.toggle());
  const backBtn = button('◀ Back', 'Step back', () => player.prev());
  const nextBtn = button('Next ▶', 'Step forward', () => player.next());
  const resetBtn = button('⟲ Restart', 'Restart', () => player.reset());
  transport.append(resetBtn, backBtn, playBtn, nextBtn, speedLabel, progress);

  let program = cfg.programs[cfg.ops[op].program];
  const player = new Player((p) => {
    const step = p.current;
    if (!step) return;
    renderRows(stage, step);
    renderCode(code, program, step.line);
    caption.textContent = step.caption;
    const extra = cfg.meta?.(step);
    meta.textContent = `step ${p.index + 1} of ${p.steps.length}${extra ? ` · ${extra}` : ''}`;
    playBtn.textContent = p.playing ? '⏸ Pause' : '▶ Play';
    backBtn.disabled = p.atStart;
    nextBtn.disabled = p.atEnd;
    progress.max = p.steps.length - 1;
    progress.value = p.index;
  });

  function renderOpInfo() {
    const info = cfg.lesson.operations[cfg.ops[op].info];
    complexity.replaceChildren(
      el('h3', '', info.name),
      el('p', '', `Time ${info.time} · Space ${info.space}`),
      el('p', 'muted', info.note),
    );
  }

  const showIdle = () => {
    program = cfg.programs[cfg.ops[op].program];
    player.load([{ ...cfg.idle(state), line: -1, caption: cfg.idleCaption }]);
    renderOpInfo();
  };

  opSelect.addEventListener('change', () => {
    op = opSelect.value;
    syncInputs();
    error.textContent = '';
    showIdle();
  });
  restore.addEventListener('click', () => {
    state = cfg.defaultState();
    error.textContent = '';
    showIdle();
  });
  controls.addEventListener('submit', (e) => {
    e.preventDefault();
    const args = {};
    for (const [name, f] of Object.entries(fields)) {
      args[name] = f.def.type === 'number' ? Number(f.input.value) : f.input.value;
    }
    try {
      const { steps, final } = cfg.ops[op].run(state, args);
      error.textContent = '';
      program = cfg.programs[cfg.ops[op].program];
      state = final;
      player.load(steps);
      renderOpInfo();
      player.play();
    } catch (err) {
      error.textContent = err.message;
    }
  });

  // --- lesson text --------------------------------------------------------
  const section = (title, body) => {
    const s = el('section');
    s.append(el('h3', '', title), body);
    return s;
  };
  const list = (items) => {
    const ul = el('ul');
    items.forEach((t) => ul.append(el('li', '', t)));
    return ul;
  };
  const { lesson } = cfg;
  notes.append(
    section(`Why ${lesson.title.toLowerCase()}s exist`, el('p', '', lesson.why)),
    section('How it works', list(lesson.how)),
    section('Trade-offs', list(lesson.tradeoffs)),
    section('Common pitfalls', list(lesson.pitfalls)),
  );

  // --- keyboard -----------------------------------------------------------
  root.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT'].includes(e.target.tagName) && e.target.type !== 'range') return;
    if (e.key === 'ArrowRight') player.next();
    else if (e.key === 'ArrowLeft') player.prev();
    else if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); player.toggle(); }
  });

  const side = el('div', 'side');
  side.append(complexity, el('h3', '', 'Java'), code);
  const main = el('div', 'main');
  main.append(controls, error, stage, caption, meta, transport);
  const layout = el('div', 'layout');
  layout.append(main, side);
  root.append(layout, notes);

  syncInputs();
  showIdle();
  return () => player.pause();
}
