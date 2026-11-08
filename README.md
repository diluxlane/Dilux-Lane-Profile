# Dilux Lane — Personal Link Hub

A cinematic, interactive personal universe for **Dilux Lane** — bringing together creative work, web development, selected social links, and music in one place.

**Live website:** https://dilux-lane-profile.vercel.app

[![Validate site](https://github.com/diluxlane/Dilux-Lane-Profile/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/diluxlane/Dilux-Lane-Profile/actions/workflows/ci.yml)

**[Visit the website](https://dilux-lane-profile.vercel.app)** · **[Creative portfolio](https://dilux-lane-portfolio.vercel.app)** · **[Developer portfolio](https://dilux-lane-dev-portfolio.vercel.app)** · **[Reference and verification notes](REVIEW.md)**

![Original fantasy-world artwork used in the Dilux Lane website](public/assets/world.webp)

*Original floating-island scene used in the website. This artwork preview is not a screenshot of the complete interactive interface.*

## Overview

This repository contains the source for **Dilux Lane's personal profile and link hub**. The design is a dark-navy-and-gold fantasy world with a five-destination orbit selector: a **horizontal arc on mobile** and a **vertical orbit on desktop**.

The site is a lightweight static frontend: no application framework, database, authentication system, backend service, or runtime secrets are required. It is distinct from the creative portfolio, developer portfolio, and Zyberlane agency website it links to.

## Explore the five destinations

| Destination | Purpose |
| --- | --- |
| **My links** | Featured creative portfolio, developer portfolio, GitHub, and Zyberlane. |
| **Socials** | Confirmed public Instagram and GitHub profiles. |
| **About me** | Personal introduction and approved portrait. |
| **Playlist** | Personal Spotify playlist with a visitor-loaded embed and a direct Spotify link. |
| **Contact** | Public Instagram contact link and a short introduction for project enquiries. |

Additional social accounts and contact methods are intentionally not listed until their public URLs are approved.

## Highlights

- Responsive floating-island experience with navy, gold, and ivory styling, locally hosted Jost typography, and rounded cards.
- Five synchronized navigation destinations with drag/swipe interaction, keyboard support, arrow controls, and wraparound selection. The thin orbit rails, gold sweep and dotted trail move with user-driven rotation and remain still when idle.
- A motion pause/resume control and support for the operating system's reduced-motion preference.
- Responsive portrait and portfolio links, with no fabricated social or contact information.
- Spotify playlist integration that loads on demand. On narrow screens, the complete full-player interface is proportionally fitted inside a rounded card instead of cropping the controls; a direct Spotify link remains available.
- **Optional sound:** an opt-in CC0 ambient soundtrack plus a short original electronic-kick effect when destinations change.
- Share using the browser's native share API when available, with clipboard/manual fallback behavior.
- Static deployment, no client-side API keys, and no autoplay audio.

## Live site and related links

| Resource | Link |
| --- | --- |
| **Production website** | https://dilux-lane-profile.vercel.app |
| Source repository | https://github.com/diluxlane/Dilux-Lane-Profile |
| Creative portfolio | https://dilux-lane-portfolio.vercel.app |
| Developer portfolio | https://dilux-lane-dev-portfolio.vercel.app |
| Zyberlane | https://zyberlane.com |
| GitHub profile | https://github.com/diluxlane |
| Instagram | https://www.instagram.com/dilux.ln/ |
| Personal Spotify playlist | https://open.spotify.com/playlist/3BLoPATQ9Bk8ZSblfBD8RS |

The Vercel URL above is the **verified production URL**. A future custom domain should only be documented as live after it has been configured and verified.

## Tech stack

| Area | Implementation |
| --- | --- |
| Frontend | Semantic HTML, CSS, and vanilla JavaScript (ES modules) |
| Navigation and animations | Custom orbit geometry, pointer interaction, CSS animations, and `requestAnimationFrame` |
| Audio | HTML Audio and Web Audio APIs; locally hosted OGG, MP3, and WAV assets |
| Playlist | Spotify embedded player and direct playlist URL |
| Typography | Locally hosted **Jost** variable font (SIL OFL 1.1) |
| Testing | Node.js built-in test runner and JavaScript syntax checks |
| Build | Small Node.js static-copy build script; no application dependencies |
| Hosting | Vercel, connected to GitHub `main` |

## Repository structure

```text
src/
  index.html       Website markup and page metadata
  styles.css       Global styling, colors, responsive layout, and rounded UI
  app.js           Navigation, destination rendering, sharing, Spotify embed
  orbit.js         Orbit positioning, index wrapping, and swipe behavior
  sound.js         Opt-in ambient playback and navigation sound effect
  profile.js       Approved public links, portrait, playlist, and audio URLs
  icons.js         Project-specific interface icons
public/assets/
  world.webp                   Original fantasy-world artwork
  portrait.webp                User-provided personal portrait
  mark.svg                     Personal mark
  jost.ttf                     Jost font
  Jost-OFL.txt                 Font license
  cathedral-in-the-forest.ogg  CC0 background music
  cathedral-in-the-forest.mp3  MP3 compatibility version
  orbit-kick.wav               Original short navigation sound
test/
  orbit.test.js     Navigation and approved-profile configuration checks
  sound.test.js     Navigation WAV format, duration, and level checks
.github/workflows/
  ci.yml            Automated syntax checks, tests, and static build
build.mjs           Static build script
package.json        npm scripts
vercel.json         Static build/output configuration
REVIEW.md           Reference comparisons and historical validation notes
```

## Local development

Use a current **Node.js LTS** release. No `npm install` is needed for the current project because it has no application dependencies.

```bash
npm test
npm run build
```

The generated website is in `dist/`. Serve it through HTTP (do not open the HTML as a local `file://` URL), for example:

```bash
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080` in a browser. GitHub Actions runs syntax checks, automated Node tests, and the production build on pushes to `main` and on pull requests.

## Deployment

The repository is connected to **Vercel**, which builds and serves the static output from `dist/` using the settings in [`vercel.json`](vercel.json).

- **Production URL:** https://dilux-lane-profile.vercel.app
- **Production branch:** `main`
- **Build command:** `npm run build`
- **Output directory:** `dist/`
- **Backend and environment variables:** not required by the current site

Changes pushed to the configured production branch trigger the existing Git-based Vercel deployment. The deployment record is not a substitute for testing interactive behavior in a real browser.

## Content and media maintenance

Public URLs and approved personal media are managed in [`src/profile.js`](src/profile.js):

- `portfolios`, `elsewhere`, `socials`, and `contact` hold public links.
- `portrait` references `public/assets/portrait.webp`, a locally hosted 512 × 512 WebP rendition of the full-square avatar from the public [Dilux Lane GitHub profile](https://github.com/diluxlane). It preserves the avatar's wider head-and-upper-body composition instead of zooming in; the original gold circular border and layout are unchanged.
- `playlist.url` and `playlist.embedUrl` hold the personal Spotify playlist links.
- `audioUrl` and `audioMp3Url` reference locally hosted background music.
- The navigation sound is the original `public/assets/orbit-kick.wav`, loaded through `src/sound.js` after sound is enabled.

**Sound behavior:** The website starts silent. Visitors must turn sound on before the ambient track or navigation kick can play. The ambient track loops quietly and fades in/out. Opening the Spotify player stops the ambient music to avoid overlapping playback.

**Documentation rule:** When future website changes add or remove public links, change contact details, update destinations, alter major interactions, replace media, change licenses, or move production hosting, update this README **in the same change**. Keep the deployment URL and credits accurate; never list unapproved accounts, invented features, or unverified test results. Historical comparison details belong in [`REVIEW.md`](REVIEW.md).

## Design references, original work, and credits

- **Visual/interaction reference:** [Renando — Enter My World](https://duingzcreative.site/renando). Its mobile reference screenshots and observed desktop layout informed the presentation. The implementation is **independently written**, not an authorized copy of the original source code or media. No original Renando stylesheet, JavaScript bundle, portrait, background, sound, or social identifiers are included. Exact original animation timings and original audio assets have not been verified.
- **Floating-island world:** Independent AI-generated artwork, converted to WebP for this site. It is not copied from the reference's image pixels.
- **Icons and personal mark:** Original project-specific line icons and monogram.
- **Personal portrait:** Photograph supplied for this personal website; it is not offered as a reusable public asset.
- **Jost font:** From the [Google Fonts upstream Jost release](https://github.com/google/fonts/tree/main/ofl/jost), with the [SIL Open Font License 1.1](public/assets/Jost-OFL.txt) included. The reference uses the Jost family; its exact original font binary is not included.
- **Ambient music:** [Cathedral in the forest (ambient loop)](https://opengameart.org/content/cathedral-in-the-forest-ambient-loop) by **congusbongus**, published under [Creative Commons Zero (CC0 1.0)](https://creativecommons.org/publicdomain/zero/1.0/). The bundled OGG is from the original track (source filename `forest_2_0.ogg`); the 80 kbps MP3 is a compatibility conversion. Credit is retained as provenance even though CC0 does not require attribution.
- **Navigation sound:** Original, programmatically created **180 ms** mono PCM WAV electronic-kick sample. It is not an extracted or recreated audio recording of the reference site.
- **Spotify, GitHub, Instagram, Vercel, and linked portfolio content:** Their respective names, services, embedded materials, and trademarks remain subject to their owners' terms and rights.

## Verification and known limits

- GitHub Actions validates JavaScript syntax, Node tests (including the navigation sample), and the static production build.
- The original reconstruction was compared in Chromium at **320, 390, 768, 1280, and 1440 px**, across all five destinations, and checked for horizontal overflow. See [`REVIEW.md`](REVIEW.md) for the historical screenshot-by-screenshot notes.
- Subsequent content, media, audio, and styling updates were made after the initial visual comparison; the original browser results must not be treated as fresh verification of every later change.
- Remaining device-level checks include actual touch dragging, native sharing, the responsive Spotify full-player fit and browser-dependent track-list/playback behavior, sound level and compatibility, reduced-motion interaction, and a formal screen-reader/Lighthouse audit.

## Copyright and license

**No repository-wide open-source license is granted.** Public visibility does not automatically grant permission to reuse the site's specific design, personal branding, portrait, copy, or original artwork.

Third-party resources retain their own licenses and rights, including **Jost (SIL OFL 1.1)** and the explicitly identified **CC0 music**. License notices for those assets must be respected independently of the repository's overall copyright status.
