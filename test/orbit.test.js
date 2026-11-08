import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
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

test('decorative sweep and dots follow the selected orbit without independent motion', () => {
  const at = (position) => orbitRailState(position, 5, 500, 114);
  const phases = [0, 1, 2, 3, 4].map(at);
  assert.ok(phases.every(Boolean));
  assert.ok(phases.every(state => state.dashLength === 114));
  // About → Playlist → Contact moves the short sweep toward the left.
  assert.ok(at(2).dashOffset < at(3).dashOffset);
  assert.ok(at(3).dashOffset < at(4).dashOffset);
  assert.ok(at(2.5).dashOffset > at(2).dashOffset);
  assert.ok(at(2.5).dashOffset < at(3).dashOffset);
  assert.ok(at(1).dotsOffset < at(0).dotsOffset);
  assert.ok(at(2).dotsOffset < at(1).dotsOffset);
  assert.equal(at(0).highlightOpacity, 0);
  assert.equal(at(3).highlightOpacity, 1);
  assert.deepEqual(at(3), at(3)); // Nothing moves while position is unchanged.
  assert.equal(orbitRailState(0, 5, 0), null);
  assert.equal(orbitRailState(Number.NaN, 5, 500), null);
});

test('dot and sweep paths are separate from the three main navigation rails', () => {
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  const mobile = html.match(/<svg class="rails mobile-rails"[\\s\\S]*?<\\/svg>/)?.[0] ?? '';
  const desktop = html.match(/<svg class="rails desktop-rails"[\\s\\S]*?<\\/svg>/)?.[0] ?? '';
  assert.ok(mobile.includes('M-24 24 Q195 217 414 24')); // Main rails untouched.
  assert.ok(mobile.includes('class="orbit-beads" d="M-24 39 Q195 240 414 39"'));
  assert.ok(mobile.includes('class="glint" d="M-24 48 Q195 250 414 48"'));
  // Vertical distances along the same quadratic parameter are always positive.
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const y = (start, control) => start * ((1 - t) ** 2 + t ** 2) + 2 * (1 - t) * t * control;
    const main = y(24, 217);
    const dots = y(39, 240);
    const sweep = y(48, 250);
    assert.ok(dots > main + 14);
    assert.ok(sweep > dots + 8);
  }
  assert.ok(desktop.includes('class="orbit-beads" d="M-5 54'));
  assert.ok(desktop.includes('class="glint" d="M-8 66'));
  assert.ok(css.includes('stroke-dasharray:.8 18'));
  assert.ok(!css.includes('animation:glimmer'));
});

