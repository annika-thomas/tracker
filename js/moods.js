// The five mood faces, drawn to match the reference app.
// Colours sampled directly from the source screenshots.
export const MOODS = [
  { id: 0, color: '#E6D688', label: 'great' },
  { id: 1, color: '#B3CE85', label: 'good' },
  { id: 2, color: '#69A16B', label: 'okay' },
  { id: 3, color: '#3C6A48', label: 'low' },
  { id: 4, color: '#626B67', label: 'awful' }
];

const mouth = (i, ink) => [
  // geometry traced from the reference screenshots (100-unit box)
  `<path fill="${ink}" d="M34 49h32a16 23 0 0 1-32 0z"/>`,
  `<path fill="none" stroke="${ink}" stroke-width="4.4" stroke-linecap="round" d="M40 53q10 9.6 20 0"/>`,
  `<path fill="none" stroke="${ink}" stroke-width="4.6" stroke-linecap="round" d="M44 51h12"/>`,
  `<path fill="none" stroke="${ink}" stroke-width="4.4" stroke-linecap="round" d="M40 58q10-9.6 20 0"/>`,
  `<path fill="${ink}" d="M50 48a16 23 0 0 1 16 23H34a16 23 0 0 1 16-23z"/>`
][i] || '';

const eyes = (ink) =>
  `<circle cx="35" cy="41" r="3.9" fill="${ink}"/><circle cx="65" cy="41" r="3.9" fill="${ink}"/>`;

export function moodFace(mood, { size = 40, color = null, muted = false } = {}) {
  const m = MOODS[mood] ?? MOODS[1];
  const fill = muted ? 'var(--chip-off)' : (color || m.color);
  const ink = muted ? '#AFAFAF' : '#2E2E2E';
  return `<svg class="mood-face" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
<circle cx="50" cy="50" r="50" fill="${fill}"/>${eyes(ink)}${mouth(mood, ink)}</svg>`;
}

// Mascot used in the avatar pill and the floating log button.
export function bean(size = 34, color = '#A5CF7A') {
  const ink = '#2E2E2E';
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
<path fill="${color}" d="M50 4c22 0 39 17 39 40 0 28-17 52-39 52S11 72 11 44C11 21 28 4 50 4z"/>
<circle cx="36" cy="42" r="4.6" fill="${ink}"/><circle cx="64" cy="42" r="4.6" fill="${ink}"/>
<path fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round" d="M39 54q11 9 22 0"/></svg>`;
}

export function sprout(size = 30) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" aria-hidden="true">
<path fill="none" stroke="#7CA95C" stroke-width="2" stroke-linecap="round" d="M18 32V14"/>
<path fill="#8CC168" d="M18 16c-1-6-6-8-11-7 0 6 5 9 11 7z"/>
<path fill="#A7D47F" d="M18 14c1-6 6-8 11-7 0 6-5 9-11 7z"/></svg>`;
}
