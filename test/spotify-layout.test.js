import assert from 'node:assert/strict';
import test from 'node:test';
import { spotifyFrameGeometry } from '../src/spotify-layout.js';

test('Spotify full player stays contained at phone, tablet and desktop widths', () => {
  for (const width of [272, 280, 320, 338, 390, 440, 500, 560, 768]) {
    const size = spotifyFrameGeometry(width);
    assert.ok(size, 'layout exists');
    assert.ok(size.embedWidth >= 560, 'Spotify has room for its full controls');
    assert.ok(Math.abs(size.embedWidth * size.scale - width) < 1, 'iframe fits card width');
    assert.ok(size.embedHeight * size.scale <= size.displayHeight, 'iframe is not cropped vertically');
    assert.ok(size.displayHeight <= 352, 'player does not grow taller than full-size Spotify');
    assert.ok(size.displayHeight > 0);
  }
});

test('Spotify stays unscaled on a wide card and rejects unmeasured widths', () => {
  assert.deepEqual(spotifyFrameGeometry(620), {
    embedWidth: 620,
    embedHeight: 352,
    scale: 1,
    displayHeight: 352,
  });
  assert.equal(spotifyFrameGeometry(0), null);
  assert.equal(spotifyFrameGeometry(Number.NaN), null);
});
