// Spotify API Service
export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  previewUrl?: string;
  audioFeatures?: {
    energy: number;
    valence: number;
    danceability: number;
    tempo: number;
  };
}

export interface SpotifyAuthConfig {
  clientId: string;
  redirectUrl: string;
  scopes: string[];
}

class SpotifyService {
  private accessToken: string | null = null;
  private config: SpotifyAuthConfig | null = null;

  // Initialize Spotify configuration
  initialize(config: SpotifyAuthConfig) {
    this.config = config;
  }

  // Authenticate user with Spotify
  async authenticate(): Promise<boolean> {
    try {
      // In a real implementation, you would use react-native-app-auth
      // For now, we'll simulate authentication
      console.log('Authenticating with Spotify...');
      
      // Simulate successful authentication
      this.accessToken = 'mock_access_token';
      return true;
    } catch (error) {
      console.error('Spotify authentication failed:', error);
      return false;
    }
  }

  // Get currently playing track
  async getCurrentTrack(): Promise<SpotifyTrack | null> {
    if (!this.accessToken) {
      console.log('No access token available');
      return null;
    }

    try {
      // In a real implementation, you would make an API call to Spotify
      // For now, we'll return mock data
      const mockTrack: SpotifyTrack = {
        id: '1',
        name: 'Anime Opening Theme',
        artist: 'Anime Artist',
        album: 'Anime Soundtrack Vol. 1',
        imageUrl: 'https://picsum.photos/300/300?random=music',
        previewUrl: undefined,
        audioFeatures: {
          energy: 0.8,
          valence: 0.9,
          danceability: 0.7,
          tempo: 130,
        },
      };

      return mockTrack;
    } catch (error) {
      console.error('Failed to get current track:', error);
      return null;
    }
  }

  // Get user's top tracks
  async getTopTracks(limit: number = 20): Promise<SpotifyTrack[]> {
    if (!this.accessToken) {
      return [];
    }

    try {
      // Mock data for demonstration
      const mockTracks: SpotifyTrack[] = [
        {
          id: '1',
          name: 'Unravel',
          artist: 'TK from Ling tosite sigure',
          album: 'Tokyo Ghoul OST',
          imageUrl: 'https://picsum.photos/300/300?random=1',
          audioFeatures: { energy: 0.9, valence: 0.6, danceability: 0.8, tempo: 140 },
        },
        {
          id: '2',
          name: 'Silhouette',
          artist: 'KANA-BOON',
          album: 'Naruto Shippuden OST',
          imageUrl: 'https://picsum.photos/300/300?random=2',
          audioFeatures: { energy: 0.8, valence: 0.8, danceability: 0.7, tempo: 120 },
        },
        {
          id: '3',
          name: 'Cruel Angel\'s Thesis',
          artist: 'Yoko Takahashi',
          album: 'Neon Genesis Evangelion OST',
          imageUrl: 'https://picsum.photos/300/300?random=3',
          audioFeatures: { energy: 0.7, valence: 0.7, danceability: 0.6, tempo: 110 },
        },
      ];

      return mockTracks.slice(0, limit);
    } catch (error) {
      console.error('Failed to get top tracks:', error);
      return [];
    }
  }

  // Analyze track mood for wallpaper generation
  getMoodFromTrack(track: SpotifyTrack): 'energetic' | 'calm' | 'happy' | 'melancholic' {
    const features = track.audioFeatures;
    
    if (!features) {
      return 'calm';
    }

    if (features.energy > 0.7 && features.valence > 0.7) {
      return 'energetic';
    } else if (features.energy < 0.4 && features.valence > 0.6) {
      return 'happy';
    } else if (features.valence < 0.4) {
      return 'melancholic';
    } else {
      return 'calm';
    }
  }

  // Get colors based on track mood
  getColorsFromMood(mood: string): string[] {
    const colorPalettes = {
      energetic: ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4'],
      calm: ['#6C5CE7', '#A29BFE', '#74B9FF', '#00CEC9'],
      happy: ['#FFD93D', '#6BCF7F', '#4ECDC4', '#45B7D1'],
      melancholic: ['#636E72', '#2D3436', '#636E72', '#B2BEC3'],
    };

    return colorPalettes[mood as keyof typeof colorPalettes] || colorPalettes.calm;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  // Logout user
  logout() {
    this.accessToken = null;
  }
}

export const spotifyService = new SpotifyService();
