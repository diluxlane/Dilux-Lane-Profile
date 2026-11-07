# Reference comparison and verification

## Sound update — November 7, 2026

- Added CC0 ambient track **Cathedral in the forest (ambient loop)** by congusbongus, bundled as OGG and 80 kbps MP3 with source and license information in `README.md`.
- The sound toggle now starts music only after an intentional visitor action; music loops at gentle volume, fades in and out, and pauses when the Spotify player is opened.
- Orbit destination changes produce a quiet, original Web Audio synthesized selection tick while sound is enabled. The exact original Renando sound effect could not be verified, so this is not a copy.
- Repository JavaScript checks, four tests, and static build passed in GitHub Actions. Physical-device audio playback, sound quality, native sharing, and Spotify-player interaction still need manual verification.

## Post-review updates — November 7, 2026

The original screenshot comparisons and earlier browser-test results below document the initial rebuild; they predate the latest personal-media update.

- The approved personal portrait now replaces the About me monogram, using `public/assets/portrait.webp`.
- The supplied public Spotify playlist and embed URL are configured; the original playlist-disabled state no longer describes the current source.
- Background sound was disabled at that time; see the later Sound update section above.
- Additional social/contact URLs and real-device/a11y verification remain optional or outstanding as described in `README.md`.
- The automated configuration test has been updated to expect the approved portrait and Spotify URLs instead of `null` values. This documentation edit alone does not claim a new browser or deployment test pass.

The reference is the fantasy link hub at `duingzcreative.site/renando`. Its live desktop view places the identity and vertical orbit on the left and the destination panel on the right. The attached phone captures show the orbit as a shallow horizontal arc above the panel. The live page declares Jost with a Trebuchet fallback, an ivory heading of RGB 244, 240, 230, a Latin variable WOFF2, a WebP scene, a stylesheet, and a JavaScript bundle. Direct browser opening of the stylesheet was blocked. The stylesheet and script internals and the reference’s exact motion timing are unverified.

## Comparison of the five attachments

Coordinates are approximate. Phone chrome was removed from the comparison by using the page’s top edge as the origin and scaling the reference to 390 px wide. Four distinct destinations are shown across the five attachments. Contact was checked in the live page.

| Reference | Corresponding capture | Comparison |
| --- | --- | --- |
| 91191.jpg, My links | mobile-links.jpg | The reference’s active circle is centered near x195/y250, with the rebuild near x195/y255. The rebuild’s card begins near y448 versus y444 in the reference. Both use a gold-bordered feature with a 16:9 artwork area. The red guide thumbnail, creator, and guide copy are replaced by world artwork and Dilux’s creative portfolio. |
| 91192.jpg, Socials | mobile-socials.jpg | The globe is centered in gold and the panel uses the same heading, one-line introduction and ruled icon rows with diagonal arrows. The list has two confirmed accounts, making it shorter. Icons are original line drawings. |
| 91193.jpg, About me | mobile-about.jpg | The active profile icon, creator strip, thin divider and two-tone statement follow the reference hierarchy. A circular monogram stands in for a portrait. The statement and biography describe Dilux’s creative work and AI-assisted development direction. |
| 91194.jpg, Playlist, top | mobile-playlist.jpg | The active waveform, soundtrack introduction, wide world-art card, headphones and gold action remain. The artwork differs, and the load button is disabled with an explanation while a public playlist is unavailable. |
| 91195.jpg, Playlist, scrolled | mobile-playlist-scrolled.jpg | The lower panel retains the gold action, outlined step buttons and small footer. The Spotify row is replaced by an availability message. The screenshot is a separate scroll position of the same destination. |
| Live Contact, no attached screenshot | mobile-contact.jpg and desktop-contact.jpg | The live panel uses a conversation heading, contact rows and an introductory note. The rebuild keeps the order and links only to Dilux’s public Instagram. |

The background is an independently generated floating-island scene. The ruins, rock silhouette, atmospheric density and framing are visibly different. The original artwork’s human figure and the reference’s decorative effects are absent. The horizontal and vertical tracks use responsive curves with newly implemented spring movement. The motion timing, artwork, palette values and font binary are approximations. The font family is verified. Desktop captures are at 1280 px, with the reference desktop browser view observed at approximately 1348 px.

## Checks

- The production build and four Node tests passed. Tests cover destination order and wrapping, orbit geometry, swipe intent, and approved link/media defaults.
- Chromium browser checked all 25 combinations of five destinations and five viewport widths: 320, 390, 768, 1280 and 1440 px. Each combination had the correct number and one selected tab, a tab target at least 43 px wide, and no horizontal overflow.
- The browser verified tab activation, heading and numbering updates, arrow and End keys, both step buttons, wraparound in both directions, mouse dragging on the mobile-width orbit, motion pause and resume, scrolling in a 620 px-tall mobile viewport, and the manual share fallback. The tab, tabpanel, accessible button names and disabled states were checked in the browser. The disabled playlist and sound states were verified.
- The build uses about 155 KB of uncompressed page assets, including a 71 KB WebP scene and a 53 KB local variable font. There are no application dependencies, external runtime scripts, or autoplay. Browser log inspection found an extension error and no application errors in the tested flow.
- Physical touch, the native share sheet, playback and playlist-provider failures, and a formal Lighthouse or screen-reader audit were outside this verification. The OS reduced-motion branch is implemented but was not exercised by the browser session. Links use direct approved destinations.
