import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mony',
    short_name: 'Mony',
    description: 'Få koll på vart pengarna tar vägen',
    start_url: '/',
    display: 'standalone',
    background_color: '#6366f1',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
