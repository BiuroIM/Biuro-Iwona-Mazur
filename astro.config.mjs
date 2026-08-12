// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: docelowa domena strony — używana przez sitemap i tagi kanoniczne/OG.
  site: 'https://biuro-mazur.pl',

  integrations: [react(), sitemap({ filter: (page) => !page.includes('/panel') })],

  // Fonty pobierane z Fontshare i hostowane lokalnie (self-hosted).
  fonts: [
    {
      provider: fontProviders.fontshare(),
      name: 'Satoshi',
      cssVariable: '--font-satoshi',
      weights: [400, 500, 700, 900],
      styles: ['normal'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontshare(),
      name: 'Clash Grotesk',
      cssVariable: '--font-clash',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
