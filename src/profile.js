const instagram = {
  icon: 'instagram',
  title: 'Instagram',
  detail: '@dilux.ln',
  url: 'https://www.instagram.com/dilux.ln/',
};

const github = {
  icon: 'github',
  title: 'GitHub',
  detail: 'diluxlane',
  url: 'https://github.com/diluxlane',
};

export const profile = {
  portfolios: [
    { icon: 'film', title: 'Creative Portfolio', detail: 'Filmmaking, editing, and visual storytelling', url: 'https://dilux-lane-portfolio.vercel.app' },
    { icon: 'code', title: 'Developer Portfolio', detail: 'Web projects and software experiments', url: 'https://dilux-lane-dev-portfolio.vercel.app' },
  ],
  elsewhere: [
    github,
    { icon: 'globe', title: 'Zyberlane', detail: 'My web, branding, and digital marketing studio', url: 'https://zyberlane.com' },
  ],
  socials: [instagram, github],
  contact: [{ ...instagram, title: 'Say hello on Instagram', detail: 'Send a message to @dilux.ln' }],
  portrait: '/assets/portrait.webp',
  playlist: {
    url: 'https://open.spotify.com/playlist/3BLoPATQ9Bk8ZSblfBD8RS',
    embedUrl: 'https://open.spotify.com/embed/playlist/3BLoPATQ9Bk8ZSblfBD8RS',
  },
  audioUrl: null,
};

export const destinations = [
  { id: 'links', label: 'My links', icon: 'link', title: 'Choose your path', description: 'A few doors into my creative world.' },
  { id: 'socials', label: 'Socials', icon: 'globe', title: 'Stay in the loop', description: 'A little more of me, beyond the work.' },
  { id: 'about', label: 'About me', icon: 'user', title: 'Behind the screen', description: 'The person on the other side of the pixels.' },
  { id: 'playlist', label: 'Playlist', icon: 'wave', title: 'Set the mood', description: 'The soundtrack to my creative hours.' },
  { id: 'contact', label: 'Contact', icon: 'send', title: 'Start a conversation', description: 'Good things start with a simple hello.' },
];
