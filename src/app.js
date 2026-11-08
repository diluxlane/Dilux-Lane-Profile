import { destinations, profile } from './profile.js';
import { icon } from './icons.js';
import {
  angleDelta, angularPosition, offset, orbitGeometry, orbitPoint, pointerAngle,
  settleProgress, snapRotation, swipeStep, wrap,
} from './orbit.js';
import { createOrbitDecoration } from './orbit-decoration.js';
import { createContentTransition } from './content-transition.js';
import { setupSiteSound } from './sound.js';
import { spotifyFrameGeometry } from './spotify-layout.js';

const $ = (selector) => document.querySelector(selector);
const desktop = matchMedia('(min-width: 900px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const orbit = $('.orbit');
const panel = $('#panel');
const count = destinations.length;
let content = $('#content');
let target = 0;
let position = 0;
let frame = 0;
let drag = null;
let paused = false;
let toastTimer;
let suppressClick = false;
let playNavigationSound = () => {};
let spotifyResizeObserver = null;
const contentTransition = createContentTransition(panel);
let dimensions;
let geometry;
const decorations = new Map([...orbit.querySelectorAll('.rails')].map(svg => [
  svg, createOrbitDecoration(svg, count),
]));
let decoration;

function row(entry) {
  return `<a class="row" href="${entry.url}">${icon(entry.icon)}
    <span><strong>${entry.title}</strong><small>${entry.detail}</small></span>${icon('arrow')}</a>`;
}

function group(title, entries) {
  return `<section class="row-group"><h3>${title}</h3><div class="row-list">${entries.filter(entry => entry.url).map(row).join('')}</div></section>`;
}

const renderBody = {
  links() {
    const creative = profile.portfolios[0];
    return `<a class="feature" href="${creative.url}">
      <div class="feature-art">${icon('film')}</div>
      <div class="feature-copy"><p class="eyebrow">Featured destination · Creative work</p>
      <h3>Stories through a lens</h3><p>Explore my filmmaking, editing and visual work.</p>
      <span class="feature-action">Explore Creative Portfolio ${icon('arrow')}</span></div>
    </a>${group('My creative world', profile.portfolios)}${group('Find me elsewhere', profile.elsewhere)}`;
  },
  socials: () => group('Find me around the internet', profile.socials),
  about: () => `<div class="creator">
    ${profile.portrait ? `<img class="portrait" alt="Dilux Lane" src="${profile.portrait}">` : '<span class="portrait" aria-hidden="true">d.</span>'}
    <div><p class="eyebrow">The creator</p><h3>Hey, I’m Dilux.</h3><p>Student developer · Founder of Zyberlane</p></div>
  </div>
  <p class="statement">I build for the web and tell stories <b>through a lens.</b></p>
  <p class="bio">I’m a student developer from Sri Lanka. I build web projects with AI assistance and enjoy filmmaking, editing, and visual storytelling. I’m learning about AI-assisted software development, systems engineering, and automation.</p>`,
  playlist: () => `<div class="playlist-art">${icon('headphones')}<h3>In my own world</h3><p class="eyebrow">Dilux Lane’s playlist</p></div>
    <button class="gold-button" id="load-playlist" ${profile.playlist.url ? '' : 'disabled'}>${icon('note')}
    ${profile.playlist.url ? 'Load playlist' : 'Playlist unavailable'} ${icon('right')}</button>
    <div id="player"></div>
    ${profile.playlist.url ? row({ icon: 'headphones', title: 'Open playlist', detail: 'Take the playlist with you', url: profile.playlist.url }) : '<p class="availability">I haven’t shared a public playlist yet.</p>'}`,
  contact: () => `${group('Have something in mind?', profile.contact)}
    <div class="contact-note"><h3>A little note before you say hello</h3><p>Tell me what you have in mind. If it’s about a project, a short description and any references will help me understand the idea.</p></div>`,
};

const buttons = destinations.map((destination, index) => {
  const button = document.createElement('button');
  button.className = 'orbit-button';
  button.id = `tab-${destination.id}`;
  button.type = 'button';
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-controls', 'panel');
  button.innerHTML = `<span class="circle">${icon(destination.icon)}</span><span class="label">${destination.label}</span>`;
  button.addEventListener('click', (event) => {
    if (event.detail && suppressClick) {
      suppressClick = false;
      return;
    }
    select(target + offset(index, target, count));
  });
  orbit.append(button);
  return button;
});

function draw() {
  if (!dimensions) return;
  buttons.forEach((button, index) => {
    const slot = offset(index, position, count);
    const { x, y } = orbitPoint(slot, dimensions.width, dimensions.height, desktop.matches);
    button.style.opacity = String(Math.min(1, (count / 2 - Math.abs(slot)) * 2.7));
    button.style.transform = `translate3d(${x}px,${y}px,0)`;
    button.style.setProperty('--selection', String(Math.max(0, 1 - Math.abs(slot))));
  });
  decoration?.draw(position);
}

function cancelFrame() {
  cancelAnimationFrame(frame);
  frame = 0;
}

function queueDraw() {
  if (!frame) frame = requestAnimationFrame(() => {
    frame = 0;
    draw();
  });
}

function settle(immediate = false) {
  cancelFrame();
  if (immediate || paused || reduced.matches) {
    position = target;
    draw();
    return;
  }
  const from = position;
  const goal = target;
  if (Math.abs(goal - from) < .00001) {
    position = goal;
    draw();
    return;
  }
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / 420, 1);
    position = from + (goal - from) * settleProgress(progress);
    draw();
    frame = progress < 1 ? requestAnimationFrame(tick) : 0;
  }
  frame = requestAnimationFrame(tick);
}

