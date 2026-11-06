import { indexable, profile } from '../profile';

export function GET() {
  const url = indexable ? `<url><loc>${profile.canonical}/</loc></url>` : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${url}</urlset>\n`);
}
