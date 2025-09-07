import { NativeModules } from 'react-native';
import RNFS from 'react-native-fs';

interface WallpaperModuleInterface {
  setWallpaper(base64Image: string): Promise<string>;
  setLockScreenWallpaper(base64Image: string): Promise<string>;
  setBothWallpapers(base64Image: string): Promise<string>;
}

const { WallpaperModule } = NativeModules;

// Enhanced service with image download capabilities
class WallpaperServiceClass {
  private wallpaperModule: WallpaperModuleInterface = WallpaperModule;

  async setWallpaper(imageUrl: string): Promise<string> {
    const base64Image = await this.downloadAndConvertToBase64(imageUrl);
    return this.wallpaperModule.setWallpaper(base64Image);
  }

  async setLockScreenWallpaper(imageUrl: string): Promise<string> {
    const base64Image = await this.downloadAndConvertToBase64(imageUrl);
    return this.wallpaperModule.setLockScreenWallpaper(base64Image);
  }

  async setBothWallpapers(imageUrl: string): Promise<string> {
    const base64Image = await this.downloadAndConvertToBase64(imageUrl);
    return this.wallpaperModule.setBothWallpapers(base64Image);
  }

  private async downloadAndConvertToBase64(imageUrl: string): Promise<string> {
    try {
      // Create temporary file path
      const tempPath = `${RNFS.CachesDirectoryPath}/temp_wallpaper_${Date.now()}.jpg`;
      
      // Download the image
      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: tempPath,
      }).promise;

      if (downloadResult.statusCode !== 200) {
        throw new Error(`Download failed with status: ${downloadResult.statusCode}`);
      }

      // Convert to base64
      const base64Image = await RNFS.readFile(tempPath, 'base64');
      
      // Clean up temporary file
      await RNFS.unlink(tempPath).catch(() => {
        // Ignore cleanup errors
      });

      return base64Image;
    } catch (error) {
      throw new Error(`Failed to download and process image: ${error}`);
    }
  }
}

export default new WallpaperServiceClass();
