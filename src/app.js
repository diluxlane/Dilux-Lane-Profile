import { destinations, profile } from './profile.js';
import { icon } from './icons.js';
import { offset, orbitPoint, orbitRailState, swipeStep, wrap } from './orbit.js';
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
let startPosition = 0;
let frame = 0;
let drag = null;
let paused = false;
let toastTimer;
let suppressClickUntil = 0;
let playNavigationSound = () => {};
let spotifyResizeObserver = null;

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
    if (event.detail && performance.now() < suppressClickUntil) return;
    select(target + offset(index, target, count));
  });
  orbit.append(button);
  return button;
});

function draw() {
  const width = orbit.clientWidth;
  const height = orbit.clientHeight;
  buttons.forEach((button, index) => {
    const slot = offset(index, position, count);
    const { x, y } = orbitPoint(slot, width, height, desktop.matches);
    // Fade the element as it crosses the wrap seam on the far side of the orbit.
    button.style.opacity = String(Math.min(1, (count / 2 - Math.abs(slot)) * 2.7));
    button.style.transform = `translate3d(${x}px,${y}px,0)`;
  });

  // Move the gold highlight AND dotted trail along the rail as the user rotates.
  // Unlike the previous fixed glint, nothing moves while the carousel is idle.
  const activeRail = orbit.querySelector(desktop.matches ? '.desktop-rails' : '.mobile-rails');
  const highlight = activeRail?.querySelector('.glint');
  const beads = activeRail?.querySelector('.orbit-beads');
  if (highlight && beads) {
    const state = orbitRailState(position, count, highlight.getTotalLength(), desktop.matches ? 115 : 74);
    if (state) {
      highlight.style.strokeDasharray = `${state.dashLength} 10000`;
      highlight.style.strokeDashoffset = String(state.dashOffset);
      beads.style.strokeDashoffset = String(state.dotsOffset);
    }
  }
}

function settle(immediate = false) {
  cancelAnimationFrame(frame);
  if (immediate || paused || reduced.matches) {
    position = target;
    draw();
    return;
  }
  const from = position;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / 460, 1);
    const spring = 1 - Math.exp(-6 * progress) * Math.cos(8 * progress);
    position = progress === 1 ? target : from + (target - from) * spring;
    draw();
    if (progress < 1) frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
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
    if (!immediate) replacement.className = 'arriving';
    replacement.innerHTML = `<h2>${current.title}<span>.</span></h2><p class="lede">${current.description}</p><div class="panel-body">${renderBody[current.id]()}</div>`;
    if (content.contains(document.activeElement)) panel.focus({ preventScroll: true });
    spotifyResizeObserver?.disconnect();
    spotifyResizeObserver = null;
    content.replaceWith(replacement);
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
    drag = { surface, id: event.pointerId, x: event.clientX, y: event.clientY, moving: false };
    startPosition = position;
  });
  surface.addEventListener('pointermove', (event) => {
    if (drag?.id !== event.pointerId || drag.surface !== surface) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    const distance = interactiveOrbit && desktop.matches ? (Math.abs(dy) > Math.abs(dx) ? dy : dx) : dx;
    const cross = distance === dy && interactiveOrbit && desktop.matches ? dx : dy;
    if (!drag.moving && swipeStep(distance, cross, 9)) {
      drag.moving = true;
      surface.setPointerCapture(event.pointerId);
      cancelAnimationFrame(frame);
    }
    if (drag.moving && interactiveOrbit && !paused && !reduced.matches) {
      position = startPosition - Math.max(-2, Math.min(2, distance / Math.max(48, orbit.clientWidth / 5)));
      draw();
    }
  });
  function finish(event) {
    if (drag?.id !== event.pointerId || drag.surface !== surface) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    const vertical = interactiveOrbit && desktop.matches && Math.abs(dy) > Math.abs(dx);
    const step = event.type === 'pointerup' ? swipeStep(vertical ? dy : dx, vertical ? dx : dy) : 0;
    // Follow the distance actually dragged: a two-slot swipe should not snap back one slot.
    // Keep the existing one-step behavior for short swipes and non-orbit surfaces.
    const nearest = interactiveOrbit && drag.moving && !paused && !reduced.matches
      ? Math.round(position) : target;
    if (drag.moving) suppressClickUntil = performance.now() + 250;
    drag = null;
    if (event.type !== 'pointerup') settle();
    else if (nearest !== target) select(nearest);
    else if (step) select(target + step);
    else settle();
  }
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) surface.addEventListener(name, finish);
  surface.addEventListener('pointerleave', (event) => {
    if (drag?.id === event.pointerId && drag.surface === surface && !drag.moving) finish(event);
  });
}

wireSwipe(orbit, true);
wireSwipe($('main'), false);
new ResizeObserver(draw).observe(orbit);
desktop.addEventListener('change', draw);
reduced.addEventListener('change', () => settle(true));
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
