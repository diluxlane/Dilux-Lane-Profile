// Original line drawings on a 24 × 24 grid.
const drawings = {
  link: '<path d="M9 6H7a6 6 0 0 0 0 12h2m6-12h2a6 6 0 0 1 0 12h-2M7 12h10"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="m5 5 3 2 1 4 4 2 3-2 4 1m-8 10v-6l-3-1-2-4-5 1m14 9 1-5 4-2M13 2l-1 4 3 3 5-1"/>',
  user: '<circle cx="12" cy="7" r="4.5"/><path d="M3.5 22a8.5 8.5 0 0 1 17 0"/>',
  wave: '<path d="M2 10v4m4-7v10m4-14v18m4-15v12m4-10v8m4-6v4"/>',
  send: '<path d="m2 10 20-8-7 20-4-9-9-3Zm9 3 11-11"/>',
  pause: '<rect x="5" y="3" width="4" height="18" rx="2"/><rect x="15" y="3" width="4" height="18" rx="2"/>',
  play: '<path d="m8 4 12 8-12 8V4Z"/>',
  mute: '<path d="M3 9h4l5-5v16l-5-5H3Zm13 0 6 6m0-6-6 6"/>',
  volume: '<path d="M3 9h4l5-5v16l-5-5H3Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  share: '<circle cx="5" cy="12" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><path d="m8 11 8-5m-8 7 8 5"/>',
  left: '<path d="m15 5-7 7 7 7"/>',
  right: '<path d="m9 5 7 7-7 7"/>',
  arrow: '<path d="M6 18 18 6M7 6h11v11"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r=".6"/>',
  github: '<path d="M8 22v-3c-3 1-4-1-5-2m13 5v-4c0-1-.3-2-1-2 4-.5 6-2 6-6 0-2-.6-3-1.5-4 .2-1 .2-2-.5-4-1.5 0-3 1-4 2a15 15 0 0 0-6 0C8 3 6.5 2 5 2c-.7 2-.7 3-.5 4C3.6 7 3 8 3 10c0 4 2 5.5 6 6-.7 0-1 1-1 2"/>',
  film: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 12h5m10 0h5"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18"/>',
  headphones: '<path d="M3 16v-5a9 9 0 0 1 18 0v5M3 14h3a2 2 0 0 1 2 2v4H5a2 2 0 0 1-2-2Zm18 0h-3a2 2 0 0 0-2 2v4h3a2 2 0 0 0 2-2Z"/>',
  note: '<path d="M10 17V3l8 4"/><ellipse cx="7" cy="18" rx="3" ry="3"/>',
  youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z"/>',
  tiktok: '<path d="M13 3v13a4 4 0 1 1-4-4m4-9c1 4 3 6 7 6"/>',
};

export function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[name] ?? drawings.link}</svg>`;
}
