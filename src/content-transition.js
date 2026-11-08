// The outgoing node is a temporary, inert visual snapshot. Only #content is live.
export function createContentTransition(panel) {
  let animations = [];
  let outgoing = null;

  function finish() {
    for (const animation of animations) animation.cancel();
    animations = [];
    outgoing?.remove();
    outgoing = null;
    panel.style.minHeight = '';
  }

  function replace(previous, next, animated) {
    const interrupted = animations.length > 0;
    finish();
    // An interrupted incoming panel becomes the newest content immediately.
    // Replaying its partial fade would flash an intermediate destination.
    if (interrupted || !animated || typeof next.animate !== 'function') {
      previous.replaceWith(next);
      return;
    }
    const rect = previous.getBoundingClientRect();
    const parentRect = panel.getBoundingClientRect();
    previous.replaceWith(next);
    const nextHeight = panel.getBoundingClientRect().height;
    panel.style.minHeight = `${Math.max(parentRect.height, nextHeight)}px`;
    previous.removeAttribute('id');
    previous.setAttribute('aria-hidden', 'true');
    previous.inert = true;
    previous.className = 'content-outgoing';
    for (const element of previous.querySelectorAll('[id]')) element.removeAttribute('id');
    for (const element of previous.querySelectorAll('a,button,input,select,textarea,[tabindex]')) {
      element.setAttribute('tabindex', '-1');
    }
    // Dispose cross-origin players immediately instead of keeping them playing
    // during a visual fade. Their wrapper already has an explicit fitted height.
    for (const media of previous.querySelectorAll('iframe,audio,video')) media.remove();
    Object.assign(previous.style, {
      left: `${rect.left - parentRect.left}px`,
      top: `${rect.top - parentRect.top}px`,
      width: `${rect.width}px`,
    });
    panel.append(previous);
    outgoing = previous;
    const leaving = previous.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-4px)' },
    ], { duration: 160, easing: 'ease-out', fill: 'forwards' });
    const entering = next.animate([
      { opacity: 0, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 260, easing: 'cubic-bezier(.2,.7,.25,1)' });
    animations = [leaving, entering];
    const current = animations;
    Promise.all(current.map(animation => animation.finished)).then(() => {
      if (animations === current) finish();
    }, () => {
      // Cancellation is expected on rapid selection, pause, or reduced motion.
    });
  }

  return { replace, finish };
}
