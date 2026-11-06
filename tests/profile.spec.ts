import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import axe from 'axe-core';

for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
  test(`layout at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dilux Lane.');
    await expect(page.getByRole('img', { name: 'Portrait of Dilux Lane' }))
      .toHaveJSProperty('complete', true);
    expect(await page.getByRole('img', { name: 'Portrait of Dilux Lane' })
      .evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(errors).toEqual([]);
    if (width === 390 || width === 1440) {
      await page.addScriptTag({ content: axe.source });
      const results = await page.evaluate(async () => {
        const browser = window as Window & { axe?: typeof axe };
        return browser.axe!.run({ runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] });
      });
      expect(results.violations).toEqual([]);
      const directory = process.env.SCREENSHOT_DIR;
      if (directory) {
        await mkdir(directory, { recursive: true });
        await page.screenshot({ path: join(directory, `Dilux-Lane-${width === 390 ? 'mobile' : 'desktop'}.png`), fullPage: true });
      }
    }
  });
}

test('keyboard, anchors and outbound destinations', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  await page.getByRole('navigation').getByRole('link', { name: 'Work' }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.getByRole('link', { name: /Creative Portfolio/ })).toHaveAttribute('href', 'https://dilux-lane-portfolio.vercel.app');
  await expect(page.getByRole('link', { name: /Developer Portfolio/ })).toHaveAttribute('href', 'https://dilux-lane-dev-portfolio.vercel.app');
  await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', 'https://github.com/diluxlane');
  await expect(page.getByRole('link', { name: 'Instagram', exact: true })).toHaveAttribute('href', 'https://www.instagram.com/dilux.ln/');
  await expect(page.getByRole('link', { name: 'Message me on Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/dilux.ln/');
  await expect(page.getByRole('link', { name: /YouTube|TikTok/ })).toHaveCount(0);
});

test('missing portrait preserves content and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/images/portrait-*.webp', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('[data-portrait] img')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.locator('html').evaluate((html) => getComputedStyle(html).scrollBehavior)).toBe('auto');
});

test('preview SEO and static assets', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://dilux.zyberlane.com');
  for (const asset of ['/images/share.jpg', '/mark.svg', '/robots.txt', '/sitemap.xml']) {
    expect((await request.get(asset)).ok()).toBeTruthy();
  }
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('<loc>');
});
