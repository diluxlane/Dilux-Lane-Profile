import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('navigation electro-kick is a short, non-silent local WAV asset', () => {
  const wav = readFileSync(new URL('../public/assets/orbit-kick.wav', import.meta.url));
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.toString('ascii', 12, 16), 'fmt ');
  assert.equal(wav.readUInt16LE(20), 1); // PCM
  assert.equal(wav.readUInt16LE(22), 1); // mono
  assert.equal(wav.readUInt32LE(24), 32000);
  assert.equal(wav.readUInt16LE(34), 16);
  assert.equal(wav.toString('ascii', 36, 40), 'data');
  const dataBytes = wav.readUInt32LE(40);
  assert.equal(wav.length, dataBytes + 44);
  const seconds = dataBytes / 2 / 32000;
  assert.ok(seconds >= 0.13 && seconds <= 0.25, 'kick duration should be brief');
  let max = 0;
  for (let i = 44; i < wav.length; i += 2) {
    max = Math.max(max, Math.abs(wav.readInt16LE(i)));
  }
  assert.ok(max > 10000, 'kick should have enough level to be audible');
});
