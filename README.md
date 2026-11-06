# Dilux Lane

A static personal link hub with five destinations. The mobile interface uses a horizontal orbit and the desktop interface uses a vertical orbit beside the destination panel.

## Development

Use a current Node.js LTS. Run `npm test`, then `npm run build`. Serve `dist/` through a static HTTP server. No package install, backend, or environment variables are required. The repository’s Vercel configuration builds into `dist/`.

Edit public links and media in `src/profile.js`. Add a social entry with a title, detail, approved public URL, and icon key. Set `portrait` to an approved image, `playlist.url` to the public playlist, and optionally `playlist.embedUrl` to its provider’s embed endpoint. Set `audioUrl` only when the audio is approved for distribution. Sound starts only after the visitor presses the control.

## Sources and assets

- Design and interaction reference: [Renando | Enter My World](https://duingzcreative.site/renando). The live page supplied the desktop layout, Contact hierarchy and declared Jost font. The supplied screenshots supplied mobile proportions. No reference CSS, JS, image, audio, portrait, video or social identifiers are bundled. A search did not establish a reusable public source repository or permission to reuse the art or implementation.
- Floating-island artwork: original AI-generated scene created for this rebuild. It was converted to WebP and is used as the world background and for panel artwork. It uses no pixels from the supplied screenshots or original background.
- Jost: [Google Fonts upstream release](https://github.com/google/fonts/tree/main/ofl/jost), Latin subset of the variable TTF. [SIL Open Font License 1.1](public/assets/Jost-OFL.txt) is included. The reference declares a variable Latin Jost WOFF2. The family matches and the binary is from a separate upstream distribution.
- Icons and monogram: line drawings authored for this project. No third-party icon package.
- About copy draws on the public [GitHub profile](https://github.com/diluxlane), [creative portfolio repository](https://github.com/diluxlane/Dilux-Lane-Portfolio), and [developer portfolio repository](https://github.com/diluxlane/Dilux-Lane-Dev-Portfolio).

## Missing personal assets

Approved portrait, public playlist URL, licensed sound file, and any additional public contact or social URLs. The site uses a monogram and lists the confirmed Instagram and GitHub accounts. Contact uses the confirmed public Instagram profile. Playlist and sound disclose their unavailable state.