function cancelDrag() {
  if (!drag) return;
  const current = drag;
  drag = null;
  if (current.moving) suppressClick = true;
  if (current.surface.hasPointerCapture(current.id)) current.surface.releasePointerCapture(current.id);
}

function measureOrbit() {
  cancelDrag();
  contentTransition.finish();
  dimensions = { width: orbit.clientWidth, height: orbit.clientHeight };
  geometry = orbitGeometry(dimensions.width, dimensions.height, desktop.matches);
  const svg = orbit.querySelector(desktop.matches ? '.desktop-rails' : '.mobile-rails');
  decoration = decorations.get(svg);
  decoration.measure();
  settle(true);
}

function select(next, { focus = false, updateHash = true, immediate = false } = {}) {
  target = next;
  const active = wrap(next, count);
  const current = destinations[active];
  if (panel.getAttribute('aria-labelledby') !== buttons[active].id) {
    if (!immediate && panel.hasAttribute('aria-labelledby')) playNavigationSound();
    buttons.forEach((button, index) => {
      button.setAttribute('aria-selected', String(index === active));
      button.tabIndex = index === active ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', buttons[active].id);
    $('#number').textContent = String(active + 1).padStart(2, '0');
    const replacement = document.createElement('div');
    replacement.id = 'content';
    replacement.innerHTML = `<h2>${current.title}<span>.</span></h2><p class="lede">${current.description}</p><div class="panel-body">${renderBody[current.id]()}</div>`;
    if (content.contains(document.activeElement)) panel.focus({ preventScroll: true });
    spotifyResizeObserver?.disconnect();
    spotifyResizeObserver = null;
    contentTransition.replace(content, replacement, !immediate && !paused && !reduced.matches);
    content = replacement;
    if (updateHash) history.replaceState(null, '', `#${current.id}`);
  }
  if (focus) buttons[active].focus({ preventScroll: true });
  settle(immediate);
}

function selectFromHash() {
  const index = destinations.findIndex(({ id }) => `#${id}` === location.hash);
  if (index < 0 && location.hash) return;
  select(index < 0 ? 0 : target + offset(index, target, count), { updateHash: false, immediate: true });
}

function wireSwipe(surface, interactiveOrbit) {
  surface.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0 || drag) return;
    if (!interactiveOrbit && (event.pointerType === 'mouse' || event.target.closest('button,a,input,iframe'))) return;
    suppressClick = false;
    if (interactiveOrbit) cancelFrame();
    const rect = interactiveOrbit ? orbit.getBoundingClientRect() : null;
    const point = rect ? { x: event.clientX - rect.left, y: event.clientY - rect.top } : null;
    drag = {
      surface, id: event.pointerId, x: event.clientX, y: event.clientY,
      rect, point, geometry, origin: position, candidate: position,
      angle: point ? pointerAngle(point, geometry) : null, travel: 0, distance: 0, moving: false,
    };
  });

  function move(event) {
    if (drag?.id !== event.pointerId || drag.surface !== surface) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.distance = Math.max(drag.distance, Math.hypot(dx, dy));
    const horizontal = !interactiveOrbit || !desktop.matches || event.pointerType !== 'mouse';
    if (!drag.moving) {
      const intent = horizontal ? swipeStep(dx, dy, 8) !== 0 : Math.hypot(dx, dy) >= 8;
      if (!intent) return;
      drag.moving = true;
      drag.projectHorizontal = interactiveOrbit && desktop.matches
        && (event.pointerType !== 'mouse' || Math.abs(dx) > Math.abs(dy) * 1.25);
      surface.setPointerCapture(event.pointerId);
    }
    if (!interactiveOrbit) return;
    let point = { x: event.clientX - drag.rect.left, y: event.clientY - drag.rect.top };
    // Lock dominant horizontal desktop input onto the vertical tangent.
    // Vertical mouse drags keep the actual ellipse angle; touch scrolling stays native.
    if (drag.projectHorizontal) {
      point = { x: drag.point.x, y: drag.point.y + dx * drag.geometry.ry / drag.geometry.rx };
    }
    const angle = pointerAngle(point, drag.geometry);
    drag.travel += angleDelta(drag.angle, angle);
    drag.angle = angle;
    drag.candidate = angularPosition(drag.origin, drag.travel, drag.geometry);
    if (!paused && !reduced.matches) {
      position = drag.candidate;
      queueDraw();
    }
  }

  surface.addEventListener('pointermove', move);
  function finish(event) {
    if (drag?.id !== event.pointerId || drag.surface !== surface) return;
    if (event.type === 'pointerup') move(event);
    const current = drag;
    drag = null;
    if (current.moving) suppressClick = true;
    if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
    if (event.type !== 'pointerup' || !current.moving) {
      settle();
      return;
    }
    if (interactiveOrbit) {
      select(snapRotation(current.candidate, target, current.distance));
    } else {
      select(target + swipeStep(event.clientX - current.x, event.clientY - current.y));
    }
  }
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) surface.addEventListener(name, finish);
  surface.addEventListener('pointerleave', event => {
    if (drag?.id === event.pointerId && drag.surface === surface && !drag.moving) finish(event);
  });
}

