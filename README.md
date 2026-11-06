# Dilux Lane

A single-page personal profile connecting Dilux's creative portfolio, developer portfolio, and social profiles. Built with static Astro, TypeScript, and CSS.

## Run locally

Use Node 22.12 or later.

```sh
npm ci
npm run dev
npm run check
npm run build
npx playwright install chromium
npm test
```

The browser suite starts a local server for the compiled site. Run the build before testing. Set `SCREENSHOT_DIR` to an absolute directory to capture the desktop and mobile screenshots during tests.

## Content and assets

- Edit `src/profile.ts` to update copy, links, canonical origin, and the portrait. Optional social entries appear when given a URL.
- Replace the three portrait WebPs and the sharing card in `public/images` when changing the image. Set the portrait to `null` to use the abstract CSS backdrop. A failed image request also falls back to that backdrop.
- Design tokens and breakpoints live in `src/styles/site.css`. The site uses system fonts, native anchor navigation, and a small portrait-error handler.

## Vercel and indexing

The source is intended for Vercel's Astro preset, with `npm run build` and output in `dist/`. Preview and local builds emit a crawler-readable `noindex, nofollow` meta directive. When the planned canonical domain is approved and operational, set `SITE_INDEXABLE=true` in Vercel's production environment and redeploy. The production build then advertises the canonical URL in its sitemap.

## Asset sources

- The portrait was sourced from the owner's [Creative Portfolio](https://github.com/diluxlane/Dilux-Lane-Portfolio/blob/main/public/images/dilux-portrait-1080.webp). It is resized for this site and used in the sharing card.
- GitHub and Instagram marks identify the linked platforms. Their trademarks belong to their respective owners.
- The mobile design reference informed composition only. The reference photograph and phone mockup are absent from the implementation.
