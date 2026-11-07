// Opt-in CC0 ambient soundtrack with original synthesized orbit-selection tick.
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

  // Original sound design; no recording from the Renando reference is used.
  function tick() {
    if (!enabled || !context || context.state !== 'running') return;
    try {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(620, now);
      oscillator.frequency.exponentialRampToValueAtTime(420, now + 0.14);
      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.exponentialRampToValueAtTime(0.021, now + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      oscillator.connect(envelope);
      envelope.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.17);
    } catch { /* Sound effects must never block navigation. */ }
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
