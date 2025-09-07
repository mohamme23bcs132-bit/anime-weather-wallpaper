import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Linking,
  Share,
  ActivityIndicator,
  FlatList,
  TextInput,
  Animated,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { NativeModules } from 'react-native';

const { width } = Dimensions.get('window');

// Kitsu API endpoints
const KITSU_API_BASE = 'https://kitsu.io/api/edge/anime';
const KITSU_SEARCH = (query: string) => `${KITSU_API_BASE}?filter[text]=${encodeURIComponent(query)}&page[limit]=20`;
const KITSU_CATEGORIES = (category: string) => `${KITSU_API_BASE}?filter[categories]=${category}&page[limit]=15`;
const KITSU_TRENDING = `${KITSU_API_BASE}?page[limit]=20&sort=popularityRank`;

interface AnimeAttributes {
  posterImage: {
    small: string;
    medium: string;
    large: string;
    original: string;
  };
  canonicalTitle: string;
  synopsis: string;
  averageRating: string;
  startDate: string;
}

interface AnimeItem {
  id: string;
  attributes: AnimeAttributes;
}

// Anime wallpaper categories
const animeCategories = [
  { name: 'Popular', icon: '🔥', apiFilter: 'trending' },
  { name: 'Action', icon: '⚔️', apiFilter: 'action' },
  { name: 'Romance', icon: '💕', apiFilter: 'romance' },
  { name: 'Fantasy', icon: '🧙‍♂️', apiFilter: 'fantasy' },
  { name: 'Slice of Life', icon: '🌸', apiFilter: 'slice-of-life' },
  { name: 'Sci-Fi', icon: '🚀', apiFilter: 'sci-fi' },
];

const AnimeWallpaperScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [animeWallpapers, setAnimeWallpapers] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteAnimes, setFavoriteAnimes] = useState<AnimeItem[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<AnimeItem[]>([]);
  const [recommendationType, setRecommendationType] = useState<'similar' | 'mood' | 'time' | 'event'>('similar');
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Double-tap to favorite states
  const [lastTap, setLastTap] = useState<{ [key: string]: number }>({});
  const [heartAnimations, setHeartAnimations] = useState<{ [key: string]: Animated.Value }>({});
  const [showHeartAnimation, setShowHeartAnimation] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchAnimeWallpapers();
    loadFavorites();
    checkStoragePermissions();
    // Load initial AI recommendations
    getAIRecommendations('similar');
  }, []);

  const checkStoragePermissions = async () => {
    if (Platform.OS !== 'android') return;

    try {
      // Check if we already have permission
      const androidVersion = Platform.Version;
      let hasPermission = false;
      let debugInfo = `Android Version: ${androidVersion}\n`;

      if (androidVersion >= 33) {
        const permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        hasPermission = permission;
        debugInfo += `READ_MEDIA_IMAGES: ${permission ? '✅ Granted' : '❌ Denied'}\n`;
      } else {
        const writePermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        const readPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        hasPermission = writePermission && readPermission;
        debugInfo += `WRITE_EXTERNAL_STORAGE: ${writePermission ? '✅ Granted' : '❌ Denied'}\n`;
        debugInfo += `READ_EXTERNAL_STORAGE: ${readPermission ? '✅ Granted' : '❌ Denied'}\n`;
      }

      debugInfo += `Overall Permission Status: ${hasPermission ? '✅ GRANTED' : '❌ DENIED'}`;

      // Log permission status for debugging
      console.log(`📱 Storage permissions check: ${hasPermission ? '✅ Granted' : '❌ Not granted'}`);
      console.log('Debug Info:', debugInfo);
      
      if (!hasPermission) {
        console.log('ℹ️ Storage permissions not yet granted - requesting immediately');
        
        // Show debug dialog first (optional - can be commented out for production)
        Alert.alert(
          '🔍 Debug: Permission Status',
          debugInfo + '\n\nWould you like to proceed with permission request?',
          [
            { text: 'Show Details', onPress: () => showPermissionDetails(debugInfo) },
            { text: 'Request Permissions', onPress: () => requestAllPermissions() }
          ]
        );
      } else {
        // Show success debug dialog
        Alert.alert(
          '✅ Debug: Permissions OK',
          debugInfo,
          [{ text: 'Great!' }]
        );
      }
    } catch (error) {
      const errorMsg = `Error checking permissions: ${error}`;
      console.warn(errorMsg);
      
      // Show error dialog
      Alert.alert(
        '❌ Debug: Permission Check Failed',
        errorMsg + '\n\nThis might indicate a system issue or app configuration problem.',
        [
          { text: 'OK' },
          { text: 'Try Request Anyway', onPress: () => requestAllPermissions() }
        ]
      );
    }
  };

  const showPermissionDetails = (debugInfo: string) => {
    Alert.alert(
      '🔍 Permission Debug Details',
      debugInfo + '\n\nNext steps:\n• Tap "Request" to ask for permissions\n• Check Android settings if issues persist\n• Restart app after granting permissions',
      [
        { text: 'Cancel' },
        { text: 'Request Permissions', onPress: () => requestAllPermissions() }
      ]
    );
  };

  // Favorites Management Functions
  const FAVORITES_KEY = '@anime_favorites';
  const FAVORITE_ANIMES_KEY = '@favorite_animes_data';

  const loadFavorites = async () => {
    try {
      const favoritesData = await AsyncStorage.getItem(FAVORITES_KEY);
      const favoriteAnimesData = await AsyncStorage.getItem(FAVORITE_ANIMES_KEY);
      
      if (favoritesData) {
        setFavorites(JSON.parse(favoritesData));
      }
      if (favoriteAnimesData) {
        setFavoriteAnimes(JSON.parse(favoriteAnimesData));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites: string[], newFavoriteAnimes: AnimeItem[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      await AsyncStorage.setItem(FAVORITE_ANIMES_KEY, JSON.stringify(newFavoriteAnimes));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleFavorite = async (anime: AnimeItem) => {
    const isFavorited = favorites.includes(anime.id);
    let newFavorites: string[];
    let newFavoriteAnimes: AnimeItem[];

    if (isFavorited) {
      // Remove from favorites
      newFavorites = favorites.filter(id => id !== anime.id);
      newFavoriteAnimes = favoriteAnimes.filter(item => item.id !== anime.id);
      Alert.alert('❤️ Removed', `${anime.attributes.canonicalTitle} removed from favorites`);
    } else {
      // Add to favorites
      newFavorites = [...favorites, anime.id];
      newFavoriteAnimes = [...favoriteAnimes, anime];
      Alert.alert('⭐ Added', `${anime.attributes.canonicalTitle} added to favorites`);
    }

    setFavorites(newFavorites);
    setFavoriteAnimes(newFavoriteAnimes);
    await saveFavorites(newFavorites, newFavoriteAnimes);
  };

  const isFavorited = (animeId: string) => favorites.includes(animeId);

  // Double-tap to favorite with heart animation
  const handleDoubleTap = (anime: AnimeItem) => {
    const now = Date.now();
    const animeId = anime.id;
    
    if (now - (lastTap[animeId] || 0) < 300) {
      // Double tap detected!
      toggleFavoriteWithAnimation(anime);
    }
    
    setLastTap(prev => ({ ...prev, [animeId]: now }));
  };

  const initializeHeartAnimation = (animeId: string) => {
    if (!heartAnimations[animeId]) {
      setHeartAnimations(prev => ({
        ...prev,
        [animeId]: new Animated.Value(0)
      }));
    }
  };

  const toggleFavoriteWithAnimation = async (anime: AnimeItem) => {
    const animeId = anime.id;
    const wasFavorited = favorites.includes(animeId);
    
    // Initialize animation if not exists
    initializeHeartAnimation(animeId);
    
    // Show heart animation for adding to favorites
    if (!wasFavorited) {
      setShowHeartAnimation(prev => ({ ...prev, [animeId]: true }));
      
      // Animate the heart
      const heartAnim = heartAnimations[animeId] || new Animated.Value(0);
      
      Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHeartAnimation(prev => ({ ...prev, [animeId]: false }));
      });
    }
    
    // Toggle the favorite
    await toggleFavorite(anime);
  };

  const renderHeartAnimation = (animeId: string) => {
    if (!showHeartAnimation[animeId]) return null;
    
    const heartAnim = heartAnimations[animeId] || new Animated.Value(0);
    
    return (
      <Animated.View
        style={[
          styles.heartAnimation,
          {
            opacity: heartAnim,
            transform: [
              {
                scale: heartAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.heartAnimationEmoji}>❤️</Text>
      </Animated.View>
    );
  };

  const fetchAnimeWallpapers = async () => {
    setLoading(true);
    try {
      const response = await fetch(KITSU_TRENDING);
      const data = await response.json();
      setAnimeWallpapers(data.data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch anime wallpapers. Please try again.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryWallpapers = async (category: string) => {
    setSelectedCategory(category);
    setLoading(true);
    setSearchQuery(''); // Clear search when selecting category
    try {
      let url = KITSU_TRENDING;
      
      if (category !== 'Popular') {
        const categoryQuery = animeCategories.find(cat => cat.name === category)?.apiFilter || 'action';
        url = KITSU_CATEGORIES(categoryQuery);
      }

      const response = await fetch(url);
      const data = await response.json();
      setAnimeWallpapers(data.data || []);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch category wallpapers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(KITSU_SEARCH(query));
      const data = await response.json();
      setSearchResults(data.data || []);
      
      // Add to recent searches (max 5)
      const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updatedSearches);
    } catch (error) {
      Alert.alert('Search Error', 'Could not search anime. Please try again.');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit permission for saving to Photos
    }

    try {
      const androidVersion = Platform.Version;
      
      if (androidVersion >= 33) {
        // Android 13+ uses scoped storage and READ_MEDIA_IMAGES
        const permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        const granted = await PermissionsAndroid.request(permission, {
          title: 'Media Access Permission',
          message: 'This app needs access to save anime wallpapers to your Photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow',
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android 12 and below
        const writePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs storage access to download and save anime wallpapers to your gallery.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow',
          },
        );
        
        const readPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required', 
            message: 'This app needs storage access to save wallpapers to your gallery.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow',
          },
        );
        
        return writePermission === PermissionsAndroid.RESULTS.GRANTED && 
               readPermission === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  const saveImageToGallery = async (imageUrl: string, title: string) => {
    try {
      // First, ask user for confirmation
      const userConfirmed = await new Promise((resolve) => {
        Alert.alert(
          '📥 Download Wallpaper',
          `Download "${title}" to your device gallery?`,
          [
            { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Download', onPress: () => resolve(true) }
          ]
        );
      });

      if (!userConfirmed) return;

      // Request storage permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          '❌ Permission Required',
          'Storage permission is needed to save wallpapers to your gallery. Please grant permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'android') {
                  Linking.openURL('app-settings:');
                }
              }
            }
          ]
        );
        return;
      }

      // Show progress indicator
      Alert.alert(
        '⏳ Downloading...',
        `Downloading "${title}"...\nThis may take a few seconds.`,
        [{ text: 'OK' }]
      );

      // Create a clean filename
      const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const timestamp = Date.now();
      const fileExtension = '.jpg';
      const fileName = `AnimeWallpaper_${cleanTitle}_${timestamp}${fileExtension}`;

      // Define download path
      let downloadPath: string;
      if (Platform.OS === 'ios') {
        downloadPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      } else {
        // Android - save to Pictures/AnimeWallpapers
        const dirPath = `${RNFS.PicturesDirectoryPath}/AnimeWallpapers`;
        downloadPath = `${dirPath}/${fileName}`;
        
        // Create directory if it doesn't exist
        const dirExists = await RNFS.exists(dirPath);
        if (!dirExists) {
          await RNFS.mkdir(dirPath);
        }
      }

      // Download the image with progress tracking
      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: downloadPath,
        background: true,
        discretionary: true,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`Download progress: ${progress.toFixed(1)}%`);
        },
      }).promise;

      if (downloadResult.statusCode === 200) {
        // Success - file downloaded
        const alertButtons = [{ text: 'Awesome! ✨' }] as any[];
        
        if (Platform.OS === 'android') {
          alertButtons.push({
            text: 'Open Gallery 📱',
            onPress: () => {
              // Try to open gallery app
              Linking.openURL('content://media/internal/images/media').catch(() => {
                // Fallback to file manager
                Linking.openURL('file://' + RNFS.PicturesDirectoryPath + '/AnimeWallpapers');
              });
            }
          } as any);
        }
        
        Alert.alert(
          '✅ Download Complete!',
          `"${title}" has been saved successfully!\n\n📍 Location: ${Platform.OS === 'android' ? 'Gallery > Pictures > AnimeWallpapers' : 'Photos App'}\n\n💡 Tip: Long press the image in your gallery to set it as wallpaper!`,
          alertButtons
        );
        
        console.log('✅ File saved to:', downloadPath);
      } else {
        throw new Error(`Download failed with status ${downloadResult.statusCode}`);
      }

    } catch (error) {
      console.error('❌ Error saving image:', error);
      
      // Provide fallback options
      Alert.alert(
        '❌ Download Failed',
        'Sorry, there was an error downloading the image. Would you like to try an alternative method?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open in Browser 🌐', 
            onPress: () => {
              Linking.openURL(imageUrl);
              setTimeout(() => {
                Alert.alert(
                  '💡 Manual Save Instructions',
                  'In your browser:\n1. Long press the image\n2. Select "Download image" or "Save image"\n3. The image will be saved to your Downloads or Gallery',
                  [{ text: 'Got it!' }]
                );
              }, 1000);
            }
          },
          {
            text: 'Share Image 📤',
            onPress: () => {
              Share.share({
                message: `Check out this awesome anime wallpaper: ${title}!`,
                url: imageUrl,
              });
            }
          }
        ]
      );
    }
  };

  const requestAllPermissions = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      // For Android 13+ (API 33+), we need different permissions
      const androidVersion = Platform.Version;
      let permissions = [];
      let debugMsg = `Requesting permissions for Android ${androidVersion}\n`;
      
      if (androidVersion >= 33) {
        permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        ];
        debugMsg += 'Permissions: READ_MEDIA_IMAGES';
      } else {
        permissions = [
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ];
        debugMsg += 'Permissions: READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE';
      }

      // Show explanation first
      return new Promise((resolve) => {
        Alert.alert(
          '🔐 Permissions Required',
          'This app needs storage permissions to:\n\n📥 Download anime wallpapers\n🖼️ Set wallpapers directly\n💾 Save images to your gallery\n\nPlease allow the permissions in the next dialog.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { 
              text: 'Continue', 
              onPress: async () => {
                try {
                  console.log('Requesting permissions:', permissions);
                  const results = await PermissionsAndroid.requestMultiple(permissions);
                  console.log('Permission results:', results);
                  
                  // Check if all permissions were granted
                  const allGranted = Object.values(results).every(
                    result => result === PermissionsAndroid.RESULTS.GRANTED
                  );

                  // Create detailed result message
                  let resultMsg = debugMsg + '\n\nResults:\n';
                  Object.entries(results).forEach(([permission, result]) => {
                    const permName = permission.split('.').pop() || permission;
                    resultMsg += `• ${permName}: ${result === PermissionsAndroid.RESULTS.GRANTED ? '✅ Granted' : '❌ ' + result}\n`;
                  });

                  if (!allGranted) {
                    Alert.alert(
                      '❌ Permissions Debug',
                      resultMsg + '\nWithout storage permissions, wallpaper features won\'t work.',
                      [
                        { text: 'Show Details', onPress: () => {
                          Alert.alert('Permission Details', `${resultMsg}\n\nTo fix:\n1. Go to Settings\n2. Apps → Weather\n3. Permissions\n4. Enable Storage/Media permissions`);
                        }},
                        { text: 'OK', style: 'default', onPress: () => resolve(false) },
                        { 
                          text: 'Open Settings', 
                          onPress: () => {
                            Linking.openURL('package:com.weather');
                            resolve(false);
                          }
                        }
                      ]
                    );
                  } else {
                    Alert.alert(
                      '✅ Permissions Granted!',
                      resultMsg + '\nGreat! You can now download and set anime wallpapers directly from the app.',
                      [{ text: 'Awesome!', onPress: () => resolve(true) }]
                    );
                  }
                } catch (requestError) {
                  Alert.alert(
                    '❌ Permission Request Error',
                    `Failed to request permissions: ${requestError}\n\nThis might be due to:\n• Android system restrictions\n• App configuration issues\n• Device policy restrictions`,
                    [{ text: 'OK', onPress: () => resolve(false) }]
                  );
                }
              }
            }
          ]
        );
      });
    } catch (err) {
      console.warn('Permission request error:', err);
      Alert.alert(
        '❌ Permission System Error',
        `Error in permission system: ${err}\n\nThis indicates a deeper issue with the app or Android system.`,
        [{ text: 'OK' }]
      );
      return false;
    }
  };

  const hasStoragePermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const androidVersion = Platform.Version;
      
      if (androidVersion >= 33) {
        return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      } else {
        const writePermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        const readPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        return writePermission && readPermission;
      }
    } catch (error) {
      console.warn('Error checking permissions:', error);
      return false;
    }
  };

  const setWallpaperFromUrl = async (imageUrl: string) => {
    try {
      // Check and request storage permission (Android only)
      if (Platform.OS === 'android') {
        const currentlyHasPermissions = await hasStoragePermissions();
        
        if (!currentlyHasPermissions) {
          Alert.alert(
            '🔐 Permission Required',
            'Storage permission is needed to download and set wallpapers. Grant permission to continue.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Grant Permission', 
                onPress: async () => {
                  const hasPermissions = await requestAllPermissions();
                  if (hasPermissions) {
                    // Retry the wallpaper setting after getting permissions
                    setTimeout(() => setWallpaperFromUrl(imageUrl), 1000);
                  }
                }
              }
            ]
          );
          return;
        }
      }

      // Show progress indicator
      Alert.alert(
        '📥 Downloading...',
        'Downloading and preparing wallpaper...',
        [{ text: 'OK' }]
      );

      // Download image and convert to base64
      const downloadPath = `${RNFS.CachesDirectoryPath}/temp_wallpaper.jpg`;
      
      console.log('Downloading from:', imageUrl);
      console.log('Saving to:', downloadPath);
      
      const downloadResult = await RNFS.downloadFile({ 
        fromUrl: imageUrl, 
        toFile: downloadPath 
      }).promise;
      
      console.log('Download result:', downloadResult);
      
      if (downloadResult.statusCode !== 200) {
        throw new Error(`Download failed with status: ${downloadResult.statusCode}`);
      }

      // Check if file exists
      const fileExists = await RNFS.exists(downloadPath);
      console.log('File exists after download:', fileExists);
      
      if (!fileExists) {
        throw new Error('Downloaded file not found');
      }

      // Get file info
      const fileInfo = await RNFS.stat(downloadPath);
      console.log('File info:', fileInfo);
      
      if (fileInfo.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Read as base64
      console.log('Reading file as base64...');
      const base64Image = await RNFS.readFile(downloadPath, 'base64');
      
      if (!base64Image || base64Image.length === 0) {
        throw new Error('Failed to convert image to base64');
      }

      console.log('Base64 length:', base64Image.length);

      // Call native module
      console.log('Calling WallpaperModule...');
      const result = await NativeModules.WallpaperModule.setWallpaper(base64Image);
      
      console.log('Wallpaper set result:', result);
      
      Alert.alert(
        '✅ Success!',
        'Wallpaper has been set successfully!',
        [{ text: 'Awesome!' }]
      );

      // Clean up temporary file
      await RNFS.unlink(downloadPath).catch(e => console.log('Cleanup error:', e));

    } catch (error) {
      console.error('Error in setWallpaperFromUrl:', error);
      
      const err = error as any;
      let errorMessage = 'Unknown error occurred';
      let troubleshooting = '';
      
      if (err.message?.includes('Permission')) {
        errorMessage = 'Permission denied';
        troubleshooting = '• Enable storage permissions in Settings\n• Restart the app after granting permissions';
      } else if (err.message?.includes('Download failed')) {
        errorMessage = 'Failed to download image';
        troubleshooting = '• Check your internet connection\n• Try a different image\n• Check if URL is accessible';
      } else if (err.message?.includes('base64')) {
        errorMessage = 'Failed to process image';
        troubleshooting = '• Image might be corrupted\n• Try a different image format\n• Check available storage space';
      } else if (err.message?.includes('WallpaperModule')) {
        errorMessage = 'Failed to set wallpaper';
        troubleshooting = '• Check SET_WALLPAPER permission\n• Try restarting the app\n• Check Android wallpaper settings';
      } else {
        errorMessage = err.message || 'Unknown error';
        troubleshooting = '• Try restarting the app\n• Check device permissions\n• Ensure sufficient storage space';
      }
      
      Alert.alert(
        '❌ Error Setting Wallpaper',
        `${errorMessage}\n\nTroubleshooting:\n${troubleshooting}\n\nTechnical details:\n${err.message || 'No additional details'}`,
        [
          { text: 'OK' },
          { 
            text: 'Try Again', 
            onPress: () => setWallpaperFromUrl(imageUrl)
          }
        ]
      );
    }
  };

  const setAsWallpaper = (imageUrl: string, title: string) => {
    Alert.alert(
      '🖼️ Set Wallpaper',
      `Would you like to set "${title}" as your wallpaper directly?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Wallpaper',
          onPress: () => setWallpaperFromUrl(imageUrl)
        }
      ]
    );
  };

  const showDownloadHelp = () => {
    Alert.alert(
      '📥 About Downloads',
      'How downloading works:\n\n✅ We ask for your permission first\n� Images are saved to Pictures/AnimeWallpapers\n🖼️ You can then set them as wallpapers from your gallery\n🔒 All downloads are stored locally on your device',
      [
        { text: 'Got it!', style: 'default' },
        { 
          text: 'Try Download', 
          onPress: () => {
            if (animeWallpapers.length > 0) {
              const firstAnime = animeWallpapers[0];
              saveImageToGallery(firstAnime.attributes.posterImage.original, firstAnime.attributes.canonicalTitle);
            }
          }
        }
      ]
    );
  };

  // AI Recommendation Engine
  const getAIRecommendations = async (type: 'similar' | 'mood' | 'time' | 'event' = 'similar') => {
    setIsLoadingRecommendations(true);
    setRecommendationType(type);
    
    try {
      let apiUrl = '';
      let recommendationTitle = '';
      
      switch (type) {
        case 'similar':
          // Based on user's favorite genres
          const userFavoriteGenres = await getUserFavoriteGenres();
          if (userFavoriteGenres.length > 0) {
            const randomGenre = userFavoriteGenres[Math.floor(Math.random() * userFavoriteGenres.length)];
            apiUrl = KITSU_CATEGORIES(randomGenre);
          } else {
            apiUrl = KITSU_TRENDING;
          }
          break;
          
        case 'mood':
          // Based on time of day and mood
          const hour = new Date().getHours();
          let moodGenre = '';
          if (hour < 6) {
            moodGenre = 'slice-of-life'; // Early morning - calm
          } else if (hour < 12) {
            moodGenre = 'adventure'; // Morning - energetic
          } else if (hour < 18) {
            moodGenre = 'comedy'; // Afternoon - uplifting
          } else {
            moodGenre = 'romance'; // Evening - relaxing
          }
          apiUrl = KITSU_CATEGORIES(moodGenre);
          break;
          
        case 'time':
          // Based on current time and season
          const month = new Date().getMonth();
          let seasonGenre = '';
          if (month >= 2 && month <= 4) {
            seasonGenre = 'school'; // Spring - school anime
          } else if (month >= 5 && month <= 7) {
            seasonGenre = 'sports'; // Summer - sports anime  
          } else if (month >= 8 && month <= 10) {
            seasonGenre = 'supernatural'; // Fall - mysterious
          } else {
            seasonGenre = 'fantasy'; // Winter - cozy fantasy
          }
          apiUrl = KITSU_CATEGORIES(seasonGenre);
          break;
          
        case 'event':
          // Based on upcoming events/holidays
          const today = new Date();
          const valentine = new Date(today.getFullYear(), 1, 14);
          const christmas = new Date(today.getFullYear(), 11, 25);
          const halloween = new Date(today.getFullYear(), 9, 31);
          
          const daysTilValentine = Math.ceil((valentine.getTime() - today.getTime()) / (1000 * 3600 * 24));
          const daysTilChristmas = Math.ceil((christmas.getTime() - today.getTime()) / (1000 * 3600 * 24));
          const daysTilHalloween = Math.ceil((halloween.getTime() - today.getTime()) / (1000 * 3600 * 24));
          
          if (daysTilValentine > 0 && daysTilValentine <= 7) {
            apiUrl = KITSU_CATEGORIES('romance');
          } else if (daysTilHalloween > 0 && daysTilHalloween <= 7) {
            apiUrl = KITSU_CATEGORIES('horror');
          } else if (daysTilChristmas > 0 && daysTilChristmas <= 14) {
            apiUrl = KITSU_CATEGORIES('slice-of-life');
          } else {
            apiUrl = KITSU_TRENDING;
          }
          break;
      }
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        setRecommendations(data.data.slice(0, 8));
        setShowRecommendations(true);
        
        // Save recommendation interaction for learning
        await saveRecommendationInteraction(type);
      }
      
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      Alert.alert('Error', 'Unable to load recommendations. Please try again.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };
  
  const getUserFavoriteGenres = async (): Promise<string[]> => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITE_ANIMES_KEY);
      if (stored) {
        const favoriteAnimes = JSON.parse(stored);
        // Extract common genres from favorites (simplified)
        const genres = ['action', 'romance', 'fantasy', 'adventure', 'comedy'];
        return genres.slice(0, Math.min(3, favoriteAnimes.length));
      }
      return [];
    } catch (error) {
      return [];
    }
  };
  
  const saveRecommendationInteraction = async (type: string) => {
    try {
      const interaction = {
        type,
        timestamp: new Date().toISOString(),
        viewed: true
      };
      
      const stored = await AsyncStorage.getItem('recommendation_history');
      const history = stored ? JSON.parse(stored) : [];
      history.unshift(interaction);
      
      // Keep only last 50 interactions
      const limitedHistory = history.slice(0, 50);
      await AsyncStorage.setItem('recommendation_history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving recommendation interaction:', error);
    }
  };

  const getRecommendationTitle = () => {
    const hour = new Date().getHours();
    switch (recommendationType) {
      case 'similar':
        return '🎯 Recommended for You';
      case 'mood':
        if (hour < 6) return '🌅 Morning Calm';
        if (hour < 12) return '⚡ Morning Energy';
        if (hour < 18) return '😄 Afternoon Joy';
        return '🌙 Evening Relaxation';
      case 'time':
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return '🌸 Spring Selection';
        if (month >= 5 && month <= 7) return '☀️ Summer Vibes';
        if (month >= 8 && month <= 10) return '🍂 Autumn Picks';
        return '❄️ Winter Collection';
      case 'event':
        return '🎉 Special Occasion';
      default:
        return '🤖 AI Recommendations';
    }
  };

  const renderAnimeItem = ({ item }: { item: AnimeItem }) => (
    <View style={styles.animeCard}>
      <TouchableOpacity 
        onPress={() => {
          handleDoubleTap(item);
          setAsWallpaper(item.attributes.posterImage.original, item.attributes.canonicalTitle);
        }}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.attributes.posterImage.large || item.attributes.posterImage.medium }}
          style={styles.animeImage}
          resizeMode="cover"
        />
        
        {/* Heart Animation Overlay */}
        {renderHeartAnimation(item.id)}
        
        <View style={styles.animeOverlay}>
          <View style={styles.animeInfo}>
            <Text style={styles.animeTitle} numberOfLines={2}>
              {item.attributes.canonicalTitle}
            </Text>
            {item.attributes.averageRating && (
              <Text style={styles.animeRating}>
                ⭐ {parseFloat(item.attributes.averageRating).toFixed(1)}/10
              </Text>
            )}
          </View>
        </View>
        
        {/* Favorite Heart Button */}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item)}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorited(item.id) ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, { flex: 1, marginRight: 4 }]}
          onPress={() => setAsWallpaper(item.attributes.posterImage.original, item.attributes.canonicalTitle)}
        >
          <Text style={styles.buttonText}>🖼️ Set Wallpaper</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { flex: 1, marginLeft: 4, backgroundColor: '#4ECDC4' }]}
          onPress={() => saveImageToGallery(item.attributes.posterImage.original, item.attributes.canonicalTitle)}
        >
          <Text style={styles.buttonText}>📥 Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const styles = createStyles(isDarkMode);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🎌 Anime Wallpapers</Text>
          <Text style={styles.subtitle}>High-quality anime artwork for your device</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchAnimeWallpapers}>
          <Text style={{ fontSize: 24 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search anime titles, characters..."
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            onSubmitEditing={() => handleSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Recent Searches */}
        {searchQuery.length === 0 && recentSearches.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentSearches}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            <Text style={styles.recentSearchesLabel}>Recent: </Text>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentSearchItem}
                onPress={() => {
                  setSearchQuery(search);
                  handleSearch(search);
                }}
              >
                <Text style={styles.recentSearchText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* AI Recommendations Section */}
      {searchQuery.length === 0 && (
        <View style={styles.recommendationsSection}>
          <View style={styles.recommendationsHeader}>
            <Text style={styles.recommendationsTitle}>🤖 AI Recommendations</Text>
            <TouchableOpacity 
              style={styles.recommendationsToggle}
              onPress={() => setShowRecommendations(!showRecommendations)}
            >
              <Text style={styles.recommendationsToggleText}>
                {showRecommendations ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showRecommendations && (
            <>
              {/* Recommendation Type Buttons */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.recommendationTypes}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                <TouchableOpacity
                  style={[styles.recommendationType, recommendationType === 'similar' && styles.recommendationTypeActive]}
                  onPress={() => getAIRecommendations('similar')}
                >
                  <Text style={styles.recommendationTypeIcon}>🎯</Text>
                  <Text style={[styles.recommendationTypeText, recommendationType === 'similar' && styles.recommendationTypeTextActive]}>
                    For You
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.recommendationType, recommendationType === 'mood' && styles.recommendationTypeActive]}
                  onPress={() => getAIRecommendations('mood')}
                >
                  <Text style={styles.recommendationTypeIcon}>😊</Text>
                  <Text style={[styles.recommendationTypeText, recommendationType === 'mood' && styles.recommendationTypeTextActive]}>
                    Mood
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.recommendationType, recommendationType === 'time' && styles.recommendationTypeActive]}
                  onPress={() => getAIRecommendations('time')}
                >
                  <Text style={styles.recommendationTypeIcon}>🕐</Text>
                  <Text style={[styles.recommendationTypeText, recommendationType === 'time' && styles.recommendationTypeTextActive]}>
                    Seasonal
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.recommendationType, recommendationType === 'event' && styles.recommendationTypeActive]}
                  onPress={() => getAIRecommendations('event')}
                >
                  <Text style={styles.recommendationTypeIcon}>🎉</Text>
                  <Text style={[styles.recommendationTypeText, recommendationType === 'event' && styles.recommendationTypeTextActive]}>
                    Events
                  </Text>
                </TouchableOpacity>
              </ScrollView>
              
              {/* Recommendations Content */}
              {isLoadingRecommendations ? (
                <View style={styles.loadingRecommendations}>
                  <ActivityIndicator size="large" color="#FF6B9D" />
                  <Text style={styles.loadingRecommendationsText}>🧠 AI is thinking...</Text>
                </View>
              ) : recommendations.length > 0 ? (
                <View>
                  <Text style={styles.recommendationsSubtitle}>{getRecommendationTitle()}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                  >
                    {recommendations.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.recommendationCard}
                        onPress={() => setAsWallpaper(item.attributes.posterImage.original, item.attributes.canonicalTitle)}
                      >
                        <Image
                          source={{ uri: item.attributes.posterImage.medium }}
                          style={styles.recommendationImage}
                          resizeMode="cover"
                        />
                        <Text style={styles.recommendationTitle} numberOfLines={2}>
                          {item.attributes.canonicalTitle}
                        </Text>
                        {item.attributes.averageRating && (
                          <Text style={styles.recommendationRating}>
                            ⭐ {parseFloat(item.attributes.averageRating).toFixed(1)}
                          </Text>
                        )}
                        
                        {/* Quick Actions */}
                        <View style={styles.recommendationActions}>
                          <TouchableOpacity
                            style={styles.recommendationActionButton}
                            onPress={() => toggleFavorite(item)}
                          >
                            <Text style={styles.recommendationActionIcon}>
                              {isFavorited(item.id) ? '❤️' : '🤍'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.recommendationActionButton}
                            onPress={() => setAsWallpaper(item.attributes.posterImage.original, item.attributes.canonicalTitle)}
                          >
                            <Text style={styles.recommendationActionIcon}>📱</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.noRecommendations}>
                  <Text style={styles.noRecommendationsText}>
                    🤖 Tap a recommendation type above to get personalized suggestions!
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Categories */}
      {searchQuery.length === 0 && (
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {animeCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.name && styles.selectedCategory
                ]}
                onPress={() => fetchCategoryWallpapers(category.name)}
              >
                <View style={styles.categoryIcon}>
                  <Text style={{ fontSize: 20 }}>{category.icon}</Text>
                </View>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.name && styles.selectedCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search Results Header */}
      {searchQuery.length > 0 && !isSearching && (
        <View style={styles.searchResultsHeader}>
          <Text style={styles.searchResultsText}>
            {searchResults.length} results for "{searchQuery}"
          </Text>
          {searchResults.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Loading State */}
      {(loading || isSearching) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.loadingText}>
            {isSearching ? `Searching for "${searchQuery}"...` : 'Loading anime wallpapers...'}
          </Text>
        </View>
      )}

      {/* Anime Wallpapers Grid */}
      <FlatList
        data={searchQuery.length > 0 ? searchResults : animeWallpapers}
        renderItem={renderAnimeItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.wallpapersContainer}
        showsVerticalScrollIndicator={false}
        onRefresh={searchQuery.length > 0 ? undefined : fetchAnimeWallpapers}
        refreshing={loading}
        ListEmptyComponent={
          !loading && (searchQuery.length > 0 ? searchResults.length === 0 : animeWallpapers.length === 0) ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 0 ? `No results for "${searchQuery}"` : 'No wallpapers found'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery.length > 0 ? 'Try a different search term' : 'Pull down to refresh'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#000' : '#fff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingTop: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
    },
    subtitle: {
      fontSize: 16,
      color: isDarkMode ? '#888' : '#666',
      marginTop: 4,
    },
    refreshButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoriesSection: {
      marginBottom: 20,
    },
    categoryItem: {
      alignItems: 'center',
      marginRight: 20,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    selectedCategory: {
      backgroundColor: '#FF6B9D',
    },
    categoryIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
      textAlign: 'center',
    },
    selectedCategoryText: {
      color: '#fff',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: isDarkMode ? '#888' : '#666',
    },
    wallpapersContainer: {
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
    animeCard: {
      flex: 1,
      margin: 8,
      borderRadius: 16,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      overflow: 'hidden',
    },
    animeImage: {
      width: '100%',
      height: (width / 2) * 1.4, // Maintain anime poster aspect ratio
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    animeOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 8,
    },
    animeInfo: {
      flex: 1,
    },
    animeTitle: {
      fontSize: 13,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 2,
    },
    animeRating: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.8)',
    },
    actionButtons: {
      flexDirection: 'row',
      padding: 8,
    },
    button: {
      backgroundColor: '#FF6B9D',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    
    // Search styles
    searchContainer: {
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      borderRadius: 25,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 10,
    },
    searchIcon: {
      fontSize: 16,
      marginRight: 10,
      color: isDarkMode ? '#666' : '#999',
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
      padding: 0,
    },
    clearButton: {
      padding: 5,
    },
    clearButtonText: {
      color: isDarkMode ? '#666' : '#999',
      fontSize: 16,
      fontWeight: 'bold',
    },
    recentSearches: {
      maxHeight: 40,
    },
    recentSearchesLabel: {
      fontSize: 14,
      color: isDarkMode ? '#888' : '#666',
      alignSelf: 'center',
      marginRight: 10,
    },
    recentSearchItem: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#e5e5e5',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      marginRight: 8,
    },
    recentSearchText: {
      fontSize: 12,
      color: isDarkMode ? '#ccc' : '#555',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      marginTop: 60,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#888' : '#666',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: isDarkMode ? '#666' : '#999',
      textAlign: 'center',
    },
    searchResultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#eee',
    },
    searchResultsText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
    },
    clearSearchText: {
      fontSize: 14,
      color: '#FF6B9D',
      fontWeight: '600',
    },
    
    // Favorites styles
    favoriteButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    favoriteIcon: {
      fontSize: 20,
    },
    
    // AI Recommendations styles
    recommendationsSection: {
      marginVertical: 16,
    },
    recommendationsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    recommendationsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
    },
    recommendationsToggle: {
      padding: 8,
    },
    recommendationsToggleText: {
      fontSize: 16,
      color: isDarkMode ? '#888' : '#666',
    },
    recommendationTypes: {
      marginBottom: 16,
    },
    recommendationType: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f0f0f0',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    recommendationTypeActive: {
      backgroundColor: '#FF6B9D',
      borderColor: '#FF6B9D',
    },
    recommendationTypeIcon: {
      fontSize: 16,
      marginRight: 6,
    },
    recommendationTypeText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? '#888' : '#666',
    },
    recommendationTypeTextActive: {
      color: '#fff',
    },
    loadingRecommendations: {
      alignItems: 'center',
      padding: 40,
    },
    loadingRecommendationsText: {
      marginTop: 12,
      fontSize: 14,
      color: isDarkMode ? '#888' : '#666',
      fontStyle: 'italic',
    },
    recommendationsSubtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    recommendationCard: {
      width: 120,
      marginRight: 12,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
      borderRadius: 12,
      padding: 8,
    },
    recommendationImage: {
      width: '100%',
      height: 160,
      borderRadius: 8,
      marginBottom: 8,
    },
    recommendationTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 4,
    },
    recommendationRating: {
      fontSize: 10,
      color: '#FFD700',
      marginBottom: 8,
    },
    recommendationActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    recommendationActionButton: {
      padding: 6,
    },
    recommendationActionIcon: {
      fontSize: 16,
    },
    noRecommendations: {
      alignItems: 'center',
      padding: 32,
    },
    noRecommendationsText: {
      fontSize: 14,
      color: isDarkMode ? '#888' : '#666',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    heartAnimation: {
      position: 'absolute',
      top: '45%',
      left: '45%',
      zIndex: 1000,
      pointerEvents: 'none',
    },
    heartAnimationEmoji: {
      fontSize: 50,
      textShadowColor: 'rgba(0,0,0,0.75)',
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10,
    },
  });

export default AnimeWallpaperScreen;
