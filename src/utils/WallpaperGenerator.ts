import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface WallpaperConfig {
  colors: string[];
  mood: 'energetic' | 'calm' | 'happy' | 'melancholic';
  style: 'gradient' | 'particles' | 'geometric' | 'organic';
  animated: boolean;
}

export interface GeneratedWallpaper {
  id: string;
  title: string;
  config: WallpaperConfig;
  elements: WallpaperElement[];
  timestamp: number;
}

export interface WallpaperElement {
  type: 'circle' | 'rectangle' | 'line' | 'gradient';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  rotation?: number;
}

class WallpaperGenerator {
  
  // Generate wallpaper based on music mood
  generateFromMood(mood: string, colors: string[]): GeneratedWallpaper {
    const config: WallpaperConfig = {
      colors,
      mood: mood as any,
      style: this.getStyleFromMood(mood),
      animated: true,
    };

    const elements = this.generateElements(config);

    return {
      id: `wallpaper_${Date.now()}`,
      title: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Wallpaper`,
      config,
      elements,
      timestamp: Date.now(),
    };
  }

  // Generate wallpaper from sensor data
  generateFromSensorData(accelerometer: { x: number; y: number; z: number }): GeneratedWallpaper {
    const intensity = Math.sqrt(accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2);
    
    // Determine mood based on movement intensity
    const mood = intensity > 15 ? 'energetic' : intensity > 5 ? 'happy' : 'calm';
    
    // Generate colors based on movement direction
    const colors = this.getColorsFromMovement(accelerometer);

    return this.generateFromMood(mood, colors);
  }

  // Generate random anime-style wallpaper
  generateRandomAnime(): GeneratedWallpaper {
    const moods = ['energetic', 'calm', 'happy', 'melancholic'];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    
    const colorPalettes = {
      energetic: ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4'],
      calm: ['#6C5CE7', '#A29BFE', '#74B9FF', '#00CEC9'],
      happy: ['#FFD93D', '#6BCF7F', '#4ECDC4', '#45B7D1'],
      melancholic: ['#636E72', '#2D3436', '#636E72', '#B2BEC3'],
    };

    const colors = colorPalettes[mood as keyof typeof colorPalettes];
    return this.generateFromMood(mood, colors);
  }

  private getStyleFromMood(mood: string): 'gradient' | 'particles' | 'geometric' | 'organic' {
    const styleMap: Record<string, 'gradient' | 'particles' | 'geometric' | 'organic'> = {
      energetic: 'particles',
      calm: 'gradient',
      happy: 'geometric',
      melancholic: 'organic',
    };
    
    return styleMap[mood] || 'gradient';
  }

  private generateElements(config: WallpaperConfig): WallpaperElement[] {
    const elements: WallpaperElement[] = [];

    switch (config.style) {
      case 'gradient':
        elements.push(...this.generateGradientElements(config));
        break;
      case 'particles':
        elements.push(...this.generateParticleElements(config));
        break;
      case 'geometric':
        elements.push(...this.generateGeometricElements(config));
        break;
      case 'organic':
        elements.push(...this.generateOrganicElements(config));
        break;
    }

    return elements;
  }

  private generateGradientElements(config: WallpaperConfig): WallpaperElement[] {
    return [
      {
        type: 'gradient',
        x: 0,
        y: 0,
        width: width,
        height: height,
        color: config.colors[0],
        opacity: 1,
      },
      {
        type: 'gradient',
        x: 0,
        y: height * 0.3,
        width: width,
        height: height * 0.7,
        color: config.colors[1],
        opacity: 0.7,
      },
    ];
  }

  private generateParticleElements(config: WallpaperConfig): WallpaperElement[] {
    const elements: WallpaperElement[] = [];
    const particleCount = config.mood === 'energetic' ? 50 : 30;

    for (let i = 0; i < particleCount; i++) {
      elements.push({
        type: 'circle',
        x: Math.random() * width,
        y: Math.random() * height,
        width: Math.random() * 20 + 5,
        height: Math.random() * 20 + 5,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    return elements;
  }

  private generateGeometricElements(config: WallpaperConfig): WallpaperElement[] {
    const elements: WallpaperElement[] = [];

    // Generate geometric shapes
    for (let i = 0; i < 10; i++) {
      const isCircle = Math.random() > 0.5;
      elements.push({
        type: isCircle ? 'circle' : 'rectangle',
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.8,
        width: Math.random() * 100 + 50,
        height: Math.random() * 100 + 50,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        opacity: Math.random() * 0.6 + 0.3,
        rotation: Math.random() * 360,
      });
    }

    return elements;
  }

  private generateOrganicElements(config: WallpaperConfig): WallpaperElement[] {
    const elements: WallpaperElement[] = [];

    // Generate flowing, organic shapes
    for (let i = 0; i < 15; i++) {
      elements.push({
        type: 'circle',
        x: Math.random() * width,
        y: Math.random() * height,
        width: Math.random() * 150 + 50,
        height: Math.random() * 150 + 50,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    return elements;
  }

  private getColorsFromMovement(accelerometer: { x: number; y: number; z: number }): string[] {
    // Generate colors based on movement direction and intensity
    const intensity = Math.sqrt(accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2);
    
    if (intensity > 20) {
      return ['#FF6B9D', '#FF8E53', '#4ECDC4', '#45B7D1']; // High energy colors
    } else if (intensity > 10) {
      return ['#6BCF7F', '#4ECDC4', '#45B7D1', '#96CEB4']; // Medium energy colors
    } else {
      return ['#6C5CE7', '#A29BFE', '#74B9FF', '#00CEC9']; // Low energy colors
    }
  }

  // Save generated wallpaper to device storage
  async saveWallpaper(wallpaper: GeneratedWallpaper): Promise<boolean> {
    try {
      // In a real implementation, you would:
      // 1. Render the wallpaper elements to a canvas
      // 2. Save the canvas as an image file
      // 3. Request storage permissions
      // 4. Save to device gallery
      
      console.log('Saving wallpaper:', wallpaper.title);
      return true;
    } catch (error) {
      console.error('Failed to save wallpaper:', error);
      return false;
    }
  }

  // Generate wallpaper preview URL (for display purposes)
  generatePreviewUrl(wallpaper: GeneratedWallpaper): string {
    // In a real implementation, you would render the wallpaper and return the image URI
    // For now, return a placeholder based on the mood
    const moodImages = {
      energetic: 'https://picsum.photos/400/600?random=energetic',
      calm: 'https://picsum.photos/400/600?random=calm',
      happy: 'https://picsum.photos/400/600?random=happy',
      melancholic: 'https://picsum.photos/400/600?random=melancholic',
    };

    return moodImages[wallpaper.config.mood] || 'https://picsum.photos/400/600?random=default';
  }
}

export const wallpaperGenerator = new WallpaperGenerator();
