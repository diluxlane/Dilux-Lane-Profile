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
 * Place the short golden accent on the same curved rail as the dotted track.
 * Both offsets are deterministic from the currently rendered carousel position;
 * this never starts its own animation or timer.
 */
export function orbitRailState(position, count, railLength, requestedDash = 72) {
  if (!Number.isFinite(position) || !Number.isFinite(railLength) || count <= 0 || railLength <= 0) {
    return null;
  }
  const dashLength = Math.min(railLength, Math.max(0, requestedDash));
  const distance = Math.max(0, railLength - dashLength);
  return {
    dashLength,
    dashOffset: -distance * (wrap(position, count) / count),
    dotsOffset: -position * 24,
  };
}
