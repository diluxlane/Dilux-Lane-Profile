import assert from 'node:assert/strict';
import test from 'node:test';
import { createContentTransition } from '../src/content-transition.js';

function node(id = 'content') {
  const attributes = new Map([['id', id]]);
  const element = {
    style: {}, attributes, elements: [], effects: [],
    setAttribute(key, value) { attributes.set(key, value); },
    removeAttribute(key) { attributes.delete(key); },
    getBoundingClientRect() { return { left: 20, top: 100, width: 320 }; },
    querySelectorAll(selector) {
      if (selector === '[id]') return element.elements.filter(child => child.attributes.has('id'));
      if (selector === 'iframe,audio,video') return element.elements.filter(child => child.media);
      return element.elements.filter(child => child.focusable);
    },
    replaceWith(next) {
      element.parent.nodes.splice(element.parent.nodes.indexOf(element), 1, next);
      next.parent = element.parent;
      element.parent = null;
    },
    remove() {
      element.removed = true;
      if (element.parent) element.parent.nodes.splice(element.parent.nodes.indexOf(element), 1);
      element.parent = null;
    },
    animate(keyframes, options) {
      let resolve;
      const finished = new Promise(done => { resolve = done; });
      const animation = { finished, resolve, keyframes, options, cancelled: false, cancel() { this.cancelled = true; } };
      element.effects.push(animation);
      return animation;
    },
  };
  return element;
}

function panelWith(first) {
  const panel = {
    nodes: [first], style: {},
    append(element) { this.nodes.push(element); element.parent = this; },
    getBoundingClientRect() { return { left: 20, top: 50, height: 230 }; },
  };
  first.parent = panel;
  return panel;
}

test('paused or reduced motion replaces synchronously without two panels or effects', () => {
  const first = node();
  const panel = panelWith(first);
  const next = node();
  createContentTransition(panel).replace(first, next, false);
  assert.deepEqual(panel.nodes, [next]);
  assert.equal(next.effects.length, 0);
});

test('crossfade leaves only incoming content interactive and removes outgoing IDs', () => {
  const first = node();
  const link = node('old-link');
  link.focusable = true;
  const media = node('player-frame');
  media.media = true;
  first.elements.push(link, media);
  const panel = panelWith(first);
  const next = node();
  const transitions = createContentTransition(panel);
  transitions.replace(first, next, true);
  assert.equal(first.inert, true);
  assert.equal(panel.style.minHeight, '230px');
  assert.equal(media.removed, true, 'outgoing embedded players are disposed immediately');
  assert.equal(first.effects[0].options.fill, 'forwards', 'outgoing stays invisible until the longer incoming fade finishes');
  assert.equal(first.attributes.get('aria-hidden'), 'true');
  assert.equal(first.attributes.has('id'), false);
  assert.equal(link.attributes.has('id'), false);
  assert.equal(link.attributes.get('tabindex'), '-1');
  assert.equal(next.attributes.get('id'), 'content');
  transitions.finish();
  assert.deepEqual(panel.nodes, [next]);
  assert.equal(panel.style.minHeight, '');
  assert.ok(next.effects[0].cancelled);
});

test('interrupted completions cannot remove a newer incoming or outgoing panel', async () => {
  const first = node();
  const panel = panelWith(first);
  const transitions = createContentTransition(panel);
  const second = node();
  transitions.replace(first, second, true);
  const stale = [...first.effects, ...second.effects];
  const third = node();
  transitions.replace(second, third, true);
  for (const animation of stale) animation.resolve();
  await new Promise(setImmediate);
  assert.deepEqual(panel.nodes, [third]);
  assert.equal(third.effects.length, 0, 'rapid retarget commits directly instead of replaying a partial fade');
  assert.ok(stale.every(effect => effect.cancelled));
  transitions.finish();
  await new Promise(setImmediate);
  assert.deepEqual(panel.nodes, [third]);
});
