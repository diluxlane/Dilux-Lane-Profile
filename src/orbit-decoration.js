import { curveStroke, decorationProgress, pointOnCurve, wrap } from './orbit.js';

const svgNamespace = 'http://www.w3.org/2000/svg';

function measureCurve(path, matrix) {
  const total = path.getTotalLength();
  const points = [];
  let distance = 0;
  let previous;
  for (let index = 0; index <= 160; index++) {
    const point = path.getPointAtLength(total * index / 160);
    const screen = {
      x: matrix.a * point.x + matrix.c * point.y,
      y: matrix.b * point.x + matrix.d * point.y,
    };
    if (previous) distance += Math.hypot(screen.x - previous.x, screen.y - previous.y);
    points.push({ x: point.x, y: point.y, distance });
    previous = screen;
  }
  return points;
}

export function createOrbitDecoration(svg, count) {
  const dotTrack = svg.querySelector('.orbit-beads');
  const strokeTrack = svg.querySelector('.glint-track');
  const stroke = document.createElementNS(svgNamespace, 'path');
  stroke.setAttribute('class', 'glint');
  const dots = document.createElementNS(svgNamespace, 'g');
  dots.setAttribute('class', 'orbit-dots');
  svg.append(dots, stroke);
  let dotPoints;
  let strokePoints;
  let inverse;

  return {
    measure() {
      const matrix = svg.getScreenCTM();
      if (!matrix || !matrix.a || !matrix.d) return;
      dotPoints = measureCurve(dotTrack, matrix);
      strokePoints = measureCurve(strokeTrack, matrix);
      inverse = matrix.inverse();
      const { intervals } = decorationProgress(0, count, dotPoints.at(-1).distance);
      while (dots.childElementCount > intervals) dots.lastElementChild.remove();
      while (dots.childElementCount < intervals) {
        const dot = document.createElementNS(svgNamespace, 'circle');
        dot.setAttribute('r', '.65');
        dots.append(dot);
      }
    },
    draw(position) {
      if (!dotPoints) return;
      const length = dotPoints.at(-1).distance;
      const state = decorationProgress(position, count, length);
      [...dots.children].forEach((dot, index) => {
        const point = pointOnCurve(dotPoints, wrap(index * state.spacing + state.offset, length));
        // Cancel the parent's scale for round, constant-size screen-pixel dots.
        dot.setAttribute('transform', `matrix(${inverse.a} ${inverse.b} ${inverse.c} ${inverse.d} ${point.x} ${point.y})`);
      });
      const strokeLength = strokePoints.at(-1).distance;
      const progress = decorationProgress(position, count, strokeLength);
      stroke.setAttribute('d', curveStroke(strokePoints, progress.center, Math.min(82, strokeLength * .18)));
    },
  };
}