wireSwipe(orbit, true);
wireSwipe($('main'), false);
new ResizeObserver(measureOrbit).observe(orbit);
desktop.addEventListener('change', measureOrbit);
reduced.addEventListener('change', () => {
  cancelDrag();
  contentTransition.finish();
  settle(true);
});
measureOrbit();
window.addEventListener('hashchange', selectFromHash);
selectFromHash();
if (!panel.hasAttribute('aria-labelledby')) select(0, { updateHash: false, immediate: true });

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,dialog,[contenteditable]')) return;
  const directions = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 };
  const fromTab = orbit.contains(document.activeElement);
  if (fromTab && ['Home', 'End'].includes(event.key)) {
    event.preventDefault();
    select(target + offset(event.key === 'Home' ? 0 : count - 1, target, count), { focus: true });
  } else if (Object.hasOwn(directions, event.key) && (fromTab || ['ArrowLeft', 'ArrowRight'].includes(event.key))) {
    event.preventDefault();
    select(target + directions[event.key], { focus: fromTab });
  }
});

for (const [name, direction, glyph] of [['previous', -1, 'left'], ['next', 1, 'right']]) {
  const button = $(`#${name}`);
  button.innerHTML = icon(glyph);
  button.addEventListener('click', () => select(target + direction));
}

$('.brand').addEventListener('click', () => select(target + offset(0, target, count)));
const motion = $('#motion');
motion.innerHTML = icon('pause');
motion.addEventListener('click', () => {
  paused = !paused;
  document.documentElement.toggleAttribute('data-paused', paused);
  motion.setAttribute('aria-pressed', String(paused));
  motion.setAttribute('aria-label', paused ? 'Resume motion' : 'Pause motion');
  motion.innerHTML = icon(paused ? 'play' : 'pause');
  cancelDrag();
  contentTransition.finish();
  settle(true);
});

function announce(message) {
  $('#status').textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('#status').textContent = ''; }, 3400);
}

const soundSystem = setupSiteSound({
  button: $('#sound'),
  oggUrl: profile.audioUrl,
  mp3Url: profile.audioMp3Url,
  icon,
  announce,
});
playNavigationSound = soundSystem.tick;

panel.addEventListener('click', (event) => {
  if (!event.target.closest('#load-playlist') || !profile.playlist.url) return;
  soundSystem.stop(); // Prevent overlap with the Spotify player.
  if (!profile.playlist.embedUrl) {
    location.assign(profile.playlist.url);
    return;
  }
  const player = $('#player');
  if (player.childElementCount) return;
  const embed = document.createElement('iframe');
  embed.title = 'Dilux Lane’s playlist player';
  embed.src = profile.playlist.embedUrl;
  embed.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  embed.setAttribute('allowfullscreen', '');
  embed.referrerPolicy = 'strict-origin-when-cross-origin';
  embed.loading = 'lazy';
  player.append(embed);

  // Spotify controls its iframe content. Give its full playlist UI a wide,
  // stable internal viewport, then fit the complete player inside this card.
  // This avoids cropped controls on narrow Android/iOS screens.
  const sizeSpotify = () => {
    const layout = spotifyFrameGeometry(player.clientWidth);
    if (!layout) return;
    player.style.height = `${layout.displayHeight}px`;
    embed.style.width = `${layout.embedWidth}px`;
    embed.style.height = `${layout.embedHeight}px`;
    embed.style.transform = `scale(${layout.scale})`;
  };
  sizeSpotify();
  spotifyResizeObserver = new ResizeObserver(sizeSpotify);
  spotifyResizeObserver.observe(player);
  announce('Playlist player opened. Use the direct playlist link if it does not load.');
});

const share = $('#share');
share.innerHTML = icon('share');
share.addEventListener('click', async () => {
  const url = location.href;
  if (navigator.share) {
    try { await navigator.share({ title: 'Dilux Lane', url }); return; }
    catch (error) { if (error.name === 'AbortError') return; }
  }
  if (navigator.clipboard) {
    try { await navigator.clipboard.writeText(url); announce('Link copied.'); return; }
    catch { /* The manual copy option remains available. */ }
  }
  $('#share-url').value = url;
  $('#share-dialog').showModal();
  $('#share-url').select();
});
