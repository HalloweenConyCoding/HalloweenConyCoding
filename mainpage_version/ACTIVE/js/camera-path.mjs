const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

/** Map the current document layout to four equally weighted story chapters. */
export function progressFor(scrollY, chapterStarts, maxScroll) {
  const end = Math.max(0, finite(maxScroll));
  if (!end || !chapterStarts.length) return 0;
  const y = clamp(finite(scrollY), 0, end);
  if (y === 0) return 0;
  if (y === end) return 1;
  const starts = chapterStarts.map((v, i) => clamp(finite(v, i ? chapterStarts[i - 1] : 0), 0, end));
  for (let i = 1; i < starts.length; i++) starts[i] = Math.max(starts[i], starts[i - 1]);
  for (let i = starts.length - 1; i >= 0; i--) {
    if (y >= starts[i]) {
      const next = i === starts.length - 1 ? end : starts[i + 1];
      return clamp((i + (next > starts[i] ? (y - starts[i]) / (next - starts[i]) : 0)) / starts.length, 0, 1);
    }
  }
  return 0;
}

const waypoints = [
  {position: [8, 6, 14], target: [0, 5, 0]},
  {position: [22, 10, 18], target: [20, 7, -4]},
  {position: [30, 5, -5], target: [36, 3, -15]},
  {position: [49, 5, -20], target: [52, 4, -29]},
  {position: [58, 8, -20], target: [52, 6, -31]},
];

function curve(key, segment, t) {
  return [0, 1, 2].map(axis => {
    const p0 = waypoints[Math.max(0, segment - 1)][key][axis];
    const p1 = waypoints[segment][key][axis];
    const p2 = waypoints[Math.min(4, segment + 1)][key][axis];
    const p3 = waypoints[Math.min(4, segment + 2)][key][axis];
    return .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  });
}

/** Continuous camera position and look-at target, with wider mobile framing. */
export function sampleCamera(progress, narrow = false) {
  const scaled = clamp(finite(progress), 0, 1) * 4;
  const segment = Math.min(3, Math.floor(scaled));
  const t = scaled - segment;
  const position = curve('position', segment, t);
  const target = curve('target', segment, t);
  if (narrow) {
    // Leave space between phone navigation and the content card for each subject.
    const distances=[1.75,1.55,1.2,1.75,1.75];
    const blend=t*t*(3-2*t),backaway=distances[segment]+(distances[segment+1]-distances[segment])*blend;
    for (let axis = 0; axis < 3; axis++) position[axis] = target[axis] + (position[axis] - target[axis]) * backaway;
  }
  return {position, target, fov: narrow ? 58 : 48};
}

export function damp(current, target, dtSeconds) {
  const alpha = 1 - Math.exp(-Math.max(0, finite(dtSeconds)) / .18);
  return current + (target - current) * alpha;
}
