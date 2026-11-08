import assert from 'node:assert/strict';
import test from 'node:test';
import { destinations, profile } from '../src/profile.js';
import { offset, orbitPoint, orbitRailState, swipeStep, wrap } from '../src/orbit.js';

test('all five destinations rotate in the requested order and wrap in both directions', () => {
  assert.deepEqual(destinations.map(({ id }) => id), ['links', 'socials', 'about', 'playlist', 'contact']);
  assert.equal(wrap(-1, 5), 4);
  assert.equal(wrap(5, 5), 0);
  for (let selected = -5; selected <= 10; selected++) {
    const slots = destinations.map((_, index) => offset(index, selected, 5));
    assert.deepEqual(slots.toSorted((a, b) => a - b), [-2, -1, 0, 1, 2]);
    assert.equal(slots[wrap(selected, 5)], 0);
  }
});

test('navigation positions stay inside the orbit at target widths', () => {
  for (const width of [320, 390, 768, 1280, 1440]) {
    const desktop = width >= 900;
    const height = desktop ? 740 : 110;
    const points = [-2, -1, 0, 1, 2].map(slot => orbitPoint(slot, width, height, desktop));
    assert.ok(points.every(({ x, y }) => x > 0 && x < width && y > 0 && y < height));
    if (desktop) assert.ok(points.every(({ y }, i) => !i || y > points[i - 1].y));
    else assert.ok(points.every(({ x }, i) => !i || x > points[i - 1].x));
  }
});

test('swipe requires horizontal intent and a minimum distance', () => {
  assert.equal(swipeStep(-55, 6), 1);
  assert.equal(swipeStep(55, 6), -1);
  assert.equal(swipeStep(-55, 65), 0);
  assert.equal(swipeStep(15, 0), 0);
});

test('published links and approved personal media match site configuration', () => {
  assert.deepEqual(profile.portfolios.map(({ url }) => url), [
    'https://dilux-lane-portfolio.vercel.app',
    'https://dilux-lane-dev-portfolio.vercel.app',
  ]);
  assert.deepEqual(profile.socials.map(({ title }) => title), ['Instagram', 'GitHub']);
  assert.equal(profile.portrait, '/assets/portrait.webp');
  assert.equal(profile.playlist.url, 'https://open.spotify.com/playlist/3BLoPATQ9Bk8ZSblfBD8RS');
  assert.equal(profile.playlist.embedUrl, 'https://open.spotify.com/embed/playlist/3BLoPATQ9Bk8ZSblfBD8RS');
  assert.equal(profile.audioUrl, '/assets/cathedral-in-the-forest.ogg');
  assert.equal(profile.audioMp3Url, '/assets/cathedral-in-the-forest.mp3');
});

test('gold orbit highlight follows rotation instead of being fixed at the center', () => {
  const states = [0, 1, 2, 3, 4].map(index => orbitRailState(index, 5, 500, 74));
  assert.ok(states.every(Boolean));
  assert.ok(states.every(s => s.dashLength === 74));
  for (let i = 1; i < states.length; i++) {
    assert.ok(states[i].dashOffset < states[i - 1].dashOffset);
    assert.ok(states[i].dotsOffset < states[i - 1].dotsOffset);
  }
  assert.deepEqual(orbitRailState(1, 5, 500), orbitRailState(1, 5, 500));
  assert.ok(orbitRailState(1.5, 5, 500).dashOffset < orbitRailState(1, 5, 500).dashOffset);
  assert.equal(orbitRailState(0, 5, 0), null);
  assert.equal(orbitRailState(Number.NaN, 5, 500), null);
});
