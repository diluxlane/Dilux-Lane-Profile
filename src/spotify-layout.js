// Keep Spotify's cross-origin full playlist UI legible and fully contained.
const FULL_HEIGHT = 352;
const MIN_INTERNAL_WIDTH = 560;
const MAX_MOBILE_HEIGHT = 500;

/**
 * Spotify's internal controls can overflow narrow iframes on mobile.
 * Use a wider internal viewport and scale the *whole* iframe proportionally;
 * do not crop individual controls or change Spotify's own markup.
 *
 * The resulting card never exceeds Spotify's standard 352px full height.
 */
export function spotifyFrameGeometry(availableWidth) {
  if (!Number.isFinite(availableWidth) || availableWidth <= 0) return null;

  const space = Math.max(1, Math.floor(availableWidth));
  const embedWidth = Math.max(space, MIN_INTERNAL_WIDTH);
  const scale = space / embedWidth;
  const embedHeight = scale === 1
    ? FULL_HEIGHT
    : Math.min(MAX_MOBILE_HEIGHT, Math.floor(FULL_HEIGHT / scale));
  return {
    embedWidth,
    embedHeight,
    scale,
    displayHeight: Math.min(FULL_HEIGHT, Math.ceil(embedHeight * scale)),
  };
}
