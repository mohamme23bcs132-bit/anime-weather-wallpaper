// API Configuration
// Add your API keys here

export const API_CONFIG = {
  // Spotify API Configuration
  spotify: {
    clientId: 'YOUR_SPOTIFY_CLIENT_ID', // Get from Spotify Developer Dashboard
    clientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET', // Get from Spotify Developer Dashboard
    redirectUrl: 'your-app://spotify-callback',
    scopes: [
      'user-read-currently-playing',
      'user-read-playback-state',
      'playlist-read-private',
      'user-top-read',
    ],
  },

  // Image APIs (Free - No key required)
  images: {
    picsum: 'https://picsum.photos', // No key needed
    unsplash: {
      baseUrl: 'https://api.unsplash.com',
      accessKey: 'YOUR_UNSPLASH_ACCESS_KEY', // Optional - for higher rate limits
    },
    pexels: {
      baseUrl: 'https://api.pexels.com/v1',
      apiKey: 'YOUR_PEXELS_API_KEY', // Optional
    },
  },

  // Anime APIs (Free - No key required)
  anime: {
    jikan: 'https://api.jikan.moe/v4', // MyAnimeList API - No key needed
    anilist: 'https://graphql.anilist.co', // AniList API - No key needed
  },
};

// Environment check
export const isDevelopment = __DEV__;

// API endpoints
export const ENDPOINTS = {
  spotify: {
    auth: 'https://accounts.spotify.com/api/token',
    currentTrack: 'https://api.spotify.com/v1/me/player/currently-playing',
    topTracks: 'https://api.spotify.com/v1/me/top/tracks',
    audioFeatures: (trackId: string) => `https://api.spotify.com/v1/audio-features/${trackId}`,
  },
  
  wallpapers: {
    random: (width: number, height: number) => `${API_CONFIG.images.picsum}/${width}/${height}?random`,
    category: (width: number, height: number, seed: string) => `${API_CONFIG.images.picsum}/${width}/${height}?random=${seed}`,
  },
};

// Rate limiting
export const RATE_LIMITS = {
  spotify: {
    requests: 100,
    window: 60000, // 1 minute
  },
  unsplash: {
    requests: 50,
    window: 3600000, // 1 hour
  },
};
