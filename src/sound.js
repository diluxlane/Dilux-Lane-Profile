// Opt-in CC0 ambient soundtrack with an original locally hosted electro-kick navigation effect.
export function setupSiteSound({ button, oggUrl, mp3Url, icon, announce }) {
  const music = new Audio();
  music.preload = 'none';
  music.loop = true;
  music.volume = 0;
  music.src = (music.canPlayType('audio/ogg; codecs="vorbis"') ? oggUrl : mp3Url) || oggUrl || mp3Url;

  let enabled = false;
  let pending = false;
  let context = null;
  let fadeFrame = 0;

  function showState() {
    const label = music.src ? (enabled ? 'Sound on' : 'Sound off') : 'Sound unavailable';
    button.disabled = !music.src;
    button.innerHTML = icon(enabled ? 'volume' : 'mute') + '<span class="eyebrow">' + label + '</span>';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(enabled));
  }

  function fadeTo(value, duration, done = () => {}) {
    cancelAnimationFrame(fadeFrame);
    const from = music.volume;
    const began = performance.now();
    const advance = (now) => {
      const progress = Math.min(1, (now - began) / duration);
      music.volume = Math.max(0, Math.min(1, from + (value - from) * progress));
      if (progress < 1) fadeFrame = requestAnimationFrame(advance);
      else done();
    };
    fadeFrame = requestAnimationFrame(advance);
  }

  function stop({ immediate = false } = {}) {
    if (!enabled && !pending) return;
    enabled = false;
    showState();
    if (immediate) {
      cancelAnimationFrame(fadeFrame);
      music.pause();
      music.volume = 0;
    } else fadeTo(0, 220, () => music.pause());
  }

  // This short electro-kick is an original 180 ms audio sample kept in our assets.
  // Decode it only after the visitor enables sound; no effect plays automatically.
  let kickBuffer = null;
  let kickRequest = null;
  let lastKickAt = -1;

  function loadKick() {
    if (!context || kickBuffer || kickRequest) return;
    kickRequest = fetch('/assets/orbit-kick.wav', { cache: 'force-cache' })
      .then(response => {
        if (!response.ok) throw new Error('Navigation sound unavailable');
        return response.arrayBuffer();
      })
      .then(bytes => context.decodeAudioData(bytes))
      .then(decoded => { kickBuffer = decoded; })
      .catch(() => { kickRequest = null; }); // Audio is optional; navigation always works.
  }

  function tick() {
    if (!enabled || !context || context.state !== 'running') return;
    if (!kickBuffer) {
      loadKick();
      return;
    }
    const now = context.currentTime;
    if (now - lastKickAt < 0.055) return;
    lastKickAt = now;

    try {
      const source = context.createBufferSource();
      const level = context.createGain();
      source.buffer = kickBuffer;
      level.gain.setValueAtTime(0.55, now);
      source.connect(level);
      level.connect(context.destination);
      source.onended = () => {
        source.disconnect();
        level.disconnect();
      };
      source.start(now);
    } catch { /* A blocked sound must never interrupt a destination change. */ }
  }

  music.addEventListener('error', () => {
    if (!enabled && !pending) return;
    stop({ immediate: true });
    announce('Background music could not load. Please try again later.');
  });

  showState();
  button.addEventListener('click', async () => {
    if (pending || !music.src) return;
    if (enabled) return stop();
    pending = true;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass && !context) context = new AudioContextClass();
      if (context?.state === 'suspended') void context.resume().catch(() => {});
      loadKick();
      cancelAnimationFrame(fadeFrame);
      music.volume = 0;
      await music.play();
      enabled = true;
      showState();
      fadeTo(0.12, 750);
      tick();
    } catch {
      stop({ immediate: true });
      announce('Background music is unavailable in this browser.');
    } finally {
      pending = false;
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop({ immediate: true });
  });
  return { tick, stop };
}
