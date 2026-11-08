export const wrap = (index, count) => ((index % count) + count) % count;

export function offset(index, position, count) {
  return wrap(index - position + count / 2, count) - count / 2;
}

export function orbitPoint(slot, width, height, desktop) {
  const distance = Math.abs(slot);
  if (desktop) {
    return {
      x: width * (.622 - .041 * distance ** 2),
      y: height * (.652 + .151 * slot),
    };
  }
  return {
    x: width * (.5 + .226 * slot - .0086 * slot ** 3),
    y: height * (.55 - .072 * distance ** 2),
  };
}

export function swipeStep(dx, dy, distance = 34) {
  return Math.abs(dx) >= distance && Math.abs(dx) > Math.abs(dy) * 1.25
    ? -Math.sign(dx)
    : 0;
}

/**
 * Move the two independent accent curves with the user-driven orbit position.
 * The sweep moves right-to-left as the selected destination advances; it fades
 * at the cropped wrap seam rather than jumping visibly across the navigation.
 * There is no separate clock, CSS animation, or automatic rotation.
 */
export function orbitRailState(position, count, railLength, requestedDash = 110) {
  if (!Number.isFinite(position) || !Number.isFinite(railLength)
      || !Number.isFinite(requestedDash) || count <= 0 || railLength <= 0) {
    return null;
  }
  const dashLength = Math.min(railLength, Math.max(0, requestedDash));
  const distance = Math.max(0, railLength - dashLength);
  const phase = wrap(count - position, count) / count;
  // Both ends lie outside the clipped rail, where a wrapped sweep can vanish.
  const seamDistance = Math.min(phase, 1 - phase);
  return {
    dashLength,
    dashOffset: -distance * phase,
    dotsOffset: -position * 6,
    highlightOpacity: Math.min(1, seamDistance * 9),
  };
}
