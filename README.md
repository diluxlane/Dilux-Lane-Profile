# Dilux Lane

A static personal link hub with five destinations. The mobile interface uses a horizontal orbit and the desktop interface uses a vertical orbit beside the destination panel.

## Development

Use a current Node.js LTS. Run `npm test`, then `npm run build`. Serve `dist/` through a static HTTP server. No package install, backend, or environment variables are required. The repository’s Vercel configuration builds into `dist/`.

Edit public links and media in `src/profile.js`. Add a social entry with a title, detail, approved public URL, and icon key. Set `portrait` to an approved image, `playlist.url` to the public playlist, and optionally `playlist.embedUrl` to its provider’s embed endpoint. Use `audioUrl` and `audioMp3Url` for appropriately licensed audio. Sound starts only after the visitor presses the control.

## Sources and assets

- Design and interaction reference: [Renando | Enter My World](https://duingzcreative.site/renando). The live page supplied the desktop layout, Contact hierarchy and declared Jost font. The supplied screenshots supplied mobile proportions. No reference CSS, JS, image, audio, portrait, video or social identifiers are bundled. A search did not establish a reusable public source repository or permission to reuse the art or implementation.
- Floating-island artwork: original AI-generated scene created for this rebuild. It was converted to WebP and is used as the world background and for panel artwork. It uses no pixels from the supplied screenshots or original background.
- Jost: [Google Fonts upstream release](https://github.com/google/fonts/tree/main/ofl/jost), Latin subset of the variable TTF. [SIL Open Font License 1.1](public/assets/Jost-OFL.txt) is included. The reference declares a variable Latin Jost WOFF2. The family matches and the binary is from a separate upstream distribution.
- Icons and monogram: line drawings authored for this project. No third-party icon package.
- About copy draws on the public [GitHub profile](https://github.com/diluxlane), [creative portfolio repository](https://github.com/diluxlane/Dilux-Lane-Portfolio), and [developer portfolio repository](https://github.com/diluxlane/Dilux-Lane-Dev-Portfolio).

## Current personal media (updated November 7, 2026)

- **Portrait:** The user-provided portrait is stored at `public/assets/portrait.webp` and shown in About me.
- **Playlist:** The user-supplied [Spotify playlist](https://open.spotify.com/playlist/3BLoPATQ9Bk8ZSblfBD8RS) is linked and configured to load an embedded Spotify player when the visitor selects **Load playlist**. A direct Spotify link is also available. Actual playback and failure handling on supported browsers/devices still need verification.
- **Background sound:** **Cathedral in the forest (ambient loop)** by congusbongus (CC0) is hosted locally as OGG and MP3. It starts only after the visitor presses the sound control, loops at low volume, fades in/out, and stops before the Spotify embed opens. A short, punchy electronic kick accompanies destination changes only while sound is on.
- **Social/contact links:** The confirmed public Instagram and GitHub links are included; Contact currently points to Instagram. YouTube, TikTok, email, and other links are optional and must be verified before publishing.

## Remaining verification

- Test the Spotify embed (including denied third-party cookies, failed loading, and playback restrictions), the portrait crop, the user-controlled ambient music and navigation tick, and the latest deployment in a real browser.
- Test physical touchscreen dragging, native device sharing, and OS reduced-motion behavior; these were not covered by the earlier Chromium comparison.
- Complete a formal Lighthouse and screen-reader audit when practical.

## Sound sources and licensing

- **Music:** [Cathedral in the forest (ambient loop)](https://opengameart.org/content/cathedral-in-the-forest-ambient-loop) by **congusbongus**, published under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). Original OGG source: `forest_2_0.ogg`; `cathedral-in-the-forest.mp3` is an 80 kbps compatibility conversion. Both files are bundled in `public/assets/`; credit is retained for provenance even though CC0 does not require it.
- **Interaction sound:** `public/assets/orbit-kick.wav` is an original 180 ms mono PCM WAV (32 kHz) electronic-kick sample created programmatically for this site. It has a short percussive attack and a descending tonal body. The site loads the asset only after sound is enabled and uses Web Audio to play it on destination changes. No third-party sample or sound from Renando is copied.
- **Behavior:** Both sounds are disabled until the visitor explicitly enables sound; audio is not preloaded. On supported browsers the OGG source is used; MP3 is supplied as a format fallback. The Spotify playlist is independent.

`REVIEW.md` retains the original screenshot comparison as a historical record. Its current-status note tracks changes made after that review.
