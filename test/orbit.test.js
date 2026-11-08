import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { destinations, profile } from '../src/profile.js';
import { angleDelta, angularPosition, curveStroke, decorationProgress, offset, orbitGeometry, orbitPoint, pointerAngle, pointOnCurve, settleProgress, snapRotation, swipeStep, wrap } from '../src/orbit.js';

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


test('ellipse projection maps approved adjacent icon positions to one angular step', () => {
  for (const width of [320,360,390,430,768,900,1024,1280,1440,1920]) {
    const desktop = width >= 900;
    const height = desktop ? 740 : 110;
    const geometry = orbitGeometry(width, height, desktop);
    const origin = pointerAngle(orbitPoint(0, width, height, desktop), geometry);
    const neighbor = pointerAngle(orbitPoint(1, width, height, desktop), geometry);
    const candidate = angularPosition(0, angleDelta(origin, neighbor), geometry);
    assert.ok(Math.abs(candidate + 1) < 1e-9);
    assert.equal(pointerAngle({ x: geometry.cx, y: geometry.cy }, geometry), null);
  }
});

test('angle unwrapping follows the short continuous turn across both pi seams', () => {
  assert.ok(Math.abs(angleDelta(Math.PI - .02, -Math.PI + .03) - .05) < 1e-9);
  assert.ok(Math.abs(angleDelta(-Math.PI + .02, Math.PI - .03) + .05) < 1e-9);
  assert.equal(angleDelta(null, 1), 0);
  assert.equal(angleDelta(1, null), 0);
  const geometry = orbitGeometry(390, 110, false);
  let angle = 2.9;
  let travel = 0;
  for (const change of [.2, .3, -.3, -.2]) {
    const next = Math.atan2(Math.sin(angle + change), Math.cos(angle + change));
    travel += angleDelta(angle, next);
    angle = next;
  }
  assert.ok(Math.abs(angularPosition(3, travel, geometry) - 3) < 1e-9);
});

test('drag thresholds, nearest snapping, and multiple turns preserve unbounded rotation', () => {
  assert.equal(snapRotation(1.1, 0, 12), 0);
  assert.equal(snapRotation(.49, 0, 40), 0);
  assert.equal(snapRotation(.51, 0, 40), 1);
  assert.equal(snapRotation(3.6, 0, 170), 4);
  assert.equal(snapRotation(-1.4, 0, 90), -1);
  assert.equal(wrap(snapRotation(5.3, 4, 90), 5), 0);
  assert.equal(wrap(snapRotation(-.8, 0, 90), 5), 4);
});

test('settling is monotone, bounded and finishes exactly without an overshoot', () => {
  assert.equal(settleProgress(0), 0);
  assert.equal(settleProgress(1), 1);
  let previous = 0;
  for (let i = 1; i <= 100; i++) {
    const progress = settleProgress(i / 100);
    assert.ok(progress >= previous && progress <= 1);
    previous = progress;
  }
});

test('gold and dot progress share rotation with no first-state disappearance or seam drift', () => {
  for (const length of [300,511,900]) {
    const initial = decorationProgress(0,5,length);
    assert.equal(initial.center,length/2);
    assert.ok(initial.spacing >= 17 && initial.spacing <= 19);
    for (const position of [-5,-.01,0,.01,1,2,3,4,4.99,5,5.01]) {
      const state = decorationProgress(position,5,length);
      assert.ok(state.center >= 0 && state.center < length);
      assert.equal(state.intervals,initial.intervals);
      const repeated = decorationProgress(position + 5,5,length);
      const difference = Math.abs(state.center - repeated.center);
      assert.ok(Math.min(difference, length - difference) < 1e-8);
    }
    assert.equal(decorationProgress(5,5,length).center,initial.center);
    assert.equal(decorationProgress(5,5,length).offset,-length);
  }
});

test('screen-distance interpolation keeps dot spacing uniform and splits the stroke at offscreen endpoints', () => {
  const points = [{x:0,y:0,distance:0},{x:25,y:0,distance:50},{x:50,y:0,distance:100}];
  assert.deepEqual(pointOnCurve(points,30),{x:15,y:0});
  assert.deepEqual(pointOnCurve(points,100),{x:50,y:0});
  assert.equal((curveStroke(points,50,20).match(/M/g)||[]).length,1);
  assert.equal((curveStroke(points,2,20).match(/M/g)||[]).length,2);
});

test('all three original rails and the two separate decorative source curves remain intact', () => {
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('M-24 0 Q195 193 414 0 M-24 12 Q195 205 414 12 M-24 24 Q195 217 414 24'));
  assert.ok(html.includes('M0 14 C360 20 540 230 540 488 C540 670 445 801 294 880 M0 25 C350 26 531 236 531 488 C531 664 440 794 285 880 M0 36 C340 33 522 242 522 488 C522 658 435 787 276 880'));
  assert.ok(html.includes('class="orbit-beads" d="M-24 39 Q195 240 414 39"'));
  assert.ok(html.includes('class="glint-track" d="M-24 48 Q195 250 414 48"'));
  assert.ok(html.includes('class="orbit-beads" d="M-5 54'));
  assert.ok(html.includes('class="glint-track" d="M-8 66'));
});

test('normalized atan2 covers all quadrants without depending on ellipse aspect ratio', () => {
  for (const desktop of [false,true]) {
    const g=orbitGeometry(390,740,desktop);
    assert.equal(pointerAngle({x:g.cx+g.rx,y:g.cy},g),0);
    assert.equal(pointerAngle({x:g.cx,y:g.cy+g.ry},g),Math.PI/2);
    assert.equal(pointerAngle({x:g.cx-g.rx,y:g.cy},g),Math.PI);
    assert.equal(pointerAngle({x:g.cx,y:g.cy-g.ry},g),-Math.PI/2);
  }
});
