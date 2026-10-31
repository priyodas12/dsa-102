import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Player } from './player.js';

const steps = [1, 2, 3].map((n) => ({ n }));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('autoplay shows every step in order and reports playing state', async () => {
  const seen = [];
  const p = new Player((pl) => seen.push([pl.index, pl.playing]));
  p.setSpeed(20);
  p.load(steps);
  p.play();
  await wait(300);
  assert.deepEqual(seen.map(([i]) => i), [0, 0, 1, 2]);
  assert.deepEqual(seen.slice(1, 3).map(([, playing]) => playing), [true, true]);
  assert.equal(p.playing, false);
});

test('pause stops advancing; next and prev clamp', async () => {
  const p = new Player(() => {});
  p.setSpeed(20);
  p.load(steps);
  p.play();
  p.pause();
  await wait(150);
  assert.equal(p.index, 0);
  p.prev();
  assert.equal(p.index, 0);
  p.next(); p.next(); p.next();
  assert.equal(p.index, 2);
});
