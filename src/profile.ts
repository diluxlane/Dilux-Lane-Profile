type Social = { name: string; handle: string; url?: string; icon: 'github' | 'instagram' | 'youtube' | 'tiktok' | 'arrow' };

const profiles: Social[] = [
  { name: 'GitHub', handle: '@diluxlane', url: 'https://github.com/diluxlane', icon: 'github' },
  { name: 'Instagram', handle: '@dilux.ln', url: 'https://www.instagram.com/dilux.ln/', icon: 'instagram' },
  { name: 'YouTube', handle: '', icon: 'youtube' },
  { name: 'TikTok', handle: '', icon: 'tiktok' },
];

export const profile = {
  name: 'Dilux Lane',
  canonical: 'https://dilux.zyberlane.com',
  title: 'Dilux Lane — Student Developer & Visual Creator',
  description: 'The personal website of Dilux Lane, a Sri Lankan student developer and visual creator. Explore my creative and developer portfolios.',
  role: 'Student developer & visual creator',
  introduction: 'I build for the web and tell stories through film, editing, and photography.',
  about: [
    'I’m Dilux, a student developer and the founder of Zyberlane. I build practical web projects with AI assistance, then test and refine them as I learn.',
    'Away from the code editor, I’m drawn to filmmaking, video editing, and photography. I’m also learning about systems engineering and automation.',
  ],
  portrait: {
    src: '/images/portrait-768.webp',
    srcset: '/images/portrait-480.webp 480w, /images/portrait-768.webp 768w, /images/portrait-1080.webp 1080w',
    alt: 'Portrait of Dilux Lane',
  } as { src: string; srcset: string; alt: string } | null,
  portfolios: [
    { id: 'creative', number: '01', type: 'Film & photography', title: 'Creative Portfolio', description: 'Cinematic edits, videography, photography, and visual storytelling.', action: 'Explore creative work', url: 'https://dilux-lane-portfolio.vercel.app' },
    { id: 'developer', number: '02', type: 'Web & software', title: 'Developer Portfolio', description: 'Websites, apps, and experiments in AI-assisted development.', action: 'Explore developer work', url: 'https://dilux-lane-dev-portfolio.vercel.app' },
  ],
  socials: profiles.filter((social): social is Social & { url: string } => Boolean(social.url)),
  contact: 'https://www.instagram.com/dilux.ln/',
  organization: 'https://zyberlane.com',
};

export const indexable = process.env.VERCEL_ENV === 'production' &&
  process.env.SITE_INDEXABLE === 'true';
