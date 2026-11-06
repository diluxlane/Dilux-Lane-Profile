import { indexable, profile } from '../profile';

export function GET() {
  const sitemap = indexable ? `Sitemap: ${profile.canonical}/sitemap.xml\n` : '';
  return new Response(`User-agent: *\nAllow: /\n${sitemap}`);
}
