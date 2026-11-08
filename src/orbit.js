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

// Ellipses approximate the tangent of the approved polynomial arrangements.
// They interpret the pointer; orbitPoint remains the visual layout authority.
export function orbitGeometry(width, height, desktop) {
  const geometry = desktop
    ? { cx: .05 * width, cy: .652 * height, rx: .572 * width, ry: .4 * height, direction: -1 }
    : { cx: .5 * width, cy: -.8 * height, rx: .65 * width, ry: 1.35 * height, direction: 1 };
  const center = pointerAngle(orbitPoint(0, width, height, desktop), geometry);
  const neighbor = pointerAngle(orbitPoint(1, width, height, desktop), geometry);
  return { ...geometry, stepAngle: Math.abs(angleDelta(center, neighbor)) };
}

export function pointerAngle(point, geometry) {
  const x = (point.x - geometry.cx) / geometry.rx;
  const y = (point.y - geometry.cy) / geometry.ry;
  return Math.hypot(x, y) < .08 ? null : Math.atan2(y, x);
}

export function angleDelta(previous, next) {
  if (previous === null || next === null) return 0;
  return Math.atan2(Math.sin(next - previous), Math.cos(next - previous));
}

export function angularPosition(origin, travel, geometry) {
  return origin + geometry.direction * travel / geometry.stepAngle;
}

export function snapRotation(position, committed, distance, threshold = 24) {
  return distance < threshold ? committed : Math.round(position);
}

// Monotone, critically damped response, normalized to finish exactly at t=1.
export function settleProgress(t) {
  const response = value => 1 - (1 + 7 * value) * Math.exp(-7 * value);
  return response(Math.max(0, Math.min(1, t))) / response(1);
}

export function decorationProgress(position, count, length, desiredSpacing = 18) {
  const intervals = Math.max(1, Math.round(length / desiredSpacing));
  return {
    center: wrap(.5 - position / count, 1) * length,
    spacing: length / intervals,
    offset: -position * length / count,
    intervals,
  };
}

// Points have source-SVG x/y coordinates and cumulative *screen-pixel* distance.
export function pointOnCurve(points, distance) {
  const last = points.at(-1);
  const d = Math.max(0, Math.min(last.distance, distance));
  let low = 0;
  let high = points.length - 1;
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (points[middle].distance < d) low = middle;
    else high = middle;
  }
  const a = points[low];
  const b = points[high];
  const fraction = b.distance === a.distance ? 0 : (d - a.distance) / (b.distance - a.distance);
  return { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };
}

export function curveStroke(points, center, length) {
  const total = points.at(-1).distance;
  const start = wrap(center - length / 2, total);
  const sections = start + length <= total
    ? [[start, start + length]]
    : [[start, total], [0, start + length - total]];
  return sections.map(([from, to]) => {
    const steps = Math.max(1, Math.ceil((to - from) / 3));
    return Array.from({ length: steps + 1 }, (_, index) => {
      const point = pointOnCurve(points, from + (to - from) * index / steps);
      return `${index ? 'L' : 'M'}${point.x.toFixed(3)} ${point.y.toFixed(3)}`;
    }).join(' ');
  }).join(' ');
}
